import { NextRequest, NextResponse } from 'next/server';
import { mockStore, generateId } from '@/lib/mockDb';
import { createSession, hashPassword } from '@/lib/auth';

// POST: Handle Google OAuth token validation and login/register
// In production, this would validate the Google ID token with Google's API
// For now, it simulates the flow using the Google user info
export async function POST(request: NextRequest) {
    try {
        const { credential, clientId } = await request.json();

        // In production: validate the JWT token with Google
        // const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
        // const payload = ticket.getPayload();

        // For MVP: decode the base64 payload from the credential (simulated)
        // In real implementation, use google-auth-library to verify
        let googleUser: { email: string; name: string; picture?: string; sub: string };

        try {
            // Try to decode JWT payload (middle part)
            const parts = credential.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                googleUser = {
                    email: payload.email,
                    name: payload.name || payload.email.split('@')[0],
                    picture: payload.picture,
                    sub: payload.sub,
                };
            } else {
                // Fallback for simulated tokens
                googleUser = {
                    email: credential + '@gmail.com',
                    name: 'Google User',
                    sub: credential,
                };
            }
        } catch {
            return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 400 });
        }

        // Check if user exists
        let existingUser = null;
        for (const user of mockStore.users.values()) {
            if (user.email === googleUser.email) {
                existingUser = user;
                break;
            }
        }

        let userId: string;
        let userName: string;

        if (existingUser) {
            // Login existing user
            userId = existingUser.id;
            userName = existingUser.name;
        } else {
            // Register new user
            userId = generateId();
            const passwordHash = await hashPassword('google_oauth_' + googleUser.sub);
            mockStore.users.set(userId, {
                id: userId,
                email: googleUser.email.toLowerCase(),
                name: googleUser.name,
                password_hash: passwordHash,
                country: '',
                church: '',
                created_at: new Date(),
            });
            userName = googleUser.name;
        }

        // Create session
        const token = createSession(userId, googleUser.email, userName);

        const response = NextResponse.json({
            success: true,
            data: { userId, name: userName, email: googleUser.email, isNewUser: !existingUser },
        });

        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Google auth error:', error);
        return NextResponse.json({ success: false, error: 'Erro na autenticação Google' }, { status: 500 });
    }
}
