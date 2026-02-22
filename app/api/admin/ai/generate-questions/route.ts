import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

const BLOCK_NAMES: Record<string, string> = {
    '1': 'Contexto Bíblico (história bíblica, eventos, personagens, passagens das escrituras)',
    '2': 'Geografia Atual (localização moderna, país, clima, características geográficas)',
    '3': 'Turismo & Economia (pontos turísticos, cultura local, gastronomia, economia, curiosidades)',
};

const DIFFICULTY_DESC: Record<string, string> = {
    '1': 'Fácil — perguntas diretas com respostas óbvias, ideais para iniciantes',
    '2': 'Médio — requer conhecimento moderado, com opções distraidoras plausíveis',
    '3': 'Difícil — requer conhecimento aprofundado, com opções muito semelhantes e pegadinhas sutis',
};

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
        const { cityName, cityContext, block, difficulty, quantity, theme } = body;

        if (!cityName || !block || !difficulty || !quantity) {
            return NextResponse.json({ success: false, error: 'Campos obrigatórios: cityName, block, difficulty, quantity' }, { status: 400 });
        }

        const blockDesc = BLOCK_NAMES[String(block)] || 'Geral';
        const diffDesc = DIFFICULTY_DESC[String(difficulty)] || 'Médio';

        const prompt = `Você é um especialista em criar perguntas de quiz educativo sobre cidades bíblicas e históricas para o jogo "O Discípulo", que aborda as viagens missionárias do Apóstolo Paulo.

CIDADE: ${cityName}
${cityContext ? `CONTEXTO DA CIDADE: ${cityContext}` : ''}
BLOCO TEMÁTICO: ${blockDesc}
DIFICULDADE: ${diffDesc}
${theme ? `TEMA ESPECÍFICO: ${theme}` : ''}
QUANTIDADE: ${quantity} perguntas

REGRAS IMPORTANTES:
1. Cada pergunta DEVE ter exatamente 4 opções (A, B, C, D)
2. Apenas UMA opção é correta
3. As opções incorretas devem ser plausíveis (não absurdas)
4. A explicação deve ser educativa, com 1-2 frases informativas
5. Varie a posição da resposta correta entre A, B, C e D
6. NÃO repita perguntas ou variações muito semelhantes
7. Todas as perguntas devem ser em PORTUGUÊS BRASILEIRO
8. Seja factualmente preciso — use informações históricas e geográficas reais
9. Adapte a complexidade ao nível de dificuldade solicitado

Retorne SOMENTE um JSON válido no seguinte formato (sem markdown, sem \`\`\`, apenas JSON puro):
{
  "questions": [
    {
      "question_text": "Texto da pergunta?",
      "option_a": "Opção A",
      "option_b": "Opção B",
      "option_c": "Opção C",
      "option_d": "Opção D",
      "correct_option": "A",
      "explanation": "Explicação educativa sobre a resposta correta."
    }
  ]
}`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                maxOutputTokens: 8192,
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
                return NextResponse.json({ success: false, error: 'Erro ao interpretar resposta da IA. Tente novamente.' }, { status: 500 });
            }
        }

        const questions = parsed.questions || parsed;

        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ success: false, error: 'IA não retornou perguntas válidas. Tente novamente.' }, { status: 500 });
        }

        const validated = questions.map((q: any, i: number) => ({
            question_text: q.question_text || `Pergunta ${i + 1}`,
            option_a: q.option_a || '',
            option_b: q.option_b || '',
            option_c: q.option_c || '',
            option_d: q.option_d || '',
            correct_option: ['A', 'B', 'C', 'D'].includes(q.correct_option?.toUpperCase()) ? q.correct_option.toUpperCase() : 'A',
            explanation: q.explanation || '',
        }));

        return NextResponse.json({ success: true, data: validated });

    } catch (error: any) {
        console.error('Erro na geração com IA:', error);
        const message = error?.message || 'Erro desconhecido';
        if (message.includes('API_KEY') || message.includes('401') || message.includes('403')) {
            return NextResponse.json({ success: false, error: 'Chave de API inválida ou sem permissão. Verifique GEMINI_API_KEY.' }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: `Erro na IA: ${message}` }, { status: 500 });
    }
}
