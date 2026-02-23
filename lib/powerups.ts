// Power-ups system for the game

const globalForPowerups = globalThis as unknown as { __powerups?: Map<string, UserPowerups> };
if (!globalForPowerups.__powerups) globalForPowerups.__powerups = new Map();
export const powerupStore = globalForPowerups.__powerups;

export interface PowerupType {
    id: string;
    name: string;
    description: string;
    icon: string;
    cost: number; // XP cost to purchase
}

export interface UserPowerups {
    userId: string;
    inventory: Record<string, number>; // powerupId -> count
}

export const POWERUPS: PowerupType[] = [
    { id: 'eliminate2', name: 'Eliminar 2', description: 'Remove 2 opções incorretas', icon: '🚫', cost: 150 },
    { id: 'extra_time', name: 'Mais Tempo', description: '+15 segundos para responder', icon: '⏰', cost: 100 },
    { id: 'skip', name: 'Pular', description: 'Pula a pergunta sem perder pontos', icon: '⏭️', cost: 200 },
    { id: 'double_xp', name: 'XP Dobrado', description: 'Dobra o XP ganho nesta pergunta', icon: '✨', cost: 250 },
];

export function getUserPowerups(userId: string): UserPowerups {
    let data = powerupStore.get(userId);
    if (!data) {
        // Give new users 1 of each powerup as starter pack
        data = {
            userId,
            inventory: { eliminate2: 1, extra_time: 1, skip: 1, double_xp: 0 },
        };
        powerupStore.set(userId, data);
    }
    return data;
}

export function usePowerup(userId: string, powerupId: string): boolean {
    const data = getUserPowerups(userId);
    if (!data.inventory[powerupId] || data.inventory[powerupId] <= 0) return false;
    data.inventory[powerupId]--;
    powerupStore.set(userId, data);
    return true;
}

export function buyPowerup(userId: string, powerupId: string): { success: boolean; error?: string } {
    const powerup = POWERUPS.find(p => p.id === powerupId);
    if (!powerup) return { success: false, error: 'Power-up não encontrado' };

    // We import gamification lazily to avoid circular deps
    const { getUserGamification, gamificationStore } = require('./gamification');
    const gam = getUserGamification(userId);
    if (gam.xp < powerup.cost) return { success: false, error: 'XP insuficiente' };

    // Deduct XP
    gam.xp -= powerup.cost;
    gamificationStore.users.set(userId, gam);

    // Add to inventory
    const data = getUserPowerups(userId);
    data.inventory[powerupId] = (data.inventory[powerupId] || 0) + 1;
    powerupStore.set(userId, data);

    return { success: true };
}

export function getPowerupById(id: string): PowerupType | undefined {
    return POWERUPS.find(p => p.id === id);
}
