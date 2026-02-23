import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserGamification, getLevelForXP, getLeagueForUser, claimDailyReward, getAllLevels } from '@/lib/gamification';

export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const data = getUserGamification(session.userId);
    const levelInfo = getLevelForXP(data.xp);
    const leagueInfo = getLeagueForUser(session.userId);
    const levels = getAllLevels();

    // Check if daily was already claimed today
    const today = new Date().toISOString().split('T')[0];
    const dailyClaimed = data.lastDailyAt === today;

    return NextResponse.json({
        success: true,
        data: {
            xp: data.xp,
            level: levelInfo.level,
            levelName: levelInfo.name,
            xpRequired: levelInfo.xpRequired,
            xpNext: levelInfo.xpNext,
            xpProgress: levelInfo.xpNext > levelInfo.xpRequired
                ? ((data.xp - levelInfo.xpRequired) / (levelInfo.xpNext - levelInfo.xpRequired)) * 100
                : 100,
            dailyStreak: data.dailyStreak,
            dailyClaimed,
            dailyCalendar: data.dailyCalendar.slice(-30),
            league: leagueInfo.league,
            leagueRank: leagueInfo.rank,
            leagueTotalPlayers: leagueInfo.totalInLeague,
            inviteCount: data.inviteCount,
            allLevels: levels,
        },
    });
}

// POST: Claim daily reward
export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const { action } = await request.json();

    if (action === 'claim_daily') {
        const result = claimDailyReward(session.userId);
        return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
}
