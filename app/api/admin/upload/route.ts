import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { isValidSession } from '@/lib/adminSession';
import { mockStore, generateId, persistAdminData } from '@/lib/mockDb';
import type { ImageBankItem } from '@/lib/mockDb';

export async function POST(request: NextRequest) {
    if (!isValidSession(request.cookies.get('admin_session')?.value)) {
        return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const category = (formData.get('category') as string) || 'general';

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ success: false, error: 'Invalid file type. Allowed: jpg, png, webp, gif, svg' }, { status: 400 });
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ success: false, error: 'File too large. Max 5MB' }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);
        await mkdir(uploadDir, { recursive: true });

        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        const bytes = await file.arrayBuffer();
        await writeFile(filepath, Buffer.from(bytes));

        const url = `/uploads/${category}/${filename}`;

        // Auto-register in image bank
        const imgId = 'img-' + generateId();
        const bankItem: ImageBankItem = {
            id: imgId, url, name: file.name || filename,
            category, size: file.size, type: file.type,
            usedIn: [], uploaded_at: new Date().toISOString(),
        };
        mockStore.imageBank.set(imgId, bankItem);
        persistAdminData();

        return NextResponse.json({
            success: true,
            data: { url, filename, category, size: file.size, type: file.type, imageBankId: imgId },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}

export async function GET() {
    const fs = await import('fs/promises');
    const p = await import('path');

    try {
        const uploadsBase = p.default.join(process.cwd(), 'public', 'uploads');
        const categories = ['cities', 'maps', 'heroes', 'general', 'icons'];
        const files: { url: string; filename: string; category: string }[] = [];

        for (const cat of categories) {
            const dir = p.default.join(uploadsBase, cat);
            try {
                const entries = await fs.readdir(dir);
                for (const entry of entries) {
                    files.push({ url: `/uploads/${cat}/${entry}`, filename: entry, category: cat });
                }
            } catch { /* dir doesn't exist yet */ }
        }

        return NextResponse.json({ success: true, data: files });
    } catch {
        return NextResponse.json({ success: true, data: [] });
    }
}
