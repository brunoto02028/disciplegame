import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function requireAdmin(req: NextRequest) {
    return req.cookies.get('admin_session')?.value === 'authenticated';
}

export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) {
        return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ success: false, error: 'GEMINI_API_KEY não configurada. Adicione em .env.local' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { question_text, option_a, option_b, option_c, option_d, correct_option, explanation, action } = body;

        if (!question_text) {
            return NextResponse.json({ success: false, error: 'question_text é obrigatório' }, { status: 400 });
        }

        const actionDescriptions: Record<string, string> = {
            improve_all: 'Melhore a pergunta como um todo: torne o texto mais claro e engajante, melhore as opções distraidoras para serem mais plausíveis (sem mudar a resposta correta), e escreva uma explicação mais educativa e detalhada.',
            improve_distractors: 'Mantenha a pergunta e a resposta correta iguais, mas melhore as 3 opções INCORRETAS para serem mais plausíveis e desafiadoras, sem serem absurdas.',
            improve_explanation: 'Mantenha a pergunta e todas as opções iguais, mas escreva uma explicação MUITO melhor, mais detalhada e educativa (2-3 frases com contexto histórico/bíblico/geográfico).',
            translate_en: 'Traduza a pergunta, todas as opções e a explicação para INGLÊS, mantendo o mesmo formato JSON.',
        };

        const actionDesc = actionDescriptions[action || 'improve_all'] || actionDescriptions.improve_all;

        const prompt = `Você é um especialista em quiz educativo sobre cidades bíblicas.

PERGUNTA ATUAL:
- Texto: ${question_text}
- Opção A: ${option_a}
- Opção B: ${option_b}
- Opção C: ${option_c}
- Opção D: ${option_d}
- Resposta correta: ${correct_option}
- Explicação: ${explanation || '(sem explicação)'}

TAREFA: ${actionDesc}

Retorne SOMENTE um JSON válido (sem markdown, sem \`\`\`, apenas JSON puro):
{
  "question_text": "Texto melhorado da pergunta?",
  "option_a": "Opção A",
  "option_b": "Opção B",
  "option_c": "Opção C",
  "option_d": "Opção D",
  "correct_option": "${correct_option}",
  "explanation": "Explicação melhorada."
}`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
            },
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                return NextResponse.json({ success: false, error: 'Erro ao interpretar resposta da IA.' }, { status: 500 });
            }
        }

        const improved = {
            question_text: parsed.question_text || question_text,
            option_a: parsed.option_a || option_a,
            option_b: parsed.option_b || option_b,
            option_c: parsed.option_c || option_c,
            option_d: parsed.option_d || option_d,
            correct_option: ['A', 'B', 'C', 'D'].includes(parsed.correct_option?.toUpperCase()) ? parsed.correct_option.toUpperCase() : correct_option,
            explanation: parsed.explanation || explanation,
        };

        return NextResponse.json({ success: true, data: improved });

    } catch (error: any) {
        console.error('Erro ao melhorar pergunta:', error);
        return NextResponse.json({ success: false, error: `Erro na IA: ${error?.message || 'Erro desconhecido'}` }, { status: 500 });
    }
}
