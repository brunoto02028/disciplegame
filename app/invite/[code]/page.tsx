'use client';

import { use } from 'react';
import Link from 'next/link';

function CrossIcon({ size = 24, color = '#c9a227' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="10" y="2" width="4" height="20" rx="1" fill={color} />
            <rect x="4" y="7" width="16" height="4" rx="1" fill={color} />
        </svg>
    );
}

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);

    // Store invite code in localStorage for use during registration
    if (typeof window !== 'undefined') {
        localStorage.setItem('invite_code', code);
    }

    const goldBorder = '1px solid rgba(201,162,39,0.35)';

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(201,162,39,0.4)' }}>
                    <CrossIcon size={36} color="#fff" />
                </div>

                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
                    Você foi convidado!
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.7, marginBottom: 12 }}>
                    Um amigo te convidou para jogar <strong style={{ color: '#c9a227' }}>O Discípulo</strong> — um quiz interativo sobre as viagens do Apóstolo Paulo.
                </p>

                <div style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 14, padding: '16px 20px', marginBottom: 28 }}>
                    <p style={{ fontSize: 14, color: '#2ecc71', fontWeight: 700, marginBottom: 4 }}>🎁 Bônus de Boas-Vindas</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Crie sua conta e ganhe <strong style={{ color: '#c9a227' }}>500 pontos bônus</strong> por ter sido convidado!</p>
                </div>

                <Link href="/auth/register" style={{ display: 'block', width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 24px rgba(201,162,39,0.5)', marginBottom: 14 }}>
                    Criar Conta e Ganhar Bônus
                </Link>

                <Link href="/demo" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(39,174,96,0.12)', border: '1px solid rgba(39,174,96,0.3)', color: '#2ecc71', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 14 }}>
                    ▶ Experimentar Antes
                </Link>

                <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                    Saber mais sobre o jogo →
                </Link>
            </div>
        </div>
    );
}
