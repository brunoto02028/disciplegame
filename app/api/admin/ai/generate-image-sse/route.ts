import { NextRequest } from 'next/server';
import { isValidSession } from '@/lib/adminSession';
import { generateImage, deleteImageFile } from '@/lib/ai-providers';
import { mockStore, generateId, persistAdminData } from '@/lib/mockDb';
import type { ImageBankItem } from '@/lib/mockDb';

export async function POST(request: NextRequest) {
    if (!isValidSession(request.cookies.get('admin_session')?.value)) {
        return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
    }

    try {
        const { prompt, count, replaceUrl } = await request.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Campo "prompt" é obrigatório' }), { status: 400 });
        }

        const numImages = Math.min(count || 1, 4);

        // Create SSE stream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const send = (data: any) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                };

                try {
                    send({ type: 'progress', pct: 5, msg: 'Iniciando geração...' });

                    // Delete old image if replacing
                    if (replaceUrl && replaceUrl.startsWith('/uploads/')) {
                        deleteImageFile(replaceUrl);
                        send({ type: 'progress', pct: 8, msg: 'Imagem anterior removida.' });
                    }

                    const results = await generateImage(prompt, numImages, (pct, msg) => {
                        send({ type: 'progress', pct, msg });
                    });

                    // Register in image bank
                    for (const img of results) {
                        const imgId = 'img-' + generateId();
                        const bankItem: ImageBankItem = {
                            id: imgId, url: img.url, name: img.description.slice(0, 50),
                            category: 'generated', size: 0, type: 'image/png',
                            usedIn: [], uploaded_at: new Date().toISOString(),
                        };
                        mockStore.imageBank.set(imgId, bankItem);
                    }
                    persistAdminData();

                    send({ type: 'done', images: results });
                } catch (e: any) {
                    send({ type: 'error', msg: e?.message || 'Erro na geração' });
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error?.message || 'Erro' }), { status: 500 });
    }
}
