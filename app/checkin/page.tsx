'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const MVP_CIRCUIT_ID = '00000000-0000-0000-0000-000000000001';

export default function CheckinPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [cities, setCities] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [gpsStatus, setGpsStatus] = useState('');
    const [qrMode, setQrMode] = useState(false);
    const [qrCode, setQrCode] = useState('');

    useEffect(() => {
        Promise.all([
            fetch(`/api/cities?circuitId=${MVP_CIRCUIT_ID}`).then(r => r.json()),
            fetch('/api/checkin', { credentials: 'include' }).then(r => r.json()),
        ]).then(([citiesData, checkinData]) => {
            if (citiesData.success) setCities(citiesData.data);
            if (checkinData.success) setHistory(checkinData.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleGPSCheckin = async () => {
        if (!selectedCity) { setError('Selecione uma cidade'); return; }
        setChecking(true); setError(''); setGpsStatus('Obtendo localização...');

        if (!navigator.geolocation) {
            setError('GPS não disponível neste dispositivo');
            setChecking(false); setGpsStatus('');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                setGpsStatus('Verificando proximidade...');
                try {
                    const res = await fetch('/api/checkin', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                        body: JSON.stringify({ type: 'gps', cityId: selectedCity, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                    });
                    const data = await res.json();
                    if (data.success) setResult(data.data);
                    else setError(data.error || 'Check-in falhou');
                } catch { setError('Erro de conexão'); }
                setChecking(false); setGpsStatus('');
            },
            (err) => {
                setError('Não foi possível obter localização. Permita o acesso ao GPS.');
                setChecking(false); setGpsStatus('');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleQRCheckin = async () => {
        if (!selectedCity || !qrCode.trim()) { setError('Selecione uma cidade e insira o código QR'); return; }
        setChecking(true); setError('');
        try {
            const res = await fetch('/api/checkin', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ type: 'qr', cityId: selectedCity, qrCode: qrCode.trim() }),
            });
            const data = await res.json();
            if (data.success) setResult(data.data);
            else setError(data.error || 'QR inválido');
        } catch { setError('Erro de conexão'); }
        setChecking(false);
    };

    const goldBorder = '1px solid rgba(201,162,39,0.35)';
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 16 };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', fontSize: 14, border: goldBorder, borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit' };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    // Success result
    if (result) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Check-in Realizado!</h1>
                    <p style={{ color: '#c9a227', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{result.cityName}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>{result.badge}</p>

                    <div style={{ ...glass, padding: 16, marginBottom: 20 }}>
                        <p style={{ fontSize: 24, fontWeight: 800, color: '#c9a227', fontFamily: "'Playfair Display','Georgia',serif" }}>+{result.xpEarned} XP</p>
                        {result.levelUp && <p style={{ fontSize: 13, color: '#2ecc71', marginTop: 4 }}>🎉 Subiu para nível {result.newLevel}!</p>}
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{result.totalCheckins} check-ins totais</p>
                    </div>

                    <button onClick={() => {
                        const text = `Fiz check-in em ${result.cityName} no O Discípulo! 📍✝️ Jogue em disciplegame.com`;
                        if (navigator.share) navigator.share({ title: 'Check-in - O Discípulo', text });
                        else navigator.clipboard.writeText(text);
                    }} style={{ padding: '12px 24px', borderRadius: 10, background: 'rgba(201,162,39,0.12)', border: goldBorder, color: '#c9a227', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>
                        📤 Compartilhar Check-in
                    </button>
                    <br />
                    <Link href="/dashboard" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", padding: '24px 16px' }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <Link href="/dashboard" style={{ color: '#c9a227', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 20, fontWeight: 800 }}>Check-in</h1>
                    <div style={{ width: 70 }} />
                </div>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                    Visite os locais bíblicos reais e faça check-in via GPS ou QR Code para ganhar <strong style={{ color: '#c9a227' }}>300 XP</strong>!
                </p>

                {/* Mode toggle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: goldBorder }}>
                    <button onClick={() => { setQrMode(false); setError(''); }} style={{ padding: '12px', background: !qrMode ? 'rgba(201,162,39,0.15)' : 'transparent', border: 'none', color: !qrMode ? '#c9a227' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        📍 GPS
                    </button>
                    <button onClick={() => { setQrMode(true); setError(''); }} style={{ padding: '12px', background: qrMode ? 'rgba(201,162,39,0.15)' : 'transparent', border: 'none', borderLeft: goldBorder, color: qrMode ? '#c9a227' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        📷 QR Code
                    </button>
                </div>

                {error && (
                    <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, textAlign: 'center' }}>
                        <p style={{ color: '#e74c3c', fontSize: 13 }}>{error}</p>
                    </div>
                )}

                {/* City selector */}
                <div style={{ ...glass, padding: 20, marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>Selecione a cidade</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {cities.map(c => (
                            <button key={c.id} onClick={() => setSelectedCity(c.id)} style={{ padding: '12px 14px', borderRadius: 10, background: selectedCity === c.id ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.03)', border: selectedCity === c.id ? '1px solid rgba(201,162,39,0.6)' : '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 18 }}>{c.flag || '🌍'}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</p>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.country}</p>
                                </div>
                                {selectedCity === c.id && <span style={{ color: '#c9a227', fontWeight: 700 }}>✓</span>}
                            </button>
                        ))}
                    </div>

                    {qrMode && (
                        <div style={{ marginTop: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Código QR</label>
                            <input value={qrCode} onChange={e => setQrCode(e.target.value)} placeholder="Ex: DISCIPLE-city-001-ABC" style={inputStyle} />
                        </div>
                    )}

                    <button onClick={qrMode ? handleQRCheckin : handleGPSCheckin} disabled={checking || !selectedCity}
                        style={{ width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, background: selectedCity ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(255,255,255,0.06)', border: 'none', color: selectedCity ? '#1a0a4a' : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 15, cursor: selectedCity ? 'pointer' : 'not-allowed' }}>
                        {checking ? (gpsStatus || 'Verificando...') : qrMode ? '📷 Validar QR Code' : '📍 Fazer Check-in GPS'}
                    </button>
                </div>

                {/* History */}
                {history.length > 0 && (
                    <div style={{ ...glass, padding: 16 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>HISTÓRICO DE CHECK-INS</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {history.map((c, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                                    <span style={{ fontSize: 16 }}>{c.cityFlag || '📍'}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: 13 }}>{c.cityName}</p>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{c.date}</p>
                                    </div>
                                    <span style={{ fontSize: 12, color: '#2ecc71' }}>✓</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
