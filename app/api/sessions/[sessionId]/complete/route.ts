import { NextRequest, NextResponse } from 'next/server';
import { mockStore, getAnswersBySession, getRankings, generateId } from '@/lib/mockDb';
import { getSession } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const sessionToken = request.cookies.get('session')?.value;
        if (!sessionToken) {
            return NextResponse.json(
                { success: false, error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const userSession = getSession(sessionToken);
        if (!userSession) {
            return NextResponse.json(
                { success: false, error: 'Sessão inválida' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { totalTimeSeconds } = body;

        const answers = getAnswersBySession(sessionId);
        const totalQuestions = answers.length;
        const correctAnswers = answers.filter(a => a.is_correct).length;
        const accuracyPercentage = totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0;

        const speedBonus = Math.max(0, 500 - Math.floor(totalTimeSeconds / 60));
        const totalPoints = Math.round((accuracyPercentage / 100) * 1000) + speedBonus;

        // Atualizar game session
        const gameSession = mockStore.gameSessions.get(sessionId);
        if (gameSession) {
            gameSession.status = 'completed';
            gameSession.completed_at = new Date();
            gameSession.total_points = totalPoints;
            gameSession.accuracy_percentage = accuracyPercentage;
            gameSession.total_time_seconds = totalTimeSeconds;
        }

        // Atualizar ranking (manter melhor pontuação)
        const circuitId = gameSession?.circuit_id || '';
        const rankingKey = `${userSession.userId}-${circuitId}`;
        const existingRanking = mockStore.rankings.get(rankingKey);

        if (!existingRanking || totalPoints > existingRanking.total_points) {
            mockStore.rankings.set(rankingKey, {
                id: rankingKey,
                user_id: userSession.userId,
                circuit_id: circuitId,
                total_points: totalPoints,
                accuracy_percentage: accuracyPercentage,
                total_time_seconds: totalTimeSeconds,
                completed_at: new Date(),
            });
        }

        // Calcular rank atual
        const allRankings = getRankings(circuitId);
        const userRank = allRankings.find(r => r.user_id === userSession.userId);

        return NextResponse.json({
            success: true,
            data: {
                totalPoints,
                accuracyPercentage,
                totalTimeSeconds,
                correctAnswers,
                totalQuestions,
                rank: userRank?.rank || 1,
            },
        });
    } catch (error) {
        console.error('Erro ao completar sessão:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao finalizar jogo' },
            { status: 500 }
        );
    }
}
