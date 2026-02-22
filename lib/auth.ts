import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Simple session token generation (in production, use proper JWT)
export function generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Session storage (in-memory for MVP - move to Redis/DB in production)
interface Session {
    userId: string;
    email: string;
    name: string;
    createdAt: Date;
}

const sessions = new Map<string, Session>();

export function createSession(userId: string, email: string, name: string): string {
    const token = generateSessionToken();
    sessions.set(token, {
        userId,
        email,
        name,
        createdAt: new Date(),
    });
    return token;
}

export function getSession(token: string): Session | null {
    return sessions.get(token) || null;
}

export function deleteSession(token: string): void {
    sessions.delete(token);
}

// Clean old sessions (older than 24 hours)
export function cleanExpiredSessions(): void {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    for (const [token, session] of sessions.entries()) {
        if (now - session.createdAt.getTime() > DAY_MS) {
            sessions.delete(token);
        }
    }
}

// Run cleanup every hour
if (typeof window === 'undefined') {
    setInterval(cleanExpiredSessions, 60 * 60 * 1000);
}
