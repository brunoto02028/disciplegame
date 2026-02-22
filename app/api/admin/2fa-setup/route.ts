import { NextRequest, NextResponse } from 'next/server';
import { generateOTPAuthURI } from '@/lib/totp';
import { isValidSession } from '@/lib/adminSession';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';
const ADMIN_TOTP_SECRET = process.env.ADMIN_TOTP_SECRET || '';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        // Require admin password to view 2FA setup
        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json({ success: false, error: 'Senha incorreta' }, { status: 401 });
        }

        if (!ADMIN_TOTP_SECRET) {
            return NextResponse.json({ success: false, error: '2FA não configurado. Adicione ADMIN_TOTP_SECRET no .env.local' }, { status: 500 });
        }

        const otpauthUri = generateOTPAuthURI(ADMIN_TOTP_SECRET, 'admin@disciplegame.com', 'O Discípulo Admin');
        // Generate QR code URL via Google Charts API (no dependency needed)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUri)}`;

        return NextResponse.json({
            success: true,
            data: {
                secret: ADMIN_TOTP_SECRET,
                otpauth_uri: otpauthUri,
                qr_url: qrUrl,
            }
        });
    } catch {
        return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
    }
}
