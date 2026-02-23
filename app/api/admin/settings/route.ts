import { NextRequest, NextResponse } from 'next/server';
import { mockStore, persistAdminData, registerImageInBank } from '@/lib/mockDb';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    return NextResponse.json({ success: true, data: mockStore.siteSettings });
}

export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    try {
        const body = await request.json();
        const { section, data } = body;
        if (!section || !data) {
            return NextResponse.json({ success: false, error: 'section e data são obrigatórios' }, { status: 400 });
        }
        // Deep merge the section data
        if (mockStore.siteSettings[section]) {
            mockStore.siteSettings[section] = { ...mockStore.siteSettings[section], ...data };
        } else {
            mockStore.siteSettings[section] = data;
        }
        // Auto-register any image URLs in the image bank
        if (data.image_url) registerImageInBank(data.image_url, 'settings');
        persistAdminData();
        return NextResponse.json({ success: true, data: mockStore.siteSettings[section] });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao salvar configurações' }, { status: 500 });
    }
}
