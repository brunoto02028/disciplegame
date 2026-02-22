import { NextRequest, NextResponse } from 'next/server';
import { mockStore, generateId } from '@/lib/mockDb';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const sessionToken = request.cookies.get('session')?.value;
        if (!sessionToken) {
            return NextResponse.json(
                { success: false, error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const session = getSession(sessionToken);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Sessão inválida' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { circuitId } = body;

        if (!circuitId) {
            return NextResponse.json(
                { success: false, error: 'Circuit ID é obrigatório' },
                { status: 400 }
            );
        }

        const id = generateId();
        const startedAt = new Date();

        mockStore.gameSessions.set(id, {
            id,
            user_id: session.userId,
            circuit_id: circuitId,
            status: 'in_progress',
            started_at: startedAt,
            completed_at: null,
            total_points: 0,
            accuracy_percentage: 0,
            total_time_seconds: 0,
        });

        return NextResponse.json({
            success: true,
            data: {
                sessionId: id,
                userId: session.userId,
                circuitId,
                startedAt,
            },
        });
    } catch (error) {
        console.error('Erro ao iniciar sessão:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao iniciar jogo' },
            { status: 500 }
        );
    }
}
