import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

function requireAdmin(req: NextRequest) {
    return req.cookies.get('admin_session')?.value === 'authenticated';
}

// Save base64 image to disk and return public URL
function saveBase64Image(base64Data: string, mimeType: string): string {
    const dir = path.join(process.cwd(), 'public', 'uploads', 'generated');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(dir, filename);

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    return `/uploads/generated/${filename}`;
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
        const { prompt, count } = await request.json();

        if (!prompt) {
            return NextResponse.json({ success: false, error: 'Campo "prompt" é obrigatório' }, { status: 400 });
        }

        const numImages = Math.min(count || 1, 4);
        const generatedImages: Array<{ url: string; description: string }> = [];
        const errors: string[] = [];

        // ── Strategy 1: Imagen 3 via REST API ──
        try {
            const imagenRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt }],
                        parameters: { sampleCount: numImages, outputOptions: { mimeType: 'image/png' } },
                    }),
                }
            );
            if (imagenRes.ok) {
                const imagenData = await imagenRes.json();
                const predictions = imagenData.predictions || [];
                for (const pred of predictions) {
                    if (pred.bytesBase64Encoded) {
                        const url = saveBase64Image(pred.bytesBase64Encoded, 'image/png');
                        generatedImages.push({ url, description: prompt });
                    }
                }
            } else {
                const errBody = await imagenRes.text();
                errors.push(`Imagen 4: ${imagenRes.status} - ${errBody.slice(0, 200)}`);
            }
        } catch (e: any) {
            errors.push(`Imagen 4: ${e?.message}`);
        }

        if (generatedImages.length > 0) {
            return NextResponse.json({ success: true, data: generatedImages });
        }

        // ── Strategy 2: Gemini 2.5 Flash with image output (fallback) ──
        const genAI = new GoogleGenerativeAI(apiKey);
        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    // @ts-ignore - responseModalities available in v0.24+
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });
            const result = await model.generateContent(
                `Generate a high-quality, photorealistic image: ${prompt}. Stunning, cinematic, dramatic lighting. Do NOT include any text in the image.`
            );
            const candidates = result.response.candidates;
            if (candidates && candidates[0]?.content?.parts) {
                for (const part of candidates[0].content.parts) {
                    if (part.inlineData?.data && part.inlineData?.mimeType) {
                        const url = saveBase64Image(part.inlineData.data, part.inlineData.mimeType);
                        generatedImages.push({ url, description: prompt });
                    }
                }
            }
        } catch (e: any) {
            errors.push(`Gemini 2.5 Flash: ${e?.message}`);
        }

        if (generatedImages.length > 0) {
            return NextResponse.json({ success: true, data: generatedImages });
        }

        // All strategies failed
        console.error('Image generation errors:', errors);
        return NextResponse.json({
            success: false,
            error: `Não foi possível gerar a imagem. Detalhes: ${errors[errors.length - 1] || 'erro desconhecido'}`,
        }, { status: 500 });

    } catch (error: any) {
        console.error('Erro na geração de imagem:', error);
        return NextResponse.json({ success: false, error: `Erro: ${error?.message || 'desconhecido'}` }, { status: 500 });
    }
}
