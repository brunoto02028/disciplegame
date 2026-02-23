// Duel system: async PvP challenges between players

const globalForDuels = globalThis as unknown as { __duels?: Map<string, Duel> };
if (!globalForDuels.__duels) globalForDuels.__duels = new Map();
export const duelStore = globalForDuels.__duels;

export interface DuelAnswer {
    questionId: string;
    selectedOption: string;
    correct: boolean;
    timeTaken: number;
}

export interface DuelPlayer {
    userId: string;
    userName: string;
    answers: DuelAnswer[];
    totalPoints: number;
    accuracy: number;
    completed: boolean;
    completedAt: Date | null;
}

export interface Duel {
    id: string;
    cityId: string;
    cityName: string;
    questionIds: string[];
    challenger: DuelPlayer;
    opponent: DuelPlayer | null;
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: Date;
    expiresAt: Date;
    winnerId: string | null;
}

export function createDuel(id: string, cityId: string, cityName: string, questionIds: string[], challengerId: string, challengerName: string): Duel {
    const duel: Duel = {
        id,
        cityId,
        cityName,
        questionIds: questionIds.slice(0, 5), // 5 questions per duel
        challenger: {
            userId: challengerId,
            userName: challengerName,
            answers: [],
            totalPoints: 0,
            accuracy: 0,
            completed: false,
            completedAt: null,
        },
        opponent: null,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        winnerId: null,
    };
    duelStore.set(id, duel);
    return duel;
}

export function joinDuel(duelId: string, userId: string, userName: string): Duel | null {
    const duel = duelStore.get(duelId);
    if (!duel) return null;
    if (duel.opponent) return null; // Already has opponent
    if (duel.challenger.userId === userId) return null; // Can't duel yourself

    duel.opponent = {
        userId,
        userName,
        answers: [],
        totalPoints: 0,
        accuracy: 0,
        completed: false,
        completedAt: null,
    };
    duel.status = 'in_progress';
    duelStore.set(duelId, duel);
    return duel;
}

export function submitDuelAnswer(duelId: string, userId: string, answer: DuelAnswer): boolean {
    const duel = duelStore.get(duelId);
    if (!duel) return false;

    const player = duel.challenger.userId === userId ? duel.challenger
        : duel.opponent?.userId === userId ? duel.opponent : null;
    if (!player) return false;
    if (player.completed) return false;

    player.answers.push(answer);

    // If all questions answered, mark complete
    if (player.answers.length >= duel.questionIds.length) {
        const correct = player.answers.filter(a => a.correct).length;
        player.totalPoints = correct * 200 + Math.max(0, 300 - player.answers.reduce((sum, a) => sum + a.timeTaken, 0));
        player.accuracy = Math.round((correct / player.answers.length) * 100);
        player.completed = true;
        player.completedAt = new Date();

        // Check if both completed
        if (duel.challenger.completed && duel.opponent?.completed) {
            duel.status = 'completed';
            if (duel.challenger.totalPoints > duel.opponent.totalPoints) {
                duel.winnerId = duel.challenger.userId;
            } else if (duel.opponent.totalPoints > duel.challenger.totalPoints) {
                duel.winnerId = duel.opponent.userId;
            } else {
                duel.winnerId = null; // Draw
            }
        }
    }

    duelStore.set(duelId, duel);
    return true;
}

export function getDuel(duelId: string): Duel | null {
    return duelStore.get(duelId) || null;
}

export function getUserDuels(userId: string): Duel[] {
    return Array.from(duelStore.values()).filter(d =>
        d.challenger.userId === userId || d.opponent?.userId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
