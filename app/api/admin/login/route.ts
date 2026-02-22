import { NextRequest, NextResponse } from 'next/server';
import { verifyTOTP } from '@/lib/totp';
import { createSession, destroySession } from '@/lib/adminSession';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';
const ADMIN_TOTP_SECRET = process.env.ADMIN_TOTP_SECRET || '';

// ── Rate limiting (in-memory) ──
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIP(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterSec: number } {
    const now = Date.now();
    const entry = loginAttempts.get(ip);
    if (!entry || now - entry.firstAttempt > WINDOW_MS) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now });
        return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterSec: 0 };
    }
    if (entry.count >= MAX_ATTEMPTS) {
        const retryAfterSec = Math.ceil((WINDOW_MS - (now - entry.firstAttempt)) / 1000);
        return { allowed: false, remaining: 0, retryAfterSec };
    }
    entry.count++;
    return { allowed: true, remaining: MAX_ATTEMPTS - entry.count, retryAfterSec: 0 };
}

function resetRateLimit(ip: string) {
    loginAttempts.delete(ip);
}


export async function POST(request: NextRequest) {
    const ip = getClientIP(request);
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
        return NextResponse.json(
            { success: false, error: `Muitas tentativas. Tente novamente em ${Math.ceil(rateCheck.retryAfterSec / 60)} minutos.` },
            { status: 429 }
        );
    }

    try {
        const { password, totp_code, step } = await request.json();

        // Step 1: Verify password
        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, error: 'Credenciais inválidas', remaining: rateCheck.remaining },
                { status: 401 }
            );
        }

        // If TOTP is configured, require 2FA
        if (ADMIN_TOTP_SECRET) {
            // Step 1 response: password OK, need TOTP
            if (step === 'password' || !totp_code) {
                return NextResponse.json({ success: true, step: 'totp', message: 'Senha verificada. Insira o código 2FA.' });
            }

            // Step 2: Verify TOTP code
            if (!verifyTOTP(ADMIN_TOTP_SECRET, totp_code)) {
                return NextResponse.json(
                    { success: false, error: 'Código 2FA inválido', remaining: rateCheck.remaining },
                    { status: 401 }
                );
            }
        }

        // All verified — create secure session
        resetRateLimit(ip);
        const sessionToken = createSession();

        const response = NextResponse.json({ success: true, message: 'Login realizado com sucesso!' });
        response.cookies.set('admin_session', sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 8,
            path: '/',
        });
        return response;
    } catch {
        return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (sessionToken) destroySession(sessionToken);
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');
    return response;
}
