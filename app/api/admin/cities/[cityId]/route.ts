import { NextRequest, NextResponse } from 'next/server';
import { mockStore, persistAdminData } from '@/lib/mockDb';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ cityId: string }> }) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    try {
        const { cityId } = await params;
        const city = mockStore.cities.get(cityId);
        if (!city) return NextResponse.json({ success: false, error: 'Cidade não encontrada' }, { status: 404 });
        const body = await request.json();
        const updated = {
            ...city,
            name: body.name ?? city.name,
            name_en: body.name_en ?? city.name_en,
            country: body.country ?? city.country,
            modern_name: body.modern_name ?? city.modern_name,
            description: body.description ?? city.description,
            description_en: body.description_en ?? city.description_en,
            biblical_context: body.biblical_context ?? city.biblical_context,
            latitude: body.latitude !== undefined ? parseFloat(body.latitude) || 0 : city.latitude,
            longitude: body.longitude !== undefined ? parseFloat(body.longitude) || 0 : city.longitude,
            image_url: body.image_url !== undefined ? (body.image_url || null) : city.image_url,
            order_index: body.order_index !== undefined ? Number(body.order_index) : city.order_index,
            flag: body.flag !== undefined ? body.flag : city.flag,
            biblical_ref: body.biblical_ref !== undefined ? body.biblical_ref : city.biblical_ref,
            active: body.active !== undefined ? body.active : city.active,
        };
        mockStore.cities.set(cityId, updated);
        persistAdminData();
        return NextResponse.json({ success: true, data: updated });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao atualizar cidade' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ cityId: string }> }) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    try {
        const { cityId } = await params;
        if (!mockStore.cities.has(cityId)) {
            return NextResponse.json({ success: false, error: 'Cidade não encontrada' }, { status: 404 });
        }
        // Check for linked questions
        const linkedQuestions = Array.from(mockStore.questions.values()).filter(q => q.city_id === cityId);
        mockStore.cities.delete(cityId);
        // Also remove linked questions
        for (const q of linkedQuestions) {
            mockStore.questions.delete(q.id);
        }
        persistAdminData();
        return NextResponse.json({ success: true, deletedQuestions: linkedQuestions.length });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao deletar cidade' }, { status: 500 });
    }
}
