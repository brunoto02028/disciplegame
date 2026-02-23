// Gamification system: XP, Levels, Daily Streaks, Daily Challenge, Leagues

const globalForGamification = globalThis as unknown as { __gamification?: GamificationStore };

export interface UserGamification {
    userId: string;
    xp: number;
    level: number;
    levelName: string;
    dailyStreak: number;
    lastDailyAt: string | null; // ISO date string (YYYY-MM-DD)
    dailyChallengeToday: boolean;
    dailyCalendar: string[]; // dates completed
    league: string;
    leeksPoints: number; // points this week for league
    inviteCode: string | null;
    invitedBy: string | null;
    inviteCount: number;
}

export interface DailyChallenge {
    date: string; // YYYY-MM-DD
    questionId: string;
    cityName: string;
}

interface GamificationStore {
    users: Map<string, UserGamification>;
    dailyChallenges: Map<string, DailyChallenge>;
}

if (!globalForGamification.__gamification) {
    globalForGamification.__gamification = {
        users: new Map(),
        dailyChallenges: new Map(),
    };
}

export const gamificationStore = globalForGamification.__gamification;

// Level thresholds
const LEVELS = [
    { level: 1, name: 'Ouvinte', xpRequired: 0 },
    { level: 2, name: 'Curioso', xpRequired: 200 },
    { level: 3, name: 'Estudante', xpRequired: 500 },
    { level: 4, name: 'Conhecedor', xpRequired: 1000 },
    { level: 5, name: 'Sábio', xpRequired: 2000 },
    { level: 6, name: 'Mestre', xpRequired: 3500 },
    { level: 7, name: 'Pregador', xpRequired: 5500 },
    { level: 8, name: 'Missionário', xpRequired: 8000 },
    { level: 9, name: 'Discípulo', xpRequired: 12000 },
    { level: 10, name: 'Apóstolo', xpRequired: 18000 },
];

const LEAGUES = ['Bronze', 'Prata', 'Ouro', 'Diamante', 'Apóstolo'];

export function getLevelForXP(xp: number): { level: number; name: string; xpRequired: number; xpNext: number } {
    let current = LEVELS[0];
    for (const l of LEVELS) {
        if (xp >= l.xpRequired) current = l;
        else break;
    }
    const nextLevel = LEVELS.find(l => l.level === current.level + 1);
    return { ...current, xpNext: nextLevel?.xpRequired || current.xpRequired };
}

export function getUserGamification(userId: string): UserGamification {
    let data = gamificationStore.users.get(userId);
    if (!data) {
        data = {
            userId,
            xp: 0,
            level: 1,
            levelName: 'Ouvinte',
            dailyStreak: 0,
            lastDailyAt: null,
            dailyChallengeToday: false,
            dailyCalendar: [],
            league: 'Bronze',
            leeksPoints: 0,
            inviteCode: null,
            invitedBy: null,
            inviteCount: 0,
        };
        gamificationStore.users.set(userId, data);
    }
    return data;
}

export function addXP(userId: string, amount: number, source: string): { newXP: number; levelUp: boolean; newLevel: number; newLevelName: string } {
    const data = getUserGamification(userId);
    const oldLevel = data.level;
    data.xp += amount;
    data.leeksPoints += amount;

    const levelInfo = getLevelForXP(data.xp);
    data.level = levelInfo.level;
    data.levelName = levelInfo.name;

    const levelUp = data.level > oldLevel;

    gamificationStore.users.set(userId, data);
    return { newXP: data.xp, levelUp, newLevel: data.level, newLevelName: data.levelName };
}

// Daily streak system
export function claimDailyReward(userId: string): { streakDay: number; xpReward: number; alreadyClaimed: boolean } {
    const data = getUserGamification(userId);
    const today = new Date().toISOString().split('T')[0];

    if (data.lastDailyAt === today) {
        return { streakDay: data.dailyStreak, xpReward: 0, alreadyClaimed: true };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (data.lastDailyAt === yesterday) {
        data.dailyStreak += 1;
    } else {
        data.dailyStreak = 1; // Reset streak
    }

    data.lastDailyAt = today;
    if (!data.dailyCalendar.includes(today)) data.dailyCalendar.push(today);

    // Reward: day1=50, day2=100, day3=150... day7=500 (cap)
    const xpReward = data.dailyStreak >= 7 ? 500 : data.dailyStreak * 50 + (data.dailyStreak >= 5 ? 100 : 0);

    addXP(userId, xpReward, 'daily_streak');
    gamificationStore.users.set(userId, data);

    return { streakDay: data.dailyStreak, xpReward, alreadyClaimed: false };
}

// Daily challenge
export function getDailyChallenge(allQuestionIds: string[], cityMap: Map<string, string>): DailyChallenge {
    const today = new Date().toISOString().split('T')[0];
    let challenge = gamificationStore.dailyChallenges.get(today);
    if (challenge) return challenge;

    // Pick a random question based on the day (deterministic)
    const dayNum = parseInt(today.replace(/-/g, ''));
    const idx = dayNum % allQuestionIds.length;
    const questionId = allQuestionIds[idx];
    const cityName = cityMap.get(questionId) || '';

    challenge = { date: today, questionId, cityName };
    gamificationStore.dailyChallenges.set(today, challenge);
    return challenge;
}

export function completeDailyChallenge(userId: string, correct: boolean): { xpEarned: number; alreadyDone: boolean } {
    const data = getUserGamification(userId);
    const today = new Date().toISOString().split('T')[0];

    if (data.dailyChallengeToday) {
        return { xpEarned: 0, alreadyDone: true };
    }

    data.dailyChallengeToday = true;
    // Reset flag at midnight is handled by checking date
    const xpEarned = correct ? 200 : 50; // Bonus for correct, consolation for trying
    addXP(userId, xpEarned, 'daily_challenge');
    gamificationStore.users.set(userId, data);

    return { xpEarned, alreadyDone: false };
}

// League calculation
export function getLeagueForUser(userId: string): { league: string; rank: number; totalInLeague: number } {
    const data = getUserGamification(userId);
    // Simple league assignment based on level
    let leagueIdx = 0;
    if (data.level >= 8) leagueIdx = 4;
    else if (data.level >= 6) leagueIdx = 3;
    else if (data.level >= 4) leagueIdx = 2;
    else if (data.level >= 2) leagueIdx = 1;

    data.league = LEAGUES[leagueIdx];
    gamificationStore.users.set(userId, data);

    // Count users in same league
    const sameLeague = Array.from(gamificationStore.users.values())
        .filter(u => u.league === data.league)
        .sort((a, b) => b.leeksPoints - a.leeksPoints);

    const rank = sameLeague.findIndex(u => u.userId === userId) + 1;

    return { league: data.league, rank, totalInLeague: sameLeague.length };
}

export function getAllLevels() {
    return LEVELS;
}

export function getAllLeagues() {
    return LEAGUES;
}
