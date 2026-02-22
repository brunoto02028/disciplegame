import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite'];

const SECTION_CONTEXT: Record<string, string> = {
    hero: 'Seção HERO (banner principal) com: imagem de fundo, título, subtítulo, descrição, badge, botões CTA e estatísticas.',
    cities_section: 'Seção de CIDADES BÍBLICAS com: label, título e subtítulo. As cidades em si são gerenciadas separadamente.',
    map_section: 'Seção do MAPA DAS VIAGENS de Paulo com: imagem do mapa, label, título, subtítulo, estatísticas (distância, duração, etc.) e lista de viagens missionárias.',
    how_it_works: 'Seção COMO FUNCIONA com: label, título, subtítulo e cards (cada card tem ícone, título e descrição).',
    cta_section: 'Seção CTA FINAL (call-to-action) com: título, subtítulo e texto do botão.',
    footer: 'FOOTER com: texto de copyright.',
    city_image: 'IMAGEM DE UMA CIDADE BÍBLICA para o site "O Discípulo". O usuário quer gerar ou descrever uma imagem para uma cidade das viagens do Apóstolo Paulo.',
};

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function cleanError(msg: string): string {
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        return 'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.';
    }
    if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
        return 'Chave de API inválida ou sem permissão. Verifique GEMINI_API_KEY.';
    }
    if (msg.includes('404') || msg.includes('not found')) {
        return 'Modelo não disponível. Tentando alternativa...';
    }
    return msg.length > 150 ? msg.slice(0, 150) + '...' : msg;
}

// Try generating content with fallback models and retry on 429
async function generateWithRetry(
    genAI: GoogleGenerativeAI,
    config: { temperature: number; maxOutputTokens: number; topP?: number; responseMimeType?: string },
    prompt: string
): Promise<string> {
    for (const modelName of MODELS) {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: config as any,
                });
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (e: any) {
                const msg = e?.message || '';
                const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('rate');
                const is404 = msg.includes('404') || msg.includes('not found');
                if (is404) break; // skip this model
                if (is429 && attempt < 2) {
                    await delay(7000 * (attempt + 1)); // wait 7s, then 14s
                    continue;
                }
                if (attempt === 2 || !is429) break; // try next model
            }
        }
    }
    throw new Error('Todos os modelos falharam. Aguarde alguns segundos e tente novamente.');
}

// Try chat with fallback models and retry on 429
async function chatWithRetry(
    genAI: GoogleGenerativeAI,
    config: { temperature: number; maxOutputTokens: number; topP?: number },
    history: any[],
    lastMessage: string
): Promise<string> {
    for (const modelName of MODELS) {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName, generationConfig: config as any });
                const chat = model.startChat({ history });
                const result = await chat.sendMessage(lastMessage);
                return result.response.text();
            } catch (e: any) {
                const msg = e?.message || '';
                const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('rate');
                const is404 = msg.includes('404') || msg.includes('not found');
                if (is404) break;
                if (is429 && attempt < 2) {
                    await delay(7000 * (attempt + 1));
                    continue;
                }
                if (attempt === 2 || !is429) break;
            }
        }
    }
    throw new Error('Todos os modelos falharam. Aguarde alguns segundos e tente novamente.');
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
        const { messages, section, mode, currentData } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ success: false, error: 'Mensagens são obrigatórias' }, { status: 400 });
        }

        const sectionCtx = SECTION_CONTEXT[section] || 'configurações do site';
        const genAI = new GoogleGenerativeAI(apiKey);

        if (mode === 'generate_text') {
            const conversationSummary = messages.map((m: any) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n');

            const prompt = `Você é um especialista em conteúdo para o site "O Discípulo", um quiz bíblico educativo sobre as viagens do Apóstolo Paulo.

SEÇÃO ATUAL: ${sectionCtx}
DADOS ATUAIS: ${JSON.stringify(currentData || {})}

CONVERSA COM O USUÁRIO (o usuário já descreveu exatamente o que quer):
${conversationSummary}

AGORA, gere o conteúdo final em JSON baseado no que o usuário pediu na conversa.
O JSON deve conter APENAS os campos da seção "${section}".
Todo texto em PORTUGUÊS BRASILEIRO.
Retorne SOMENTE JSON válido, sem markdown, sem \`\`\`, sem texto extra.

${section === 'hero' ? 'Campos: title, subtitle, description, badge_text, cta_primary, cta_secondary, stats (array de {number, label})' : ''}
${section === 'cities_section' ? 'Campos: label, title, subtitle' : ''}
${section === 'map_section' ? 'Campos: label, title, subtitle, stats (array de {label, value}), journeys (array de {num, title, route, date})' : ''}
${section === 'how_it_works' ? 'Campos: label, title, subtitle, items (array de {icon (emoji), title, desc})' : ''}
${section === 'cta_section' ? 'Campos: title, subtitle, button_text' : ''}
${section === 'footer' ? 'Campos: text' : ''}`;

            const responseText = await generateWithRetry(genAI,
                { temperature: 0.85, topP: 0.95, maxOutputTokens: 4096, responseMimeType: 'application/json' },
                prompt
            );

            let parsed;
            try { parsed = JSON.parse(responseText); } catch {
                const m = responseText.match(/\{[\s\S]*\}/);
                parsed = m ? JSON.parse(m[0]) : null;
            }
            if (!parsed) return NextResponse.json({ success: false, error: 'Erro ao interpretar resposta da IA.' }, { status: 500 });
            return NextResponse.json({ success: true, type: 'content', data: parsed });

        } else if (mode === 'generate_image') {
            const conversationSummary = messages.map((m: any) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n');

            const extractPrompt = `Baseado nesta conversa, extraia um prompt claro e detalhado em INGLÊS para gerar uma imagem com IA.
O prompt deve descrever a imagem desejada de forma objetiva (estilo, cores, cenário, composição).

CONVERSA:
${conversationSummary}

Retorne SOMENTE JSON: {"prompt": "detailed image generation prompt in English"}`;

            let imagePrompt: string;
            try {
                const extractText = await generateWithRetry(genAI,
                    { temperature: 0.5, maxOutputTokens: 512, responseMimeType: 'application/json' },
                    extractPrompt
                );
                const parsed = JSON.parse(extractText);
                imagePrompt = parsed.prompt || conversationSummary;
            } catch {
                imagePrompt = conversationSummary;
            }

            // Call the image generation endpoint
            const origin = request.nextUrl.origin;
            const imgRes = await fetch(`${origin}/api/admin/ai/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': `admin_session=${request.cookies.get('admin_session')?.value}` },
                body: JSON.stringify({ prompt: imagePrompt, count: 2 }),
            });
            const imgData = await imgRes.json();

            if (imgData.success && imgData.data?.length > 0) {
                return NextResponse.json({ success: true, type: 'images', data: imgData.data });
            } else {
                return NextResponse.json({ success: false, error: imgData.error || 'Não foi possível gerar a imagem.' }, { status: 500 });
            }

        } else {
            // Chat mode
            const systemPrompt = `Você é o assistente de conteúdo do site "O Discípulo", um jogo de quiz bíblico educativo sobre as viagens missionárias do Apóstolo Paulo.

O usuário está editando: ${sectionCtx}
Dados atuais da seção: ${JSON.stringify(currentData || {})}

REGRAS:
1. Converse naturalmente em PORTUGUÊS BRASILEIRO
2. Ajude o usuário a definir exatamente o que ele quer (textos, tom, estilo, imagens)
3. Faça perguntas para entender melhor a visão do usuário
4. Sugira ideias e melhorias quando apropriado
5. NÃO gere o conteúdo final ainda — apenas converse e alinhe expectativas
6. Quando o usuário estiver satisfeito, diga que ele pode clicar em "Aplicar Textos" ou "Gerar Imagem IA"
7. Seja conciso e objetivo nas respostas (máx 3-4 frases)
8. Se o usuário pedir imagens, descreva o tipo de imagem que você imagina e pergunte se ele concorda antes de gerar`;

            const chatHistory = [
                { role: 'user' as const, parts: [{ text: 'Sistema: ' + systemPrompt }] },
                { role: 'model' as const, parts: [{ text: 'Entendido! Estou aqui para ajudar. O que você gostaria de criar ou modificar nesta seção?' }] },
                ...messages.slice(0, -1).map((m: any) => ({
                    role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
                    parts: [{ text: m.content }],
                })),
            ];

            const lastMessage = messages[messages.length - 1].content;
            const responseText = await chatWithRetry(genAI,
                { temperature: 0.9, topP: 0.95, maxOutputTokens: 1024 },
                chatHistory, lastMessage
            );

            return NextResponse.json({ success: true, type: 'chat', data: { message: responseText } });
        }

    } catch (error: any) {
        console.error('Erro no chat IA:', error);
        const msg = cleanError(error?.message || 'Erro desconhecido');
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
