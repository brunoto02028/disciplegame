import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@disciplegame.com';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!transporter && SMTP_HOST && SMTP_USER && SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
    }
    return transporter;
}

export async function sendVerificationCode(to: string, code: string): Promise<boolean> {
    const t = getTransporter();
    if (!t) {
        console.error('[EMAIL] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local');
        return false;
    }

    try {
        await t.sendMail({
            from: `"O Discípulo Admin" <${SMTP_FROM}>`,
            to,
            subject: `🔐 Código de Verificação: ${code}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0d0b2e; color: #fff; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #c9a227, #8b6914); padding: 24px; text-align: center;">
                        <h1 style="margin: 0; font-size: 22px; color: #1a0a4a;">O Discípulo — Admin</h1>
                    </div>
                    <div style="padding: 32px 24px; text-align: center;">
                        <p style="color: #ccc; font-size: 14px; margin-bottom: 24px;">
                            Seu código de verificação para acessar o painel admin:
                        </p>
                        <div style="background: rgba(201,162,39,0.15); border: 2px solid #c9a227; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
                            <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #c9a227; font-family: monospace;">${code}</span>
                        </div>
                        <p style="color: #888; font-size: 12px; margin-top: 24px;">
                            Este código expira em <strong>5 minutos</strong>.<br>
                            Se você não solicitou este código, ignore este email.
                        </p>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; text-align: center;">
                        <p style="color: #555; font-size: 11px; margin: 0;">© 2026 O Discípulo — disciplegame.com</p>
                    </div>
                </div>
            `,
        });
        console.log(`[EMAIL] Verification code sent to ${to}`);
        return true;
    } catch (err) {
        console.error('[EMAIL] Failed to send:', err);
        return false;
    }
}
