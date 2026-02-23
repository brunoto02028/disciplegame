'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const MVP_CIRCUIT_ID = '00000000-0000-0000-0000-000000000001';

export default function RoomPage() {
    const router = useRouter();
    const [tab, setTab] = useState<'create' | 'join'>('join');
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [roomName, setRoomName] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(20);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/cities?circuitId=${MVP_CIRCUIT_ID}`)
            .then(r => r.json())
            .then(d => { if (d.success) setCities(d.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleCreate = async () => {
        if (!selectedCity) { setError('Selecione uma cidade'); return; }
        setCreating(true); setError('');
        const res = await fetch('/api/rooms', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ action: 'create', cityId: selectedCity, name: roomName, maxPlayers }),
        });
        const data = await res.json();
        if (data.success) setResult(data.data);
        else setError(data.error || 'Erro ao criar sala');
        setCreating(false);
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) { setError('Digite o código da sala'); return; }
        setJoining(true); setError('');
        const res = await fetch('/api/rooms', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ action: 'join', code: joinCode.trim().toUpperCase() }),
        });
        const data = await res.json();
        if (data.success) setResult({ ...data.data, joined: true });
        else setError(data.error || 'Sala não encontrada');
        setJoining(false);
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

    // Room created/joined — show success
    if (result) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>{result.joined ? '✅' : '🏠'}</div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                        {result.joined ? 'Entrou na Sala!' : 'Sala Criada!'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>{result.cityName}</p>

                    {result.code && (
                        <div style={{ ...glass, padding: 20, marginBottom: 20 }}>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Código da Sala</p>
                            <p style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 800, color: '#c9a227', letterSpacing: 6 }}>{result.code}</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Compartilhe este código com os participantes</p>
                            <button onClick={() => {
                                const text = `Entre na minha sala de O Discípulo! Código: ${result.code}\n${result.shareLink || 'disciplegame.com/room'}`;
                                if (navigator.share) navigator.share({ title: 'Sala - O Discípulo', text });
                                else navigator.clipboard.writeText(text);
                            }} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                                📤 Compartilhar Código
                            </button>
                        </div>
                    )}

                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                        {result.playerCount || 1} jogador(es) na sala
                    </p>

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
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <Link href="/dashboard" style={{ color: '#c9a227', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Dashboard</Link>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 20, fontWeight: 800 }}>Sala / Grupo</h1>
                    <div style={{ width: 70 }} />
                </div>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                    Crie uma sala para jogar com amigos, grupos de igreja ou escola bíblica dominical.
                </p>

                {/* Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 24, borderRadius: 12, overflow: 'hidden', border: goldBorder }}>
                    <button onClick={() => { setTab('join'); setError(''); }} style={{ padding: '12px', background: tab === 'join' ? 'rgba(201,162,39,0.15)' : 'transparent', border: 'none', color: tab === 'join' ? '#c9a227' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        Entrar na Sala
                    </button>
                    <button onClick={() => { setTab('create'); setError(''); }} style={{ padding: '12px', background: tab === 'create' ? 'rgba(201,162,39,0.15)' : 'transparent', border: 'none', borderLeft: goldBorder, color: tab === 'create' ? '#c9a227' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        Criar Sala
                    </button>
                </div>

                {error && (
                    <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, textAlign: 'center' }}>
                        <p style={{ color: '#e74c3c', fontSize: 13 }}>{error}</p>
                    </div>
                )}

                {tab === 'join' && (
                    <div style={{ ...glass, padding: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Código da Sala</label>
                        <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Ex: ABC123" maxLength={6} style={{ ...inputStyle, textAlign: 'center', fontSize: 24, fontFamily: 'monospace', letterSpacing: 6, fontWeight: 800 }} />
                        <button onClick={handleJoin} disabled={joining || !joinCode.trim()} style={{ width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, background: joinCode.trim() ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(255,255,255,0.06)', border: 'none', color: joinCode.trim() ? '#1a0a4a' : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 15, cursor: joinCode.trim() ? 'pointer' : 'not-allowed' }}>
                            {joining ? 'Entrando...' : '🚪 Entrar na Sala'}
                        </button>
                    </div>
                )}

                {tab === 'create' && (
                    <div style={{ ...glass, padding: 24 }}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Nome da Sala (opcional)</label>
                            <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Ex: EBD Domingo" style={inputStyle} />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Cidade</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {cities.map(c => (
                                    <button key={c.id} onClick={() => setSelectedCity(c.id)} style={{ padding: '12px 14px', borderRadius: 10, background: selectedCity === c.id ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.03)', border: selectedCity === c.id ? '1px solid rgba(201,162,39,0.6)' : '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 18 }}>{c.flag || '🌍'}</span>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</p>
                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.country}</p>
                                        </div>
                                        {selectedCity === c.id && <span style={{ marginLeft: 'auto', color: '#c9a227', fontWeight: 700 }}>✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Máx. Jogadores</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {[5, 10, 20, 50].map(n => (
                                    <button key={n} onClick={() => setMaxPlayers(n)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: maxPlayers === n ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.03)', border: maxPlayers === n ? '1px solid rgba(201,162,39,0.6)' : '1px solid rgba(255,255,255,0.08)', color: maxPlayers === n ? '#c9a227' : 'rgba(255,255,255,0.5)', fontWeight: 700, cursor: 'pointer' }}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleCreate} disabled={creating || !selectedCity} style={{ width: '100%', padding: '14px', borderRadius: 12, background: selectedCity ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(255,255,255,0.06)', border: 'none', color: selectedCity ? '#1a0a4a' : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 15, cursor: selectedCity ? 'pointer' : 'not-allowed' }}>
                            {creating ? 'Criando...' : '🏠 Criar Sala'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
