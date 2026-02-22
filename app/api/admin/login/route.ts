import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();
        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json({ success: false, error: 'Senha incorreta' }, { status: 401 });
        }
        const response = NextResponse.json({ success: true });
        response.cookies.set('admin_session', 'authenticated', {
            httpOnly: true,
            maxAge: 60 * 60 * 8, // 8 hours
            path: '/',
        });
        return response;
    } catch {
        return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');
    return response;
}
