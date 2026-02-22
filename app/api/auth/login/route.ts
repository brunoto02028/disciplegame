import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/mockDb';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        const user = getUserByEmail(email);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        const sessionToken = createSession(user.id, user.email, user.name);

        const response = NextResponse.json({
            success: true,
            data: { id: user.id, email: user.email, name: user.name },
            message: 'Login realizado com sucesso!',
        });

        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Erro no login:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao fazer login. Tente novamente.' },
            { status: 500 }
        );
    }
}
