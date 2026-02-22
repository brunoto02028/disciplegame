import { mockStore } from './mockDb';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_step',      name: 'Primeiro Passo',       icon: '👣', points: 50,  description: 'Complete sua primeira partida.' },
    { id: 'perfect_city',    name: 'Perfeito',             icon: '💎', points: 200, description: 'Acerte 100% das perguntas em uma cidade.' },
    { id: 'speedster',       name: 'Velocista',            icon: '⚡', points: 150, description: 'Complete uma cidade em menos de 3 minutos.' },
    { id: 'jerusalem_done',  name: 'Cidade Santa',         icon: '✡️', points: 100, description: 'Complete Jerusalém.' },
    { id: 'ephesus_done',    name: 'Apóstolo do Oriente',  icon: '🏛️', points: 100, description: 'Complete Éfeso.' },
    { id: 'malta_done',      name: 'Sobrevivente',         icon: '🐍', points: 100, description: 'Complete Malta.' },
    { id: 'all_cities',      name: 'Circuito Completo',    icon: '🗺️', points: 500, description: 'Complete todas as cidades do MVP.' },
    { id: 'streak_5',        name: 'Em Chamas',            icon: '🔥', points: 100, description: 'Acerte 5 perguntas seguidas em uma partida.' },
    { id: 'high_score',      name: 'Lendário',             icon: '👑', points: 300, description: 'Alcance 1.200 pontos em uma partida.' },
    { id: 'comeback',        name: 'Persistente',          icon: '💪', points: 75,  description: 'Jogue 3 partidas ou mais.' },
];

export function computeAchievements(userId: string): Array<Achievement & { unlocked: boolean; unlockedAt?: Date }> {
    const userSessions = Array.from(mockStore.gameSessions.values()).filter(s => s.user_id === userId);
    const userAnswers = Array.from(mockStore.userAnswers.values()).filter(a => a.user_id === userId);
    const completedSessions = userSessions.filter(s => s.status === 'completed');

    const unlockedIds = new Set<string>();

    // first_step
    if (completedSessions.length >= 1) unlockedIds.add('first_step');

    // perfect_city — 100% accuracy in any session
    if (completedSessions.some(s => s.accuracy_percentage === 100)) unlockedIds.add('perfect_city');

    // speedster — completed in < 3 min
    if (completedSessions.some(s => s.total_time_seconds < 180)) unlockedIds.add('speedster');

    // city-specific — check answered questions per city
    const answeredQIds = new Set(userAnswers.map(a => a.question_id));
    const cityQuestionMap: Record<string, string[]> = {};
    for (const q of mockStore.questions.values()) {
        if (!cityQuestionMap[q.city_id]) cityQuestionMap[q.city_id] = [];
        cityQuestionMap[q.city_id].push(q.id);
    }
    const allCityIds = ['city-jerusalem-001', 'city-efeso-002', 'city-malta-003'];
    const completedCities = allCityIds.filter(cid => {
        const qs = cityQuestionMap[cid] || [];
        return qs.length > 0 && qs.every(qid => answeredQIds.has(qid));
    });
    if (completedCities.includes('city-jerusalem-001')) unlockedIds.add('jerusalem_done');
    if (completedCities.includes('city-efeso-002')) unlockedIds.add('ephesus_done');
    if (completedCities.includes('city-malta-003')) unlockedIds.add('malta_done');
    if (completedCities.length === 3) unlockedIds.add('all_cities');

    // streak_5 — 5 consecutive correct answers in any session
    for (const session of completedSessions) {
        const sessionAnswers = userAnswers
            .filter(a => a.session_id === session.id)
            .sort((a, b) => new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime());
        let streak = 0;
        for (const ans of sessionAnswers) {
            if (ans.is_correct) { streak++; if (streak >= 5) { unlockedIds.add('streak_5'); break; } }
            else streak = 0;
        }
    }

    // high_score
    if (completedSessions.some(s => s.total_points >= 1200)) unlockedIds.add('high_score');

    // comeback — 3+ sessions played
    if (userSessions.length >= 3) unlockedIds.add('comeback');

    return ALL_ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: unlockedIds.has(a.id),
    }));
}
