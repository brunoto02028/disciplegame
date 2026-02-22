'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RankingPage() {
    const [rankings, setRankings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rankRes, profileRes] = await Promise.all([
                    fetch('/api/rankings?limit=50'),
                    fetch('/api/user/profile', { credentials: 'include' }),
                ]);
                const rankData = await rankRes.json();
                const profileData = await profileRes.json();
                if (rankData.success) setRankings(rankData.data);
                if (profileData.success) setCurrentUser(profileData.data);
            } catch { }
            setLoading(false);
        };
        fetchData();
    }, []);

    const goldBorder = '1px solid rgba(201,162,39,0.35)';
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 16, backdropFilter: 'blur(16px)' };
    const medals = ['linear-gradient(135deg,#c9a227,#8b6914)', 'linear-gradient(135deg,#b0b8c1,#8a9299)', 'linear-gradient(135deg,#cd7f32,#a0522d)'];
    const medalIcons = ['👑', '🛡️', '🏅'];

    const formatTime = (s: number) => `${Math.floor(s / 60)}min ${s % 60}s`;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>

            {/* Header */}
            <header style={{ background: 'rgba(13,11,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: goldBorder, padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#c9a227', fontSize: 14, fontWeight: 600 }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="20" rx="1" fill="#fff" /><rect x="4" y="7" width="16" height="4" rx="1" fill="#fff" /></svg>
                    </div>
                    <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 16 }}>O Discipulo</span>
                </div>
            </header>

            <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ flex: 1, maxWidth: 60, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,162,39,0.5))' }} />
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="20" rx="1" fill="#c9a227" /><rect x="4" y="7" width="16" height="4" rx="1" fill="#c9a227" /></svg>
                        <div style={{ flex: 1, maxWidth: 60, height: 1, background: 'linear-gradient(90deg,rgba(201,162,39,0.5),transparent)' }} />
                    </div>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Ranking Global</h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>MVP Inicial — Circuito das Viagens de Paulo</p>
                </div>

                {/* Top 3 podium */}
                {!loading && rankings.length >= 3 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 12, marginBottom: 28, alignItems: 'flex-end' }}>
                        {/* 2nd */}
                        <div style={{ background: 'rgba(176,184,193,0.06)', border: '1px solid rgba(176,184,193,0.25)', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: medals[1], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, margin: '0 auto 10px', color: '#1a1f2e' }}>2</div>
                            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rankings[1].user_name}</p>
                            <p style={{ color: '#c9a227', fontWeight: 700, fontSize: 16 }}>{rankings[1].total_points.toLocaleString('pt-BR')}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{rankings[1].accuracy_percentage}% precisão</p>
                        </div>
                        {/* 1st */}
                        <div style={{ background: 'rgba(201,162,39,0.08)', border: '2px solid rgba(201,162,39,0.45)', borderRadius: 16, padding: '28px 16px', textAlign: 'center', boxShadow: '0 0 32px rgba(201,162,39,0.15)' }}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>👑</div>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: medals[0], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, margin: '0 auto 10px', color: '#1a1f2e', boxShadow: '0 0 20px rgba(245,197,24,0.4)' }}>1</div>
                            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rankings[0].user_name}</p>
                            <p style={{ color: '#c9a227', fontWeight: 800, fontSize: 20 }}>{rankings[0].total_points.toLocaleString('pt-BR')}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{rankings[0].accuracy_percentage}% precisão</p>
                        </div>
                        {/* 3rd */}
                        <div style={{ background: 'rgba(205,127,50,0.1)', border: '1px solid rgba(205,127,50,0.3)', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>🏅</div>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: medals[2], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, margin: '0 auto 10px', color: '#fff' }}>3</div>
                            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rankings[2].user_name}</p>
                            <p style={{ color: '#c9a227', fontWeight: 700, fontSize: 16 }}>{rankings[2].total_points.toLocaleString('pt-BR')}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{rankings[2].accuracy_percentage}% precisão</p>
                        </div>
                    </div>
                )}

                {/* Full table */}
                <div style={{ ...glass, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '48px 1fr 100px 80px 80px', gap: 8, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' as const }}>
                        <span>#</span><span>Jogador</span><span style={{ textAlign: 'right' }}>Pontos</span><span style={{ textAlign: 'right' }}>Precisão</span><span style={{ textAlign: 'right' }}>Tempo</span>
                    </div>

                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                        </div>
                    ) : rankings.length === 0 ? (
                        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
                            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Seja o primeiro no ranking!</p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>Nenhuma partida completada ainda.</p>
                            <Link href="/dashboard" style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Jogar Agora</Link>
                        </div>
                    ) : (
                        rankings.map((player, i) => {
                            const isCurrentUser = currentUser && player.user_id === currentUser.id;
                            const isTop3 = i < 3;
                            return (
                                <div key={player.id} style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '48px 1fr 100px 80px 80px', gap: 8, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: isCurrentUser ? 'rgba(201,162,39,0.08)' : 'transparent', borderLeft: isCurrentUser ? '3px solid #c9a227' : '3px solid transparent' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: isTop3 ? medals[i] : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: isTop3 && i < 2 ? '#1a1f2e' : '#fff' }}>
                                        {isTop3 ? medalIcons[i] : player.rank}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{player.user_name} {isCurrentUser && <span style={{ fontSize: 11, color: '#c9a227', fontWeight: 700 }}>(você)</span>}</p>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{player.country || 'Brasil'}</p>
                                    </div>
                                    <p style={{ textAlign: 'right', fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 15, color: '#c9a227' }}>{player.total_points.toLocaleString('pt-BR')}</p>
                                    <p style={{ textAlign: 'right', fontSize: 13, color: player.accuracy_percentage >= 80 ? '#2ecc71' : player.accuracy_percentage >= 60 ? '#c9a227' : '#e74c3c' }}>{player.accuracy_percentage}%</p>
                                    <p style={{ textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatTime(player.total_time_seconds)}</p>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Your position if not in top */}
                {!loading && currentUser && rankings.length > 0 && !rankings.slice(0, 10).find((r: any) => r.user_id === currentUser.id) && (
                    <div style={{ marginTop: 12, ...glass, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 20 }}>📍</div>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Voce ainda nao esta no ranking. <Link href="/dashboard" style={{ color: '#c9a227', fontWeight: 700, textDecoration: 'none' }}>Jogue agora</Link> para entrar!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
