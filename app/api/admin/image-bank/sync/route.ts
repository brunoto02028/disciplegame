import { NextRequest, NextResponse } from 'next/server';
import { mockStore, generateId, persistAdminData } from '@/lib/mockDb';
import type { ImageBankItem } from '@/lib/mockDb';
import { isValidSession } from '@/lib/adminSession';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

// POST: Scan all images used across the site and add them to the image bank
export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const existingUrls = new Set<string>();
    for (const img of mockStore.imageBank.values()) {
        existingUrls.add(img.url);
    }

    const added: string[] = [];

    function addImage(url: string, name: string, category: string, usedIn: string[]) {
        if (!url || existingUrls.has(url)) return;
        existingUrls.add(url);

        const id = 'img-' + generateId();
        const item: ImageBankItem = {
            id,
            url,
            name,
            category,
            size: 0,
            type: guessType(url),
            usedIn,
            uploaded_at: new Date().toISOString(),
        };
        mockStore.imageBank.set(id, item);
        added.push(name);
    }

    // 1. Scan cities — main images and tourist spots
    for (const city of mockStore.cities.values()) {
        if (city.image_url) {
            addImage(city.image_url, `${city.name} — Principal`, 'cities', [`city:${city.id}`]);
        }
        if (city.tourist_spots && Array.isArray(city.tourist_spots)) {
            for (const spot of city.tourist_spots) {
                if (spot.image_url) {
                    addImage(spot.image_url, `${city.name} — ${spot.name}`, 'cities', [`city:${city.id}:tourist_spot`]);
                }
            }
        }
    }

    // 2. Scan site settings — hero, sections, etc.
    for (const [sectionKey, section] of Object.entries(mockStore.siteSettings)) {
        if (section && typeof section === 'object') {
            const s = section as Record<string, any>;
            if (s.image_url) {
                const sectionNames: Record<string, string> = {
                    hero: 'Hero Banner',
                    cities: 'Seção Cidades',
                    map: 'Mapa de Paulo',
                    howItWorks: 'Como Funciona',
                    cta: 'Call to Action',
                    footer: 'Rodapé',
                    about: 'Sobre',
                    testimonials: 'Depoimentos',
                    faq: 'FAQ',
                };
                addImage(s.image_url, sectionNames[sectionKey] || `Settings — ${sectionKey}`, 'settings', [`settings:${sectionKey}`]);
            }
            // Check for stats images or nested image arrays
            if (s.stats && Array.isArray(s.stats)) {
                for (const stat of s.stats) {
                    if (stat.image_url) {
                        addImage(stat.image_url, `${sectionKey} — stat`, 'settings', [`settings:${sectionKey}`]);
                    }
                }
            }
        }
    }

    // 3. Scan questions with images
    for (const q of mockStore.questions.values()) {
        if (q.image_url) {
            addImage(q.image_url, `Pergunta — ${q.question_text?.substring(0, 40)}...`, 'general', [`question:${q.id}`]);
        }
    }

    if (added.length > 0) {
        persistAdminData();
    }

    return NextResponse.json({
        success: true,
        data: {
            added: added.length,
            total: mockStore.imageBank.size,
            images: added,
        },
    });
}

function guessType(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('.png')) return 'image/png';
    if (lower.includes('.webp')) return 'image/webp';
    if (lower.includes('.gif')) return 'image/gif';
    if (lower.includes('.svg')) return 'image/svg+xml';
    return 'image/jpeg';
}
