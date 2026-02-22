import crypto from 'crypto';

// ── Active sessions store (persists across hot-reloads in dev) ──
const globalForSessions = globalThis as unknown as { __adminSessions?: Set<string> };
if (!globalForSessions.__adminSessions) {
    globalForSessions.__adminSessions = new Set<string>();
}
export const activeSessions = globalForSessions.__adminSessions;

// ── Generate secure session token ──
export function generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// ── Verify a session token ──
export function isValidSession(token: string | undefined): boolean {
    if (!token) return false;
    return activeSessions.has(token);
}

// ── Create session with auto-expiry ──
export function createSession(maxAgeMs = 8 * 60 * 60 * 1000): string {
    const token = generateSessionToken();
    activeSessions.add(token);
    setTimeout(() => activeSessions.delete(token), maxAgeMs);
    return token;
}

// ── Destroy session ──
export function destroySession(token: string) {
    activeSessions.delete(token);
}
