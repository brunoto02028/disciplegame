import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mockStore } from '@/lib/mockDb';
import { getDuel, joinDuel, submitDuelAnswer } from '@/lib/duels';

// GET: Get duel details + questions if player is participating
export async function GET(request: NextRequest, { params }: { params: Promise<{ duelId: string }> }) {
    const { duelId } = await params;
    const duel = getDuel(duelId);
    if (!duel) return NextResponse.json({ success: false, error: 'Duelo não encontrado' }, { status: 404 });

    const sessionToken = request.cookies.get('session')?.value;
    const session = sessionToken ? getSession(sessionToken) : null;
    const userId = session?.userId;

    const isParticipant = userId && (duel.challenger.userId === userId || duel.opponent?.userId === userId);
    const isChallenger = userId === duel.challenger.userId;

    // Get questions if participant and hasn't completed
    let questions = null;
    if (isParticipant) {
        const player = isChallenger ? duel.challenger : duel.opponent;
        if (player && !player.completed) {
            questions = duel.questionIds.map(qId => {
                const q = mockStore.questions.get(qId);
                if (!q) return null;
                return {
                    id: q.id,
                    questionText: q.question_text,
                    options: [
                        { letter: 'A', text: q.option_a },
                        { letter: 'B', text: q.option_b },
                        { letter: 'C', text: q.option_c },
                        { letter: 'D', text: q.option_d },
                    ],
                    block: q.block,
                };
            }).filter(Boolean);
        }
    }

    return NextResponse.json({
        success: true,
        data: {
            id: duel.id,
            cityName: duel.cityName,
            status: duel.status,
            challenger: { name: duel.challenger.userName, points: duel.challenger.totalPoints, completed: duel.challenger.completed, accuracy: duel.challenger.accuracy },
            opponent: duel.opponent ? { name: duel.opponent.userName, points: duel.opponent.totalPoints, completed: duel.opponent.completed, accuracy: duel.opponent.accuracy } : null,
            winnerId: duel.winnerId,
            isParticipant: !!isParticipant,
            isChallenger,
            questions,
            questionCount: duel.questionIds.length,
            createdAt: duel.createdAt,
        },
    });
}

// POST: Join duel or submit answer
export async function POST(request: NextRequest, { params }: { params: Promise<{ duelId: string }> }) {
    const { duelId } = await params;
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'join') {
        const user = mockStore.users.get(session.userId);
        if (!user) return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
        const duel = joinDuel(duelId, session.userId, user.name);
        if (!duel) return NextResponse.json({ success: false, error: 'Não foi possível entrar no duelo' }, { status: 400 });
        return NextResponse.json({ success: true, data: { joined: true } });
    }

    if (action === 'answer') {
        const { questionId, selectedOption, timeTaken } = body;
        const question = mockStore.questions.get(questionId);
        if (!question) return NextResponse.json({ success: false, error: 'Pergunta não encontrada' }, { status: 404 });

        const correct = selectedOption === question.correct_option;
        const ok = submitDuelAnswer(duelId, session.userId, { questionId, selectedOption, correct, timeTaken });
        if (!ok) return NextResponse.json({ success: false, error: 'Erro ao registrar resposta' }, { status: 400 });

        return NextResponse.json({
            success: true,
            data: { correct, correctOption: question.correct_option, explanation: question.explanation },
        });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
}
