'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats').then(r => {
            if (r.status === 401) { router.push('/admin/login'); return null; }
            return r.json();
        }).then(d => {
            if (d?.success) setStats(d.data);
            setLoading(false);
        }).catch(() => router.push('/admin/login'));
    }, [router]);

    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 };

    const cards = stats ? [
        { label: 'Usuários', value: stats.totalUsers, icon: '👥', color: '#c9a227', sub: 'cadastrados' },
        { label: 'Perguntas', value: stats.totalQuestions, icon: '❓', color: '#d4b84a', sub: 'no banco' },
        { label: 'Cidades', value: stats.totalCities, icon: '🗺️', color: '#f5c518', sub: 'no circuito' },
        { label: 'Partidas', value: stats.totalSessions, icon: '🎮', color: '#27ae60', sub: stats.completedSessions + ' completas' },
        { label: 'Respostas', value: stats.totalAnswers, icon: '✍️', color: '#e74c3c', sub: 'registradas' },
        { label: 'Precisão Global', value: stats.globalAccuracy + '%', icon: '🎯', color: '#2ecc71', sub: 'média geral' },
        { label: 'Pts Médios', value: stats.avgPoints, icon: '⭐', color: '#f5c518', sub: 'por partida' },
        { label: 'Cidade Top', value: stats.topCity || '—', icon: '🏆', color: '#c9a227', sub: 'mais jogada' },
    ] : [];

    const quickActions = [
        { href: '/admin/cities', label: 'Gerenciar Cidades', icon: '🗺️', color: '#c9a227' },
        { href: '/admin/questions', label: 'Perguntas', icon: '❓', color: '#d4b84a' },
        { href: '/admin/settings', label: 'Config. do Site', icon: '⚙️', color: '#f5c518' },
        { href: '/admin/game-rules', label: 'Regras do Jogo', icon: '🎮', color: '#27ae60' },
        { href: '/admin/image-bank', label: 'Banco de Imagens', icon: '🖼️', color: '#9b59b6' },
    ];

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Dashboard Admin</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Visão geral do sistema O Discípulo</p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : (
                <>
                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                        {cards.map(c => (
                            <div key={c.label} style={{ ...glass, padding: '18px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: 1 }}>{c.label}</p>
                                    <span style={{ fontSize: 20, opacity: 0.7 }}>{c.icon}</span>
                                </div>
                                <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, color: c.color, lineHeight: 1, marginBottom: 4 }}>{c.value}</p>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{c.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick actions */}
                    <div style={{ ...glass, padding: '20px 24px', marginBottom: 24 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 16 }}>Ações Rápidas</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                            {quickActions.map(a => (
                                <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', color: '#fff', transition: 'all 0.2s' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color + '22', border: '1px solid ' + a.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{a.icon}</div>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* System info */}
                    <div style={{ ...glass, padding: '20px 24px' }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 16 }}>Estado do Sistema</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { label: 'Banco de Dados', value: 'MockDB (em memória)', status: 'warn', note: 'Migrar para Supabase' },
                                { label: 'Autenticação', value: 'Sessões em memória', status: 'warn', note: 'Migrar para JWT/Supabase Auth' },
                                { label: 'Circuito Ativo', value: 'MVP Inicial', status: 'ok', note: '3 cidades, 27 perguntas' },
                                { label: 'Servidor', value: 'Next.js 16 (Turbopack)', status: 'ok', note: 'localhost:3000' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.status === 'ok' ? '#27ae60' : '#f5c518', flexShrink: 0, boxShadow: '0 0 6px ' + (item.status === 'ok' ? '#27ae60' : '#f5c518') }} />
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{item.label}: <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>{item.value}</span></p>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{item.note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
