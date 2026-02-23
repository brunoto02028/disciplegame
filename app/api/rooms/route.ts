import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mockStore, generateId, getQuestionsByCity } from '@/lib/mockDb';
import { createRoom, joinRoom, getRoomByCode } from '@/lib/rooms';

// POST: Create a room or join by code
export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const user = mockStore.users.get(session.userId);
    if (!user) return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
        const { cityId, name, maxPlayers } = body;
        const city = mockStore.cities.get(cityId);
        if (!city) return NextResponse.json({ success: false, error: 'Cidade não encontrada' }, { status: 404 });

        const questions = getQuestionsByCity(cityId);
        const questionIds = questions.sort(() => Math.random() - 0.5).slice(0, 9).map(q => q.id);

        const roomId = generateId();
        const room = createRoom(roomId, name || `Sala de ${user.name}`, session.userId, user.name, cityId, city.name, questionIds, maxPlayers || 20);

        return NextResponse.json({
            success: true,
            data: {
                roomId: room.id,
                code: room.code,
                cityName: city.name,
                playerCount: room.players.size,
                shareLink: `https://disciplegame.com/room/${room.code}`,
            },
        });
    }

    if (action === 'join') {
        const { code } = body;
        if (!code) return NextResponse.json({ success: false, error: 'Código obrigatório' }, { status: 400 });

        const room = joinRoom(code, session.userId, user.name);
        if (!room) return NextResponse.json({ success: false, error: 'Sala não encontrada ou cheia' }, { status: 404 });

        return NextResponse.json({
            success: true,
            data: {
                roomId: room.id,
                code: room.code,
                name: room.name,
                cityName: room.cityName,
                hostName: room.hostName,
                playerCount: room.players.size,
            },
        });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
}
