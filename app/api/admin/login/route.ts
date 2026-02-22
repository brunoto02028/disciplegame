import { NextRequest, NextResponse } from 'next/server';
import { createSession, destroySession } from '@/lib/adminSession';
import { sendVerificationCode } from '@/lib/email';
import crypto from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';

// ── Rate limiting (in-memory) ──
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// ── Pending email verification codes ──
const pendingCodes = new Map<string, { code: string; email: string; expiresAt: number; password: string }>();
const CODE_TTL = 5 * 60 * 1000; // 5 minutes

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

function generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
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
        const body = await request.json();
        const { email, password, verification_code, step, remember } = body;

        // ── Step 1: Verify email + password ──
        if (step === 'credentials') {
            if (!email || !password) {
                return NextResponse.json({ success: false, error: 'Email e senha são obrigatórios' }, { status: 400 });
            }

            if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
                return NextResponse.json(
                    { success: false, error: 'Email ou senha incorretos', remaining: rateCheck.remaining },
                    { status: 401 }
                );
            }

            // Generate and send verification code
            const code = generateCode();
            const codeId = crypto.randomBytes(16).toString('hex');
            pendingCodes.set(codeId, {
                code,
                email,
                password,
                expiresAt: Date.now() + CODE_TTL,
            });

            // Auto-cleanup expired codes
            setTimeout(() => pendingCodes.delete(codeId), CODE_TTL + 1000);

            const emailSent = await sendVerificationCode(email, code);

            if (!emailSent) {
                // If email sending fails, skip verification and grant access directly
                console.warn('[LOGIN] Email not configured — granting direct access');
                resetRateLimit(ip);
                const sessionToken = createSession(remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000);
                const response = NextResponse.json({ success: true, message: 'Login realizado!' });
                response.cookies.set('admin_session', sessionToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: remember ? 30 * 24 * 60 * 60 : 8 * 60 * 60,
                    path: '/',
                });
                return response;
            }

            return NextResponse.json({
                success: true,
                step: 'verify_email',
                code_id: codeId,
                message: `Código enviado para ${email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
            });
        }

        // ── Step 2: Verify email code ──
        if (step === 'verify_code') {
            const { code_id } = body;
            if (!code_id || !verification_code) {
                return NextResponse.json({ success: false, error: 'Código de verificação obrigatório' }, { status: 400 });
            }

            const pending = pendingCodes.get(code_id);
            if (!pending) {
                return NextResponse.json({ success: false, error: 'Código expirado. Faça login novamente.' }, { status: 401 });
            }

            if (Date.now() > pending.expiresAt) {
                pendingCodes.delete(code_id);
                return NextResponse.json({ success: false, error: 'Código expirado. Faça login novamente.' }, { status: 401 });
            }

            if (pending.code !== verification_code) {
                return NextResponse.json(
                    { success: false, error: 'Código incorreto', remaining: rateCheck.remaining },
                    { status: 401 }
                );
            }

            // Code verified — grant access
            pendingCodes.delete(code_id);
            resetRateLimit(ip);
            const sessionToken = createSession(remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000);

            const response = NextResponse.json({ success: true, message: 'Login realizado com sucesso!' });
            response.cookies.set('admin_session', sessionToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: remember ? 30 * 24 * 60 * 60 : 8 * 60 * 60,
                path: '/',
            });
            return response;
        }

        return NextResponse.json({ success: false, error: 'Step inválido' }, { status: 400 });
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
