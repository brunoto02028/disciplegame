import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mockDb';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(request: NextRequest) {
    return isValidSession(request.cookies.get('admin_session')?.value);
}

export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const totalUsers = mockStore.users.size;
    const totalQuestions = mockStore.questions.size;
    const totalCities = mockStore.cities.size;
    const totalSessions = mockStore.gameSessions.size;
    const completedSessions = Array.from(mockStore.gameSessions.values()).filter(s => s.status === 'completed').length;
    const totalAnswers = mockStore.userAnswers.size;
    const correctAnswers = Array.from(mockStore.userAnswers.values()).filter(a => a.is_correct).length;
    const globalAccuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const avgPoints = completedSessions > 0
        ? Math.round(Array.from(mockStore.gameSessions.values()).filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total_points, 0) / completedSessions)
        : 0;

    // Most played city
    const cityPlayCount: Record<string, number> = {};
    for (const a of mockStore.userAnswers.values()) {
        const q = mockStore.questions.get(a.question_id);
        if (q) cityPlayCount[q.city_id] = (cityPlayCount[q.city_id] || 0) + 1;
    }
    const topCityId = Object.entries(cityPlayCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCity = topCityId ? mockStore.cities.get(topCityId)?.name : '—';

    return NextResponse.json({
        success: true,
        data: { totalUsers, totalQuestions, totalCities, totalSessions, completedSessions, totalAnswers, globalAccuracy, avgPoints, topCity },
    });
}
