'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CertificatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [svgUrl, setSvgUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/certificate', { credentials: 'include' })
            .then(r => {
                if (!r.ok) { router.push('/auth/login'); return null; }
                return r.text();
            })
            .then(svg => {
                if (svg) {
                    const blob = new Blob([svg], { type: 'image/svg+xml' });
                    setSvgUrl(URL.createObjectURL(blob));
                }
                setLoading(false);
            })
            .catch(() => { setError('Erro ao carregar certificado'); setLoading(false); });
    }, [router]);

    const handleDownload = () => {
        if (!svgUrl) return;
        const a = document.createElement('a');
        a.href = svgUrl;
        a.download = 'certificado-o-discipulo.svg';
        a.click();
    };

    const handleShare = () => {
        const text = 'Recebi meu Certificado de Peregrino Digital no jogo O Discípulo! 🏆✝️ Jogue também em disciplegame.com';
        if (navigator.share) navigator.share({ title: 'Certificado - O Discípulo', text });
        else navigator.clipboard.writeText(text);
    };

    const goldBorder = '1px solid rgba(201,162,39,0.35)';

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", padding: '24px 16px' }}>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <Link href="/dashboard" style={{ color: '#c9a227', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 20, fontWeight: 800 }}>Certificado</h1>
                    <div style={{ width: 70 }} />
                </div>

                {error ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <p style={{ color: '#e74c3c' }}>{error}</p>
                    </div>
                ) : svgUrl ? (
                    <>
                        {/* Certificate preview */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 16, padding: 16, marginBottom: 20 }}>
                            <img src={svgUrl} alt="Certificado de Peregrino Digital" style={{ width: '100%', borderRadius: 10 }} />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button onClick={handleDownload} style={{ padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                📥 Baixar SVG
                            </button>
                            <button onClick={handleShare} style={{ padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: goldBorder, color: '#c9a227', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                📤 Compartilhar
                            </button>
                        </div>

                        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 16, lineHeight: 1.6 }}>
                            Complete todas as cidades para obter o selo "Jornada Completa" no seu certificado!
                        </p>
                    </>
                ) : null}
            </div>
        </div>
    );
}
