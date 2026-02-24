import { NextRequest, NextResponse } from 'next/server';
import { isValidSession } from '@/lib/adminSession';
import { getProviderConfig, updateProviderConfig, updateProvider, testProvider, addProvider } from '@/lib/ai-providers';

function requireAdmin(req: NextRequest) {
    return isValidSession(req.cookies.get('admin_session')?.value);
}

// GET - list all providers and config
export async function GET(request: NextRequest) {
    if (!requireAdmin(request)) {
        return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const config = getProviderConfig();
    // Mask API keys for security (show only last 8 chars)
    const masked = {
        ...config,
        providers: config.providers.map(p => ({
            ...p,
            apiKey: p.apiKey ? `***${p.apiKey.slice(-8)}` : '',
            hasKey: !!p.apiKey,
        })),
    };
    return NextResponse.json({ success: true, data: masked });
}

// POST - update provider config or test connection
export async function POST(request: NextRequest) {
    if (!requireAdmin(request)) {
        return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'test') {
            const result = await testProvider(body.providerId);
            return NextResponse.json({ success: true, data: result });
        }

        if (action === 'update_provider') {
            const { providerId, updates } = body;
            // If setting API key, also write to .env.local
            if (updates.apiKey && updates.envVar) {
                await writeEnvVar(updates.envVar, updates.apiKey);
            }
            const provider = updateProvider(providerId, updates);
            if (!provider) return NextResponse.json({ success: false, error: 'Provider not found' }, { status: 404 });
            return NextResponse.json({ success: true, data: { ...provider, apiKey: provider.apiKey ? `***${provider.apiKey.slice(-8)}` : '' } });
        }

        if (action === 'set_defaults') {
            const config = updateProviderConfig({
                defaultImageProvider: body.defaultImageProvider,
                defaultTextProvider: body.defaultTextProvider,
            });
            return NextResponse.json({ success: true, data: config });
        }

        if (action === 'toggle') {
            const provider = updateProvider(body.providerId, { enabled: body.enabled });
            if (!provider) return NextResponse.json({ success: false, error: 'Provider not found' }, { status: 404 });
            return NextResponse.json({ success: true });
        }

        if (action === 'add_provider') {
            const config = addProvider(body.provider);
            return NextResponse.json({ success: true, data: config });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error?.message || 'Error' }, { status: 500 });
    }
}

// Write env var to .env.local
async function writeEnvVar(key: string, value: string) {
    const fs = await import('fs');
    const path = await import('path');
    const envPath = path.default.join(process.cwd(), '.env.local');
    try {
        let content = '';
        if (fs.default.existsSync(envPath)) {
            content = fs.default.readFileSync(envPath, 'utf-8');
        }
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(content)) {
            content = content.replace(regex, `${key}=${value}`);
        } else {
            content += `\n${key}=${value}`;
        }
        fs.default.writeFileSync(envPath, content.trim() + '\n', 'utf-8');
        // Also set in process.env for immediate use
        process.env[key] = value;
    } catch (e) {
        console.error(`Error writing ${key} to .env.local:`, e);
    }
}
