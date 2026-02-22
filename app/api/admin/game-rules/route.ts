import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mockDb';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    return NextResponse.json({ success: true, data: mockStore.gameRules });
}

export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    try {
        const body = await request.json();
        mockStore.gameRules = { ...mockStore.gameRules, ...body };
        return NextResponse.json({ success: true, data: mockStore.gameRules });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao salvar regras' }, { status: 500 });
    }
}
