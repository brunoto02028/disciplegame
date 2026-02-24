import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
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
        const { messages, cities } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ success: false, error: 'Mensagens são obrigatórias' }, { status: 400 });
        }

        const cityList = cities && Array.isArray(cities) ? cities.map((c: any) => c.name).join(', ') : 'Jerusalém, Éfeso, Malta';

        const systemPrompt = `Você é um assistente especializado em criar desafios semanais para o jogo "O Discípulo", um quiz bíblico sobre as viagens do Apóstolo Paulo.

CONTEXTO DO JOGO:
- Cidades disponíveis: ${cityList}
- Os desafios aparecem no dashboard dos jogadores com countdown em tempo real
- Cada desafio tem: título, descrição, cidade alvo, precisão mínima (%), pontos bônus, e data de término
- Os desafios motivam jogadores a completar cidades com alta precisão

SUAS CAPACIDADES:
1. Conversar sobre ideias de desafios e estratégias de engajamento
2. Quando solicitado, gerar um desafio completo em formato JSON
3. Sugerir títulos criativos e descrições motivacionais
4. Recomendar valores de pontos e precisão adequados

Quando o usuário pedir para GERAR um desafio, retorne a resposta normal E ao final inclua um bloco JSON entre as tags <CHALLENGE_JSON> e </CHALLENGE_JSON> com este formato exato:
<CHALLENGE_JSON>
{
  "title": "Título do Desafio",
  "description": "Descrição motivacional do desafio",
  "cityId": "id-da-cidade",
  "targetAccuracy": 80,
  "bonusPoints": 500,
  "daysUntilEnd": 7
}
</CHALLENGE_JSON>

Se o usuário está apenas conversando ou fazendo perguntas, responda normalmente SEM incluir o bloco JSON.
Sempre responda em português brasileiro.`;

        const chatMessages = [
            { role: 'user' as const, parts: [{ text: systemPrompt }] },
            { role: 'model' as const, parts: [{ text: 'Entendido! Sou seu assistente para criar desafios semanais no O Discípulo. Como posso ajudar?' }] },
        ];

        for (const msg of messages) {
            chatMessages.push({
                role: msg.role === 'user' ? 'user' as const : 'model' as const,
                parts: [{ text: msg.content }],
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.85,
                topP: 0.95,
                maxOutputTokens: 4096,
            },
        });

        const chat = model.startChat({ history: chatMessages.slice(0, -1) });
        const lastMessage = chatMessages[chatMessages.length - 1];
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const responseText = result.response.text();

        // Try to extract challenge JSON if present
        let challengeData = null;
        const jsonMatch = responseText.match(/<CHALLENGE_JSON>\s*([\s\S]*?)\s*<\/CHALLENGE_JSON>/);
        if (jsonMatch) {
            try {
                challengeData = JSON.parse(jsonMatch[1]);
            } catch { /* ignore parse errors */ }
        }

        // Clean the response text (remove the JSON block for display)
        const cleanText = responseText.replace(/<CHALLENGE_JSON>[\s\S]*?<\/CHALLENGE_JSON>/, '').trim();

        return NextResponse.json({
            success: true,
            data: {
                message: cleanText,
                challenge: challengeData,
            },
        });

    } catch (error: any) {
        console.error('Erro na geração de desafio com IA:', error);
        const message = error?.message || 'Erro desconhecido';
        if (message.includes('API_KEY') || message.includes('401') || message.includes('403')) {
            return NextResponse.json({ success: false, error: 'Chave de API inválida. Verifique GEMINI_API_KEY.' }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: `Erro na IA: ${message}` }, { status: 500 });
    }
}
