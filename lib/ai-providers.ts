// ═══════════════════════════════════════════════════════════════
// AI Providers - Multi-provider AI service (Gemini, Abacus, etc.)
// ═══════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';
import { persistAdminData } from './mockDb';

export interface AIProvider {
    id: string;
    name: string;
    type: 'image' | 'text' | 'both';
    apiKey: string;
    envVar: string;          // e.g. 'GEMINI_API_KEY'
    enabled: boolean;
    priority: number;        // lower = tried first
    status: 'connected' | 'disconnected' | 'error';
    lastChecked?: string;
    lastError?: string;
    models: string[];
    defaultModel?: string;
    capabilities: ('image_generation' | 'text_generation' | 'chat')[];
}

export interface GenerateImageResult {
    url: string;
    description: string;
    provider: string;
    model: string;
}

export interface AIProviderConfig {
    providers: AIProvider[];
    defaultImageProvider: string;
    defaultTextProvider: string;
}

// ── Default provider definitions ──
const DEFAULT_PROVIDERS: AIProvider[] = [
    {
        id: 'gemini',
        name: 'Google Gemini',
        type: 'both',
        apiKey: '',
        envVar: 'GEMINI_API_KEY',
        enabled: true,
        priority: 1,
        status: 'disconnected',
        models: ['imagen-4.0-generate-001', 'gemini-2.5-flash'],
        defaultModel: 'imagen-4.0-generate-001',
        capabilities: ['image_generation', 'text_generation', 'chat'],
    },
    {
        id: 'abacus',
        name: 'Abacus AI',
        type: 'both',
        apiKey: '',
        envVar: 'ABACUS_API_KEY',
        enabled: true,
        priority: 2,
        status: 'disconnected',
        models: ['stable-diffusion-xl', 'dall-e-3', 'flux-1.1-pro'],
        defaultModel: 'stable-diffusion-xl',
        capabilities: ['image_generation', 'text_generation', 'chat'],
    },
];

// ── Provider config stored in data/ai-providers.json ──
const CONFIG_FILE = path.join(process.cwd(), 'data', 'ai-providers.json');

function loadConfig(): AIProviderConfig {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('[AI Providers] Error loading config:', e);
    }
    return {
        providers: DEFAULT_PROVIDERS,
        defaultImageProvider: 'gemini',
        defaultTextProvider: 'gemini',
    };
}

function saveConfig(config: AIProviderConfig) {
    try {
        const dir = path.dirname(CONFIG_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    } catch (e) {
        console.error('[AI Providers] Error saving config:', e);
    }
}

export function getProviderConfig(): AIProviderConfig {
    const config = loadConfig();
    // Merge env vars into provider keys (env takes precedence)
    for (const p of config.providers) {
        const envKey = process.env[p.envVar];
        if (envKey) {
            p.apiKey = envKey;
        }
    }
    return config;
}

export function updateProviderConfig(updates: Partial<AIProviderConfig>): AIProviderConfig {
    const config = getProviderConfig();
    if (updates.providers) config.providers = updates.providers;
    if (updates.defaultImageProvider) config.defaultImageProvider = updates.defaultImageProvider;
    if (updates.defaultTextProvider) config.defaultTextProvider = updates.defaultTextProvider;
    saveConfig(config);
    return config;
}

export function updateProvider(id: string, updates: Partial<AIProvider>): AIProvider | null {
    const config = getProviderConfig();
    const idx = config.providers.findIndex(p => p.id === id);
    if (idx === -1) return null;
    config.providers[idx] = { ...config.providers[idx], ...updates };
    saveConfig(config);
    return config.providers[idx];
}

export function addProvider(provider: AIProvider): AIProviderConfig {
    const config = getProviderConfig();
    config.providers.push(provider);
    saveConfig(config);
    return config;
}

// ── Test provider connection ──
export async function testProvider(id: string): Promise<{ ok: boolean; message: string }> {
    const config = getProviderConfig();
    const provider = config.providers.find(p => p.id === id);
    if (!provider) return { ok: false, message: 'Provider not found' };
    if (!provider.apiKey) return { ok: false, message: 'API key not configured' };

    try {
        if (provider.id === 'gemini') {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${provider.apiKey}`
            );
            if (res.ok) {
                updateProvider(id, { status: 'connected', lastChecked: new Date().toISOString(), lastError: undefined });
                return { ok: true, message: 'Connected successfully' };
            }
            const err = await res.text();
            updateProvider(id, { status: 'error', lastChecked: new Date().toISOString(), lastError: err.slice(0, 200) });
            return { ok: false, message: `Error: ${res.status}` };
        }

        if (provider.id === 'abacus') {
            const res = await fetch('https://api.abacus.ai/api/listModels', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${provider.apiKey}` },
            });
            if (res.ok || res.status === 200) {
                updateProvider(id, { status: 'connected', lastChecked: new Date().toISOString(), lastError: undefined });
                return { ok: true, message: 'Connected successfully' };
            }
            // Abacus may return 401 for invalid key
            const err = await res.text();
            updateProvider(id, { status: 'error', lastChecked: new Date().toISOString(), lastError: err.slice(0, 200) });
            return { ok: false, message: `Error: ${res.status}` };
        }

        // Generic test - just check if key is non-empty
        updateProvider(id, { status: 'connected', lastChecked: new Date().toISOString() });
        return { ok: true, message: 'Key configured (not validated)' };
    } catch (e: any) {
        updateProvider(id, { status: 'error', lastChecked: new Date().toISOString(), lastError: e?.message });
        return { ok: false, message: e?.message || 'Connection failed' };
    }
}

// ── Save base64 image to disk ──
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

// ── Delete an image file from disk ──
export function deleteImageFile(url: string): boolean {
    if (!url || !url.startsWith('/uploads/')) return false;
    try {
        const filePath = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[AI Providers] Deleted old image: ${url}`);
            return true;
        }
    } catch (e) {
        console.error(`[AI Providers] Error deleting image ${url}:`, e);
    }
    return false;
}

// ── Generate image with best available provider ──
export async function generateImage(
    prompt: string,
    count: number = 1,
    onProgress?: (pct: number, msg: string) => void
): Promise<GenerateImageResult[]> {
    const config = getProviderConfig();
    const imageProviders = config.providers
        .filter(p => p.enabled && p.apiKey && p.capabilities.includes('image_generation'))
        .sort((a, b) => {
            // Prefer the default provider
            if (a.id === config.defaultImageProvider) return -1;
            if (b.id === config.defaultImageProvider) return 1;
            return a.priority - b.priority;
        });

    if (imageProviders.length === 0) {
        throw new Error('No AI image providers configured. Go to Admin > AI Providers to set up.');
    }

    const numImages = Math.min(count, 4);
    const results: GenerateImageResult[] = [];
    const errors: string[] = [];

    for (const provider of imageProviders) {
        onProgress?.(10, `Trying ${provider.name}...`);

        try {
            if (provider.id === 'gemini') {
                const imgs = await generateWithGemini(provider, prompt, numImages, onProgress);
                results.push(...imgs);
            } else if (provider.id === 'abacus') {
                const imgs = await generateWithAbacus(provider, prompt, numImages, onProgress);
                results.push(...imgs);
            }

            if (results.length > 0) {
                onProgress?.(100, 'Done!');
                updateProvider(provider.id, { status: 'connected', lastChecked: new Date().toISOString() });
                return results;
            }
        } catch (e: any) {
            errors.push(`${provider.name}: ${e?.message}`);
            updateProvider(provider.id, { status: 'error', lastChecked: new Date().toISOString(), lastError: e?.message });
        }
    }

    throw new Error(`All providers failed: ${errors.join('; ')}`);
}

// ── Gemini image generation ──
async function generateWithGemini(
    provider: AIProvider,
    prompt: string,
    count: number,
    onProgress?: (pct: number, msg: string) => void
): Promise<GenerateImageResult[]> {
    const results: GenerateImageResult[] = [];

    onProgress?.(20, 'Generating with Imagen 4...');

    // Strategy 1: Imagen 4
    try {
        const imagenRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${provider.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt }],
                    parameters: { sampleCount: count, outputOptions: { mimeType: 'image/png' } },
                }),
            }
        );
        if (imagenRes.ok) {
            onProgress?.(70, 'Saving images...');
            const imagenData = await imagenRes.json();
            for (const pred of (imagenData.predictions || [])) {
                if (pred.bytesBase64Encoded) {
                    const url = saveBase64Image(pred.bytesBase64Encoded, 'image/png');
                    results.push({ url, description: prompt, provider: 'gemini', model: 'imagen-4.0' });
                }
            }
            if (results.length > 0) return results;
        }
    } catch { /* fallback to next strategy */ }

    onProgress?.(40, 'Trying Gemini 2.5 Flash...');

    // Strategy 2: Gemini 2.5 Flash
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(provider.apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            // @ts-ignore
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    onProgress?.(60, 'Generating with Gemini Flash...');

    const result = await model.generateContent(
        `Generate a high-quality, photorealistic image: ${prompt}. Stunning, cinematic, dramatic lighting. Do NOT include any text in the image.`
    );
    const candidates = result.response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
        onProgress?.(80, 'Saving images...');
        for (const part of candidates[0].content.parts) {
            if (part.inlineData?.data && part.inlineData?.mimeType) {
                const url = saveBase64Image(part.inlineData.data, part.inlineData.mimeType);
                results.push({ url, description: prompt, provider: 'gemini', model: 'gemini-2.5-flash' });
            }
        }
    }

    return results;
}

// ── Abacus AI image generation ──
async function generateWithAbacus(
    provider: AIProvider,
    prompt: string,
    count: number,
    onProgress?: (pct: number, msg: string) => void
): Promise<GenerateImageResult[]> {
    const results: GenerateImageResult[] = [];
    const modelToUse = provider.defaultModel || 'stable-diffusion-xl';

    onProgress?.(20, `Generating with Abacus (${modelToUse})...`);

    // Abacus AI image generation API
    const res = await fetch('https://api.abacus.ai/api/generateImage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
            prompt: `${prompt}. High quality, photorealistic, cinematic lighting, no text in image.`,
            model: modelToUse,
            num_images: count,
            width: 1024,
            height: 1024,
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Abacus API ${res.status}: ${errText.slice(0, 200)}`);
    }

    onProgress?.(70, 'Processing Abacus response...');

    const data = await res.json();

    // Abacus returns images as base64 or URLs depending on the model
    if (data.images) {
        onProgress?.(85, 'Saving images...');
        for (const img of data.images) {
            if (img.base64) {
                const url = saveBase64Image(img.base64, 'image/png');
                results.push({ url, description: prompt, provider: 'abacus', model: modelToUse });
            } else if (img.url) {
                // Download from URL and save locally
                try {
                    const imgRes = await fetch(img.url);
                    const buffer = Buffer.from(await imgRes.arrayBuffer());
                    const dir = path.join(process.cwd(), 'public', 'uploads', 'generated');
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
                    fs.writeFileSync(path.join(dir, filename), buffer);
                    results.push({ url: `/uploads/generated/${filename}`, description: prompt, provider: 'abacus', model: modelToUse });
                } catch { /* skip failed download */ }
            }
        }
    } else if (data.result) {
        // Alternative response format
        if (typeof data.result === 'string' && data.result.startsWith('http')) {
            try {
                const imgRes = await fetch(data.result);
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                const dir = path.join(process.cwd(), 'public', 'uploads', 'generated');
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
                fs.writeFileSync(path.join(dir, filename), buffer);
                results.push({ url: `/uploads/generated/${filename}`, description: prompt, provider: 'abacus', model: modelToUse });
            } catch { /* skip */ }
        }
    }

    return results;
}
