'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<any>(null);

    useEffect(() => {
        fetch('/api/admin/users').then(r => {
            if (r.status === 401) { router.push('/admin/login'); return null; }
            return r.json();
        }).then(d => {
            if (d?.success) setUsers(d.data);
            setLoading(false);
        });
    }, [router]);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 };
    const inputStyle: React.CSSProperties = { padding: '9px 12px', fontSize: 13, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontFamily: 'inherit' };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Usuários</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{users.length} usuários cadastrados</p>
                </div>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Buscar por nome ou email..."
                    style={{ ...inputStyle, width: 260 }}
                />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div style={{ ...glass, overflow: 'hidden', marginBottom: 16 }}>
                        {/* Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px', gap: 8, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                            <span>Nome</span><span>Email</span><span>Partidas</span><span>Pontos</span><span>Precisão</span><span>Desde</span><span></span>
                        </div>

                        {filtered.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                                Nenhum usuário encontrado.
                            </div>
                        ) : (
                            filtered.map((u, i) => (
                                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px', gap: 8, padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, color: '#1a0a4a' }}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</p>
                                            {u.country && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{u.country}</p>}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{u.email}</p>
                                    <p style={{ fontSize: 13, fontWeight: 600 }}>{u.completedSessions}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>/{u.totalSessions}</span></p>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#c9a227' }}>{u.totalPoints.toLocaleString('pt-BR')}</p>
                                    <p style={{ fontSize: 13, color: u.accuracy >= 80 ? '#2ecc71' : u.accuracy >= 60 ? '#f5c518' : u.accuracy > 0 ? '#e74c3c' : 'rgba(255,255,255,0.3)' }}>
                                        {u.accuracy > 0 ? u.accuracy + '%' : '—'}
                                    </p>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{formatDate(u.createdAt)}</p>
                                    <button onClick={() => setSelected(u)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                        Ver
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                        {[
                            { label: 'Total Usuários', value: users.length, icon: '👥' },
                            { label: 'Com Partidas', value: users.filter(u => u.totalSessions > 0).length, icon: '🎮' },
                            { label: 'Melhor Pontuação', value: Math.max(0, ...users.map(u => u.totalPoints)).toLocaleString('pt-BR'), icon: '⭐' },
                            { label: 'Precisão Média', value: users.length > 0 ? Math.round(users.filter(u => u.accuracy > 0).reduce((s, u) => s + u.accuracy, 0) / (users.filter(u => u.accuracy > 0).length || 1)) + '%' : '—', icon: '🎯' },
                        ].map(c => (
                            <div key={c.label} style={{ ...glass, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 24, opacity: 0.7 }}>{c.icon}</span>
                                <div>
                                    <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 22, fontWeight: 800 }}>{c.value}</p>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{c.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* User detail modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 440 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 20, fontWeight: 700 }}>Detalhes do Usuário</h2>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>
                                {selected.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 17 }}>{selected.name}</p>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{selected.email}</p>
                                {selected.church && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>⛪ {selected.church}</p>}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                            {[
                                { label: 'Total de Pontos', value: selected.totalPoints.toLocaleString('pt-BR'), color: '#c9a227' },
                                { label: 'Precisão', value: selected.accuracy + '%', color: selected.accuracy >= 80 ? '#2ecc71' : '#c9a227' },
                                { label: 'Partidas Jogadas', value: selected.totalSessions, color: '#c9a227' },
                                { label: 'Partidas Completas', value: selected.completedSessions, color: '#2ecc71' },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{s.label}</p>
                                    <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
                            🌍 {selected.country || 'País não informado'} · 📅 Cadastrado em {formatDate(selected.createdAt)}
                        </div>
                        <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    function formatDate(d: string) {
        return d ? new Date(d).toLocaleDateString('pt-BR') : '—';
    }
}
