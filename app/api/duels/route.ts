import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mockStore, generateId, getQuestionsByCity } from '@/lib/mockDb';
import { createDuel, getUserDuels } from '@/lib/duels';

// GET: List user's duels
export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const user = mockStore.users.get(session.userId);
    const duels = getUserDuels(session.userId);

    return NextResponse.json({
        success: true,
        data: duels.map(d => ({
            id: d.id,
            cityName: d.cityName,
            status: d.status,
            challenger: { name: d.challenger.userName, points: d.challenger.totalPoints, completed: d.challenger.completed },
            opponent: d.opponent ? { name: d.opponent.userName, points: d.opponent.totalPoints, completed: d.opponent.completed } : null,
            winnerId: d.winnerId,
            isChallenger: d.challenger.userId === session.userId,
            myCompleted: d.challenger.userId === session.userId ? d.challenger.completed : (d.opponent?.completed || false),
            createdAt: d.createdAt,
        })),
    });
}

// POST: Create a new duel
export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const { cityId } = await request.json();
    if (!cityId) return NextResponse.json({ success: false, error: 'cityId obrigatório' }, { status: 400 });

    const city = mockStore.cities.get(cityId);
    if (!city) return NextResponse.json({ success: false, error: 'Cidade não encontrada' }, { status: 404 });

    const user = mockStore.users.get(session.userId);
    if (!user) return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });

    const questions = getQuestionsByCity(cityId);
    if (questions.length < 5) return NextResponse.json({ success: false, error: 'Cidade precisa ter ao menos 5 perguntas' }, { status: 400 });

    const shuffled = questions.sort(() => Math.random() - 0.5);
    const questionIds = shuffled.slice(0, 5).map(q => q.id);

    const duelId = generateId();
    const duel = createDuel(duelId, cityId, city.name, questionIds, session.userId, user.name);

    return NextResponse.json({
        success: true,
        data: {
            duelId: duel.id,
            shareLink: `https://disciplegame.com/duel/${duel.id}`,
            cityName: city.name,
            questionCount: questionIds.length,
        },
    });
}
