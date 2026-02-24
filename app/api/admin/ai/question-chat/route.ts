import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

const BLOCK_NAMES: Record<string, string> = {
    '1': 'Contexto Bíblico',
    '2': 'Geografia Atual',
    '3': 'Turismo & Economia',
};

const DIFFICULTY_DESC: Record<string, string> = {
    '1': 'Fácil',
    '2': 'Médio',
    '3': 'Difícil',
};

const SYSTEM_PROMPT = `Você é um assistente especialista em criar perguntas de quiz educativo sobre cidades bíblicas para o jogo "O Discípulo". Seu papel é CONVERSAR com o administrador do jogo para ajudá-lo a criar as melhores perguntas possíveis.

Você pode:
1. SUGERIR temas interessantes para perguntas sobre uma cidade
2. DISCUTIR ideias de perguntas antes de gerá-las
3. GERAR perguntas quando o administrador pedir
4. EXPLICAR fatos históricos, bíblicos ou geográficos sobre as cidades

REGRAS DE CONVERSA:
- Responda SEMPRE em português brasileiro
- Seja prestativo, criativo e educativo
- Quando sugerir temas, dê ideias variadas e interessantes
- Mantenha o tom amigável e profissional
- Se o administrador pedir para gerar perguntas, responda com o JSON especial (veja abaixo)

QUANDO O USUÁRIO PEDIR PARA GERAR PERGUNTAS:
Se o usuário disser algo como "gerar", "criar perguntas", "pode gerar", "faz as perguntas", etc., responda com uma mensagem normal E inclua um bloco JSON especial no final da sua mensagem, delimitado por ===QUESTIONS_JSON=== e ===END_QUESTIONS_JSON===

Formato do JSON:
===QUESTIONS_JSON===
{
  "questions": [
    {
      "question_text": "Texto da pergunta?",
      "option_a": "Opção A",
      "option_b": "Opção B", 
      "option_c": "Opção C",
      "option_d": "Opção D",
      "correct_option": "A",
      "explanation": "Explicação educativa."
    }
  ]
}
===END_QUESTIONS_JSON===

Regras para as perguntas:
- 4 opções (A, B, C, D), apenas 1 correta
- Opções incorretas devem ser plausíveis
- Varie a posição da resposta correta
- Explicações educativas de 1-2 frases
- Em português brasileiro
- Factualmente precisas`;

export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) {
        return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ success: false, error: 'GEMINI_API_KEY não configurada' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { messages, cityName, cityContext, block, difficulty } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ success: false, error: 'Mensagens são obrigatórias' }, { status: 400 });
        }

        const blockName = BLOCK_NAMES[String(block)] || 'Geral';
        const diffName = DIFFICULTY_DESC[String(difficulty)] || 'Médio';

        const contextPrompt = `${SYSTEM_PROMPT}

CONTEXTO ATUAL:
- Cidade: ${cityName || 'Não definida'}
${cityContext ? `- Sobre a cidade: ${cityContext}` : ''}
- Bloco temático: ${blockName}
- Dificuldade: ${diffName}

Se gerar perguntas, gere no nível de dificuldade "${diffName}" e sobre o bloco "${blockName}".`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.85,
                topP: 0.95,
                maxOutputTokens: 65536,
            },
        });

        // Build chat history
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: contextPrompt }] },
                { role: 'model', parts: [{ text: `Olá! 👋 Sou seu assistente para criar perguntas sobre ${cityName || 'cidades bíblicas'}. Posso sugerir temas, discutir ideias ou gerar perguntas diretamente. Como posso ajudar?` }] },
                ...history,
            ],
        });

        const lastMsg = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMsg.content);
        const responseText = result.response.text();

        // Check if response contains generated questions
        let questions = null;
        let cleanText = responseText;
        
        const jsonMatch = responseText.match(/===QUESTIONS_JSON===([\s\S]*?)===END_QUESTIONS_JSON===/);
        if (jsonMatch) {
            cleanText = responseText.replace(/===QUESTIONS_JSON===[\s\S]*?===END_QUESTIONS_JSON===/, '').trim();
            try {
                const parsed = JSON.parse(jsonMatch[1].trim());
                questions = (parsed.questions || parsed).map((q: any) => ({
                    question_text: q.question_text || '',
                    option_a: q.option_a || '',
                    option_b: q.option_b || '',
                    option_c: q.option_c || '',
                    option_d: q.option_d || '',
                    correct_option: ['A', 'B', 'C', 'D'].includes(q.correct_option?.toUpperCase()) ? q.correct_option.toUpperCase() : 'A',
                    explanation: q.explanation || '',
                }));
            } catch {
                // JSON parse failed, just return the text
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                message: cleanText,
                questions: questions,
            },
        });

    } catch (error: any) {
        console.error('Erro no chat de perguntas:', error);
        return NextResponse.json({ success: false, error: `Erro: ${error?.message || 'Desconhecido'}` }, { status: 500 });
    }
}
