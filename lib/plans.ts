// Plans & Subscription system

const globalForPlans = globalThis as unknown as { __subscriptions?: Map<string, UserSubscription> };
if (!globalForPlans.__subscriptions) globalForPlans.__subscriptions = new Map();
export const subscriptionStore = globalForPlans.__subscriptions;

export interface Plan {
    id: string;
    name: string;
    type: 'free' | 'premium' | 'church';
    price: number; // BRL per month
    priceYearly: number; // BRL per year
    features: string[];
    highlighted?: boolean;
}

export interface UserSubscription {
    userId: string;
    planId: string;
    status: 'active' | 'canceled' | 'expired' | 'trial';
    startedAt: Date;
    expiresAt: Date;
    churchName?: string;
    churchMembers?: number;
}

export const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Peregrino',
        type: 'free',
        price: 0,
        priceYearly: 0,
        features: [
            'Acesso a 3 cidades',
            'Desafio diário',
            'Ranking global',
            'Sistema de XP e níveis',
            '1 power-up por tipo (starter)',
            'Certificado básico',
        ],
    },
    {
        id: 'premium',
        name: 'Discípulo Premium',
        type: 'premium',
        price: 14.90,
        priceYearly: 119.90,
        highlighted: true,
        features: [
            'Todas as cidades (atuais e futuras)',
            'Power-ups ilimitados',
            'Duelos ilimitados',
            'Certificado Premium personalizado',
            'Badge exclusivo no ranking',
            'XP bônus +50% em tudo',
            'Sem anúncios',
            'Acesso antecipado a novos conteúdos',
            'Salas de grupo ilimitadas',
            'Estatísticas detalhadas',
        ],
    },
    {
        id: 'church',
        name: 'Igreja / Instituição',
        type: 'church',
        price: 49.90,
        priceYearly: 399.90,
        features: [
            'Tudo do Premium para até 50 membros',
            'Painel administrativo da igreja',
            'Salas de EBD ilimitadas',
            'QR Codes personalizados',
            'Relatório de participação',
            'Ranking interno da igreja',
            'Certificados com logo da igreja',
            'Suporte prioritário',
            'Conteúdo exclusivo para igrejas',
            'API de integração',
        ],
    },
];

export function getUserSubscription(userId: string): UserSubscription | null {
    const sub = subscriptionStore.get(userId);
    if (!sub) return null;
    if (sub.status === 'active' && sub.expiresAt < new Date()) {
        sub.status = 'expired';
        subscriptionStore.set(userId, sub);
    }
    return sub;
}

export function getUserPlan(userId: string): Plan {
    const sub = getUserSubscription(userId);
    if (!sub || sub.status !== 'active') return PLANS[0]; // Free
    return PLANS.find(p => p.id === sub.planId) || PLANS[0];
}

export function isPremium(userId: string): boolean {
    const plan = getUserPlan(userId);
    return plan.type !== 'free';
}

export function startSubscription(userId: string, planId: string, months: number = 1, churchName?: string): UserSubscription {
    const sub: UserSubscription = {
        userId,
        planId,
        status: 'active',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
        churchName,
        churchMembers: planId === 'church' ? 50 : undefined,
    };
    subscriptionStore.set(userId, sub);
    return sub;
}

export function cancelSubscription(userId: string): boolean {
    const sub = subscriptionStore.get(userId);
    if (!sub) return false;
    sub.status = 'canceled';
    subscriptionStore.set(userId, sub);
    return true;
}

export function startTrial(userId: string, planId: string): UserSubscription {
    const sub: UserSubscription = {
        userId,
        planId,
        status: 'trial',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    subscriptionStore.set(userId, sub);
    return sub;
}
