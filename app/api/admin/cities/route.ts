import { NextRequest, NextResponse } from 'next/server';
import { mockStore, generateId, persistAdminData, registerImageInBank } from '@/lib/mockDb';

const MVP_CIRCUIT_ID = '00000000-0000-0000-0000-000000000001';

import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    const cities = Array.from(mockStore.cities.values()).sort((a, b) => a.order_index - b.order_index);
    const citiesWithStats = cities.map(c => {
        const qCount = Array.from(mockStore.questions.values()).filter(q => q.city_id === c.id).length;
        return { ...c, questionCount: qCount };
    });
    return NextResponse.json({ success: true, data: citiesWithStats });
}

export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    try {
        const body = await request.json();
        const { name, name_en, country, modern_name, description, biblical_context, latitude, longitude, flag, biblical_ref, image_url, active, tourist_spots } = body;
        if (!name || !country) {
            return NextResponse.json({ success: false, error: 'Nome e país são obrigatórios' }, { status: 400 });
        }
        const id = 'city-' + generateId();
        const maxOrder = Math.max(0, ...Array.from(mockStore.cities.values()).map(c => c.order_index));
        mockStore.cities.set(id, {
            id, circuit_id: MVP_CIRCUIT_ID,
            name, name_en: name_en || name, country,
            modern_name: modern_name || name,
            description: description || '',
            description_en: description || '',
            biblical_context: biblical_context || '',
            latitude: parseFloat(latitude) || 0,
            longitude: parseFloat(longitude) || 0,
            image_url: image_url || null,
            order_index: maxOrder + 1,
            flag: flag || '',
            biblical_ref: biblical_ref || '',
            active: active !== false,
            tourist_spots: Array.isArray(tourist_spots) ? tourist_spots : [],
        });
        if (image_url) registerImageInBank(image_url, 'cities');
        persistAdminData();
        return NextResponse.json({ success: true, data: { id } });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao criar cidade' }, { status: 500 });
    }
}
