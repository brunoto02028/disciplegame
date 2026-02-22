import { NextRequest, NextResponse } from 'next/server';
import { mockStore, getUserByEmail, generateId } from '@/lib/mockDb';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password, country, church } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'Nome, email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'A senha deve ter pelo menos 6 caracteres' },
                { status: 400 }
            );
        }

        const existingUser = getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Este email já está cadastrado' },
                { status: 409 }
            );
        }

        const passwordHash = await hashPassword(password);
        const id = generateId();

        mockStore.users.set(id, {
            id,
            email: email.toLowerCase(),
            name,
            password_hash: passwordHash,
            country: country || null,
            church: church || null,
            created_at: new Date(),
        });

        return NextResponse.json({
            success: true,
            data: { id, email: email.toLowerCase(), name },
            message: 'Conta criada com sucesso!',
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao criar conta. Tente novamente.' },
            { status: 500 }
        );
    }
}
