import { NextRequest, NextResponse } from 'next/server';
import { mockStore, generateId, persistAdminData } from '@/lib/mockDb';
import type { ImageBankItem } from '@/lib/mockDb';
import { isValidSession } from '@/lib/adminSession';
import fs from 'fs';
import path from 'path';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

// GET: List all images in the bank
export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    // Scan all usages across the database to keep usedIn accurate
    refreshImageUsages();

    const images = Array.from(mockStore.imageBank.values())
        .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

    return NextResponse.json({ success: true, data: images });
}

// POST: Add an image to the bank (from URL or after upload)
export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const { url, name, category, size, type } = body;

        if (!url) return NextResponse.json({ success: false, error: 'URL da imagem é obrigatória' }, { status: 400 });

        // Check if image with same URL already exists
        for (const img of mockStore.imageBank.values()) {
            if (img.url === url) {
                return NextResponse.json({ success: true, data: img, message: 'Imagem já existe no banco' });
            }
        }

        const id = 'img-' + generateId();
        const item: ImageBankItem = {
            id,
            url,
            name: name || extractNameFromUrl(url),
            category: category || 'general',
            size: size || 0,
            type: type || guessType(url),
            usedIn: [],
            uploaded_at: new Date().toISOString(),
        };

        // Scan where this URL is used
        item.usedIn = findUsages(url);

        mockStore.imageBank.set(id, item);
        persistAdminData();

        return NextResponse.json({ success: true, data: item });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao adicionar imagem' }, { status: 500 });
    }
}

// DELETE: Remove image from bank AND cascade-remove from all usages
export async function DELETE(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('id');

        if (!imageId) return NextResponse.json({ success: false, error: 'ID da imagem é obrigatório' }, { status: 400 });

        const image = mockStore.imageBank.get(imageId);
        if (!image) return NextResponse.json({ success: false, error: 'Imagem não encontrada' }, { status: 404 });

        const removedFrom: string[] = [];

        // CASCADE: Remove from cities
        for (const [cityId, city] of mockStore.cities.entries()) {
            if (city.image_url === image.url) {
                city.image_url = null;
                mockStore.cities.set(cityId, city);
                removedFrom.push(`Cidade: ${city.name}`);
            }
        }

        // CASCADE: Remove from siteSettings (all sections with image_url)
        for (const [sectionKey, section] of Object.entries(mockStore.siteSettings)) {
            if (section && typeof section === 'object') {
                if ((section as any).image_url === image.url) {
                    (section as any).image_url = '';
                    removedFrom.push(`Settings: ${sectionKey}`);
                }
            }
        }

        // CASCADE: Remove from questions
        for (const [qId, question] of mockStore.questions.entries()) {
            if (question.image_url === image.url) {
                question.image_url = null;
                mockStore.questions.set(qId, question);
                removedFrom.push(`Pergunta: ${qId}`);
            }
        }

        // Delete from image bank
        mockStore.imageBank.delete(imageId);

        // Try to delete the physical file if it's a local upload
        if (image.url.startsWith('/uploads/')) {
            try {
                const filePath = path.join(process.cwd(), 'public', image.url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    removedFrom.push('Arquivo físico removido');
                }
            } catch { /* ignore file delete errors */ }
        }

        persistAdminData();

        return NextResponse.json({
            success: true,
            data: { removedFrom, message: `Imagem removida de ${removedFrom.length} lugar(es)` },
        });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro ao deletar imagem' }, { status: 500 });
    }
}

// Helper: find where a URL is used across the database
function findUsages(url: string): string[] {
    const usages: string[] = [];

    for (const city of mockStore.cities.values()) {
        if (city.image_url === url) usages.push(`city:${city.id}`);
    }

    for (const [key, section] of Object.entries(mockStore.siteSettings)) {
        if (section && typeof section === 'object' && (section as any).image_url === url) {
            usages.push(`settings:${key}`);
        }
    }

    for (const q of mockStore.questions.values()) {
        if (q.image_url === url) usages.push(`question:${q.id}`);
    }

    return usages;
}

// Refresh all usedIn fields in the image bank
function refreshImageUsages() {
    for (const [id, img] of mockStore.imageBank.entries()) {
        img.usedIn = findUsages(img.url);
        mockStore.imageBank.set(id, img);
    }
}

function extractNameFromUrl(url: string): string {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1].split('?')[0];
        return decodeURIComponent(filename) || 'imagem';
    } catch {
        return 'imagem';
    }
}

function guessType(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('.png')) return 'image/png';
    if (lower.includes('.webp')) return 'image/webp';
    if (lower.includes('.gif')) return 'image/gif';
    if (lower.includes('.svg')) return 'image/svg+xml';
    return 'image/jpeg';
}
