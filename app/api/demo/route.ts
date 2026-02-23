import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/mockDb';

export async function GET() {
    // Pick 2 random questions from different blocks for demo
    const allQuestions = Array.from(mockStore.questions.values());
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const demoQuestions = shuffled.slice(0, 2).map(q => {
        const city = mockStore.cities.get(q.city_id);
        return {
            id: q.id,
            questionText: q.question_text,
            options: [
                { letter: 'A', text: q.option_a },
                { letter: 'B', text: q.option_b },
                { letter: 'C', text: q.option_c },
                { letter: 'D', text: q.option_d },
            ],
            correctOption: q.correct_option,
            explanation: q.explanation,
            block: q.block,
            difficulty: q.difficulty,
            cityName: city?.name || '',
            cityCountry: city?.country || '',
            cityFlag: city?.flag || '',
        };
    });

    return NextResponse.json({ success: true, data: demoQuestions });
}
