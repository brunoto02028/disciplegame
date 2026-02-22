import { NextRequest, NextResponse } from 'next/server';
import { mockStore, generateId } from '@/lib/mockDb';
import { getSession } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const sessionToken = request.cookies.get('session')?.value;
        if (!sessionToken) {
            return NextResponse.json(
                { success: false, error: 'Não autenticado' },
                { status: 401 }
            );
        }

        const userSession = getSession(sessionToken);
        if (!userSession) {
            return NextResponse.json(
                { success: false, error: 'Sessão inválida' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { questionId, selectedOption, timeTaken } = body;

        if (!questionId || !selectedOption || timeTaken === undefined) {
            return NextResponse.json(
                { success: false, error: 'Dados incompletos' },
                { status: 400 }
            );
        }

        const question = mockStore.questions.get(questionId);
        if (!question) {
            return NextResponse.json(
                { success: false, error: 'Pergunta não encontrada' },
                { status: 404 }
            );
        }

        const isCorrect = selectedOption === question.correct_option;

        const answerId = generateId();
        mockStore.userAnswers.set(answerId, {
            id: answerId,
            user_id: userSession.userId,
            question_id: questionId,
            session_id: sessionId,
            selected_option: selectedOption,
            is_correct: isCorrect,
            time_taken: timeTaken,
            answered_at: new Date(),
        });

        return NextResponse.json({
            success: true,
            data: {
                isCorrect,
                correctOption: question.correct_option,
            },
        });
    } catch (error) {
        console.error('Erro ao salvar resposta:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao salvar resposta' },
            { status: 500 }
        );
    }
}
