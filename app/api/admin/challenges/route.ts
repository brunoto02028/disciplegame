import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/mockDb';

function requireAdmin(req: NextRequest) {
    return req.cookies.get('admin_session')?.value === 'authenticated';
}

// In-memory store for challenges (will migrate to Supabase)
export const challengeStore = new Map<string, any>();

export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    const challenges = Array.from(challengeStore.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ success: true, data: challenges });
}

export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    try {
        const body = await request.json();
        const { title, description, cityId, targetAccuracy, bonusPoints, endDate } = body;
        if (!title || !cityId || !bonusPoints || !endDate) {
            return NextResponse.json({ success: false, error: 'Campos obrigatórios faltando' }, { status: 400 });
        }
        const id = generateId();
        const challenge = {
            id, title, description: description || '', cityId,
            targetAccuracy: Number(targetAccuracy) || 100,
            bonusPoints: Number(bonusPoints),
            endDate, active: true,
            createdAt: new Date().toISOString(),
        };
        challengeStore.set(id, challenge);
        return NextResponse.json({ success: true, data: { id } });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao criar desafio' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    const { id, active } = await request.json();
    const challenge = challengeStore.get(id);
    if (!challenge) return NextResponse.json({ success: false, error: 'Desafio não encontrado' }, { status: 404 });
    challengeStore.set(id, { ...challenge, active });
    return NextResponse.json({ success: true });
}
