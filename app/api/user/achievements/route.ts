import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { computeAchievements } from '@/lib/achievements';

export async function GET(request: NextRequest) {
    try {
        const sessionToken = request.cookies.get('session')?.value;
        if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
        const userSession = getSession(sessionToken);
        if (!userSession) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

        const achievements = computeAchievements(userSession.userId);
        return NextResponse.json({ success: true, data: achievements });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Erro ao buscar conquistas' }, { status: 500 });
    }
}
