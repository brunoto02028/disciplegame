import { NextRequest, NextResponse } from 'next/server';
import { mockStore, generateId } from '@/lib/mockDb';
import { getSession } from '@/lib/auth';

// In-memory invite tracking
const globalForInvites = globalThis as unknown as { __invites?: Map<string, { referrerId: string; code: string; usedBy: string[] }> };
if (!globalForInvites.__invites) globalForInvites.__invites = new Map();
export const inviteStore = globalForInvites.__invites;

// GET: Get or create invite code for current user
export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const user = mockStore.users.get(session.userId);
    if (!user) return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });

    // Find existing invite or create new one
    let invite = Array.from(inviteStore.values()).find(i => i.referrerId === session.userId);
    if (!invite) {
        const code = user.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) + Math.random().toString(36).slice(2, 5).toUpperCase();
        invite = { referrerId: session.userId, code, usedBy: [] };
        inviteStore.set(code, invite);
    }

    return NextResponse.json({
        success: true,
        data: {
            code: invite.code,
            link: `https://disciplegame.com/invite/${invite.code}`,
            totalInvited: invite.usedBy.length,
            bonusEarned: invite.usedBy.length * 500,
        },
    });
}

// POST: Redeem an invite code during registration
export async function POST(request: NextRequest) {
    try {
        const { code, userId } = await request.json();
        if (!code || !userId) return NextResponse.json({ success: false, error: 'Código e userId obrigatórios' }, { status: 400 });

        const invite = inviteStore.get(code.toUpperCase());
        if (!invite) return NextResponse.json({ success: false, error: 'Código de convite inválido' }, { status: 404 });
        if (invite.referrerId === userId) return NextResponse.json({ success: false, error: 'Não pode usar seu próprio convite' }, { status: 400 });
        if (invite.usedBy.includes(userId)) return NextResponse.json({ success: false, error: 'Convite já utilizado' }, { status: 400 });

        invite.usedBy.push(userId);

        return NextResponse.json({
            success: true,
            data: { bonusPoints: 500, referrerBonus: 500 },
        });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao processar convite' }, { status: 500 });
    }
}
