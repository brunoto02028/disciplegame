import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mockDb';

function requireAdmin(req: NextRequest) {
    return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const users = Array.from(mockStore.users.values()).map(u => {
        const sessions = Array.from(mockStore.gameSessions.values()).filter(s => s.user_id === u.id);
        const completed = sessions.filter(s => s.status === 'completed');
        const totalPoints = completed.reduce((sum, s) => sum + s.total_points, 0);
        const answers = Array.from(mockStore.userAnswers.values()).filter(a => a.user_id === u.id);
        const accuracy = answers.length > 0 ? Math.round((answers.filter(a => a.is_correct).length / answers.length) * 100) : 0;
        return {
            id: u.id, name: u.name, email: u.email, country: u.country, church: u.church,
            createdAt: u.created_at,
            totalSessions: sessions.length, completedSessions: completed.length,
            totalPoints, accuracy,
        };
    });

    users.sort((a, b) => b.totalPoints - a.totalPoints);
    return NextResponse.json({ success: true, data: users });
}
