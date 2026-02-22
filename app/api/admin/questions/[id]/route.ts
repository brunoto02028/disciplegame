import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mockDb';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    const { id } = await params;
    const existing = mockStore.questions.get(id);
    if (!existing) return NextResponse.json({ success: false, error: 'Pergunta não encontrada' }, { status: 404 });
    const body = await request.json();
    mockStore.questions.set(id, { ...existing, ...body, id });
    return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    const { id } = await params;
    if (!mockStore.questions.has(id)) return NextResponse.json({ success: false, error: 'Pergunta não encontrada' }, { status: 404 });
    mockStore.questions.delete(id);
    return NextResponse.json({ success: true });
}
