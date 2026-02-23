import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mockStore } from '@/lib/mockDb';
import { getDailyChallenge, completeDailyChallenge, getUserGamification } from '@/lib/gamification';

// GET: Get today's daily challenge question
export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const allQuestions = Array.from(mockStore.questions.values());
    const questionIds = allQuestions.map(q => q.id);
    const cityMap = new Map<string, string>();
    allQuestions.forEach(q => {
        const city = mockStore.cities.get(q.city_id);
        if (city) cityMap.set(q.id, city.name);
    });

    const challenge = getDailyChallenge(questionIds, cityMap);
    const question = mockStore.questions.get(challenge.questionId);

    if (!question) return NextResponse.json({ success: false, error: 'Pergunta não encontrada' }, { status: 500 });

    const userData = getUserGamification(session.userId);
    const today = new Date().toISOString().split('T')[0];
    const alreadyDone = userData.dailyChallengeToday && userData.lastDailyAt === today;

    const city = mockStore.cities.get(question.city_id);

    return NextResponse.json({
        success: true,
        data: {
            date: challenge.date,
            alreadyDone,
            cityName: city?.name || '',
            cityFlag: city?.flag || '',
            question: alreadyDone ? null : {
                id: question.id,
                questionText: question.question_text,
                options: [
                    { letter: 'A', text: question.option_a },
                    { letter: 'B', text: question.option_b },
                    { letter: 'C', text: question.option_c },
                    { letter: 'D', text: question.option_d },
                ],
                block: question.block,
                difficulty: question.difficulty,
            },
        },
    });
}

// POST: Answer the daily challenge
export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const { questionId, selectedOption } = await request.json();

    const question = mockStore.questions.get(questionId);
    if (!question) return NextResponse.json({ success: false, error: 'Pergunta não encontrada' }, { status: 404 });

    const correct = selectedOption === question.correct_option;
    const result = completeDailyChallenge(session.userId, correct);

    return NextResponse.json({
        success: true,
        data: {
            correct,
            correctOption: question.correct_option,
            explanation: question.explanation,
            xpEarned: result.xpEarned,
            alreadyDone: result.alreadyDone,
        },
    });
}
