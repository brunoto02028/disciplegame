import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function requireAdmin(req: NextRequest) {
    return req.cookies.get('admin_session')?.value === 'authenticated';
}

const SECTION_PROMPTS: Record<string, string> = {
    hero: `Gere conteúdo para a seção HERO (banner principal) de um site de quiz bíblico educativo chamado "O Discípulo", sobre as viagens missionárias do Apóstolo Paulo. O site é um jogo interativo que mistura conhecimento bíblico, geografia moderna e turismo religioso.

Retorne JSON com:
{
  "title": "Nome/título do jogo (curto, impactante)",
  "subtitle": "Subtítulo inspirador (1 frase)",
  "description": "Descrição envolvente do jogo (2-3 frases)",
  "badge_text": "Texto curto para badge/etiqueta (ex: As Viagens de Paulo)",
  "cta_primary": "Texto do botão principal (ex: Começar Jornada)",
  "cta_secondary": "Texto do botão secundário (ex: Já tenho conta)",
  "stats": [{"number": "10+", "label": "Cidades"}, {"number": "270+", "label": "Perguntas"}, {"number": "3", "label": "Blocos Temáticos"}]
}`,

    cities_section: `Gere textos para a seção de CIDADES BÍBLICAS de um site de quiz educativo chamado "O Discípulo", sobre viagens missionárias de Paulo.

Retorne JSON com:
{
  "label": "Label pequeno acima do título (ex: Destinos Históricos)",
  "title": "Título da seção (impactante, sobre explorar cidades bíblicas)",
  "subtitle": "Subtítulo descritivo (1-2 frases sobre descobrir histórias milenares)"
}`,

    map_section: `Gere conteúdo para a seção do MAPA DAS VIAGENS MISSIONÁRIAS do Apóstolo Paulo, em um site de quiz bíblico "O Discípulo".

Retorne JSON com:
{
  "label": "Label pequeno (ex: Viagens Missionárias)",
  "title": "Título da seção (sobre as rotas de Paulo)",
  "subtitle": "Subtítulo (dados sobre distância e duração das viagens)",
  "stats": [{"label": "DISTÂNCIA", "value": "16.000+ km"}, {"label": "DURAÇÃO", "value": "~12 anos"}, {"label": "PAÍSES", "value": "10 visitados"}, {"label": "CIDADES", "value": "50+ cidades"}],
  "journeys": [
    {"num": "1ª", "title": "Primeira Viagem", "route": "Chipre, Turquia", "date": "46-48 d.C."},
    {"num": "2ª", "title": "Segunda Viagem", "route": "Grécia, Macedônia", "date": "49-52 d.C."},
    {"num": "3ª", "title": "Terceira Viagem", "route": "Éfeso, Jerusalém", "date": "53-58 d.C."}
  ]
}`,

    how_it_works: `Gere conteúdo para a seção "COMO FUNCIONA" de um site de quiz bíblico chamado "O Discípulo". O jogo tem 3 pilares: Aprender (sobre cidades bíblicas), Competir (ranking global) e Ganhar (prêmios reais como viagens).

Retorne JSON com:
{
  "label": "Label (ex: Como Funciona)",
  "title": "Título da seção",
  "subtitle": "Subtítulo descritivo",
  "items": [
    {"icon": "📖", "title": "Aprenda", "desc": "Descrição sobre o pilar de aprendizado (2 frases)"},
    {"icon": "⚔️", "title": "Compita", "desc": "Descrição sobre o pilar de competição (2 frases)"},
    {"icon": "🏆", "title": "Ganhe", "desc": "Descrição sobre o pilar de premiação (2 frases)"}
  ]
}`,

    cta_section: `Gere conteúdo para a seção CTA FINAL (call-to-action) de um site de quiz bíblico "O Discípulo", incentivando o visitante a criar uma conta gratuita.

Retorne JSON com:
{
  "title": "Título impactante (chamada para ação)",
  "subtitle": "Subtítulo persuasivo (2-3 frases motivando a se juntar)",
  "button_text": "Texto do botão (ex: Criar Conta Gratuita)"
}`,

    footer: `Gere texto para o FOOTER de um site chamado "O Discípulo", criado por Ricardo Almeida / Usine Criative em 2026.

Retorne JSON com:
{
  "text": "Texto completo de copyright (ex: © 2026 O Discípulo - Ricardo Almeida - Usine Criative - Todos os direitos reservados)"
}`,
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
        const { section, customPrompt } = await request.json();

        if (!section) {
            return NextResponse.json({ success: false, error: 'Campo "section" é obrigatório' }, { status: 400 });
        }

        const basePrompt = SECTION_PROMPTS[section];
        if (!basePrompt && !customPrompt) {
            return NextResponse.json({ success: false, error: `Seção "${section}" não reconhecida` }, { status: 400 });
        }

        const prompt = `${basePrompt || ''}
${customPrompt ? `\nINSTRUÇÕES ADICIONAIS DO USUÁRIO: ${customPrompt}` : ''}

REGRAS:
1. Todo texto DEVE ser em PORTUGUÊS BRASILEIRO
2. Use linguagem inspiradora, elegante e moderna
3. Retorne SOMENTE JSON válido, sem markdown, sem \`\`\`, sem texto adicional
4. Mantenha o tom cristão respeitoso mas moderno e atrativo`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                maxOutputTokens: 4096,
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

        return NextResponse.json({ success: true, data: parsed });

    } catch (error: any) {
        console.error('Erro na geração de conteúdo com IA:', error);
        const message = error?.message || 'Erro desconhecido';
        if (message.includes('API_KEY') || message.includes('401') || message.includes('403')) {
            return NextResponse.json({ success: false, error: 'Chave de API inválida. Verifique GEMINI_API_KEY.' }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: `Erro na IA: ${message}` }, { status: 500 });
    }
}
