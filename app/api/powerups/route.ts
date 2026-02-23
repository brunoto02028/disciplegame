import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserPowerups, usePowerup, buyPowerup, POWERUPS } from '@/lib/powerups';

// GET: Get user's powerups inventory
export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const data = getUserPowerups(session.userId);

    return NextResponse.json({
        success: true,
        data: {
            inventory: POWERUPS.map(p => ({
                ...p,
                count: data.inventory[p.id] || 0,
            })),
        },
    });
}

// POST: Use or buy a powerup
export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const { action, powerupId } = await request.json();

    if (action === 'use') {
        const ok = usePowerup(session.userId, powerupId);
        if (!ok) return NextResponse.json({ success: false, error: 'Power-up indisponível' }, { status: 400 });
        return NextResponse.json({ success: true, data: { used: powerupId } });
    }

    if (action === 'buy') {
        const result = buyPowerup(session.userId, powerupId);
        if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        return NextResponse.json({ success: true, data: { bought: powerupId } });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
}
