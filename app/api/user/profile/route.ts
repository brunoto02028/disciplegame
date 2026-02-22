import { NextRequest, NextResponse } from 'next/server';
import { mockStore, getUserStats } from '@/lib/mockDb';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

        const user = mockStore.users.get(session.userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        const stats = getUserStats(session.userId);

        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                country: user.country,
                church: user.church,
                created_at: user.created_at,
                stats: {
                    totalSessions: stats.totalSessions,
                    completedSessions: stats.completedSessions,
                    avgAccuracy: stats.avgAccuracy,
                    totalPoints: stats.totalPoints,
                    totalAchievements: stats.totalAchievements,
                },
            },
        });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar perfil' },
            { status: 500 }
        );
    }
}
