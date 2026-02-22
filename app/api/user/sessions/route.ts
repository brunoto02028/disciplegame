import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mockDb';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const sessionToken = request.cookies.get('session')?.value;
        if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
        const userSession = getSession(sessionToken);
        if (!userSession) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

        const sessions: any[] = [];
        for (const s of mockStore.gameSessions.values()) {
            if (s.user_id !== userSession.userId) continue;
            sessions.push({
                id: s.id,
                circuit_id: s.circuit_id,
                status: s.status,
                startedAt: s.started_at,
                completedAt: s.completed_at,
                total_points: s.total_points,
                accuracy_percentage: s.accuracy_percentage,
                total_time_seconds: s.total_time_seconds,
                cityName: 'Circuito MVP',
            });
        }

        sessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

        return NextResponse.json({ success: true, data: sessions.slice(0, 20) });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Erro ao buscar sessões' }, { status: 500 });
    }
}
