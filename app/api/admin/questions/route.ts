import { NextRequest, NextResponse } from 'next/server';
import { mockStore, generateId } from '@/lib/mockDb';

function requireAdmin(req: NextRequest) {
    return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    const cityId = request.nextUrl.searchParams.get('cityId');
    const questions = Array.from(mockStore.questions.values())
        .filter(q => !cityId || q.city_id === cityId)
        .sort((a, b) => a.city_id.localeCompare(b.city_id) || a.block - b.block || a.difficulty - b.difficulty);
    return NextResponse.json({ success: true, data: questions });
}

export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    try {
        const body = await request.json();
        const { city_id, block, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = body;
        if (!city_id || !block || !difficulty || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
            return NextResponse.json({ success: false, error: 'Campos obrigatórios faltando' }, { status: 400 });
        }
        const id = 'q-' + generateId();
        mockStore.questions.set(id, { id, city_id, block: Number(block), difficulty: Number(difficulty), question_text, option_a, option_b, option_c, option_d, correct_option: correct_option.toUpperCase(), explanation: explanation || '', image_url: null });
        return NextResponse.json({ success: true, data: { id } });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao criar pergunta' }, { status: 500 });
    }
}
