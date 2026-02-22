import { NextRequest, NextResponse } from 'next/server';
import { getQuestionsByCity } from '@/lib/mockDb';
import { QuestionBlock, QuestionDifficulty } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cityId: string }> }
) {
    try {
        const { cityId } = await params;

        const allQuestions = getQuestionsByCity(cityId);

        if (allQuestions.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Nenhuma pergunta encontrada para esta cidade' },
                { status: 404 }
            );
        }

        // Selecionar 1 pergunta por bloco (blocos 1, 2 e 3)
        const selected = [];
        for (let block = 1; block <= 3; block++) {
            const blockQuestions = allQuestions.filter(q => q.block === block);
            if (blockQuestions.length > 0) {
                // Escolher aleatoriamente
                const randomIndex = Math.floor(Math.random() * blockQuestions.length);
                selected.push(blockQuestions[randomIndex]);
            }
        }

        const formattedQuestions = selected.map(q => ({
            id: q.id,
            cityId: q.city_id,
            block: q.block as QuestionBlock,
            difficulty: q.difficulty as QuestionDifficulty,
            questionText: q.question_text,
            question_text: q.question_text,
            options: [
                { letter: 'A', text: q.option_a },
                { letter: 'B', text: q.option_b },
                { letter: 'C', text: q.option_c },
                { letter: 'D', text: q.option_d },
            ],
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correctOption: q.correct_option,
            explanation: q.explanation,
            imageUrl: q.image_url,
        }));

        return NextResponse.json({
            success: true,
            data: formattedQuestions,
        });
    } catch (error) {
        console.error('Erro ao buscar perguntas:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar perguntas' },
            { status: 500 }
        );
    }
}
