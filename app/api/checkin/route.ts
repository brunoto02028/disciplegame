import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mockStore } from '@/lib/mockDb';
import { addXP, getUserGamification } from '@/lib/gamification';

// In-memory checkin storage
const globalForCheckins = globalThis as unknown as { __checkins?: Map<string, { userId: string; cityId: string; date: string }[]> };
if (!globalForCheckins.__checkins) globalForCheckins.__checkins = new Map();
const checkinStore = globalForCheckins.__checkins;

// Coordinates of the biblical cities (approximate)
const CITY_COORDS: Record<string, { lat: number; lng: number; radius: number }> = {
    'city-jerusalem-001': { lat: 31.7683, lng: 35.2137, radius: 5000 }, // 5km radius
    'city-efeso-002': { lat: 37.9395, lng: 27.3417, radius: 5000 },
    'city-malta-003': { lat: 35.9375, lng: 14.3754, radius: 15000 }, // Whole island
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// POST: Check-in at a location (GPS or QR code)
export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const user = mockStore.users.get(session.userId);
    if (!user) return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });

    const { type, cityId, latitude, longitude, qrCode } = await request.json();
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today for this city
    const userCheckins = checkinStore.get(session.userId) || [];
    const alreadyToday = userCheckins.some(c => c.cityId === cityId && c.date === today);
    if (alreadyToday) {
        return NextResponse.json({ success: false, error: 'Você já fez check-in nesta cidade hoje' }, { status: 400 });
    }

    const city = mockStore.cities.get(cityId);
    if (!city) return NextResponse.json({ success: false, error: 'Cidade não encontrada' }, { status: 404 });

    let verified = false;
    let badge = '';

    if (type === 'gps' && latitude && longitude) {
        const cityCoord = CITY_COORDS[cityId];
        if (cityCoord) {
            const distance = haversineDistance(latitude, longitude, cityCoord.lat, cityCoord.lng);
            if (distance <= cityCoord.radius) {
                verified = true;
                badge = `Peregrino de ${city.name}`;
            }
        }
    } else if (type === 'qr' && qrCode) {
        // QR codes have format: DISCIPLE-{cityId}-{secret}
        if (qrCode.startsWith('DISCIPLE-') && qrCode.includes(cityId)) {
            verified = true;
            badge = `Visitante de ${city.name}`;
        }
    }

    if (!verified) {
        return NextResponse.json({
            success: false,
            error: type === 'gps' ? 'Você não está perto o suficiente desta cidade' : 'QR code inválido',
        }, { status: 400 });
    }

    // Record check-in
    userCheckins.push({ userId: session.userId, cityId, date: today });
    checkinStore.set(session.userId, userCheckins);

    // Award XP
    const xpReward = 300;
    const xpResult = addXP(session.userId, xpReward, 'checkin');

    return NextResponse.json({
        success: true,
        data: {
            badge,
            xpEarned: xpReward,
            cityName: city.name,
            levelUp: xpResult.levelUp,
            newLevel: xpResult.newLevel,
            totalCheckins: userCheckins.length,
        },
    });
}

// GET: Get user's checkin history
export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const userCheckins = checkinStore.get(session.userId) || [];
    const enriched = userCheckins.map(c => {
        const city = mockStore.cities.get(c.cityId);
        return { ...c, cityName: city?.name || '', cityFlag: city?.flag || '' };
    });

    return NextResponse.json({ success: true, data: enriched });
}
