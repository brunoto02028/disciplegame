'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, sessionsRes, achievementsRes] = await Promise.all([
                    fetch('/api/user/profile', { credentials: 'include' }),
                    fetch('/api/user/sessions', { credentials: 'include' }),
                    fetch('/api/user/achievements', { credentials: 'include' }),
                ]);
                const profileData = await profileRes.json();
                if (!profileData.success) { router.push('/auth/login'); return; }
                setUser(profileData.data);
                const sessionsData = await sessionsRes.json();
                if (sessionsData.success) setSessions(sessionsData.data);
                const achievementsData = await achievementsRes.json();
                if (achievementsData.success) setAchievements(achievementsData.data);
            } catch { router.push('/auth/login'); }
            setLoading(false);
        };
        fetchData();
    }, [router]);

    const goldBorder = '1px solid rgba(201,162,39,0.35)';
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 16, backdropFilter: 'blur(16px)' };
    const goldCard: React.CSSProperties = { background: 'rgba(201,162,39,0.06)', border: goldBorder, borderRadius: 16, backdropFilter: 'blur(12px)' };

    const formatTime = (s: number) => `${Math.floor(s / 60)}min ${s % 60}s`;
    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    if (!user) return null;

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

            <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

                {/* Profile Hero */}
                <div style={{ ...glass, padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' as const }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, flexShrink: 0, boxShadow: '0 0 32px rgba(201,162,39,0.3)', color: '#1a0a4a', border: '2px solid rgba(201,162,39,0.5)' }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{user.name}</h1>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 8 }}>{user.email}</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                            {user.country && <span style={{ fontSize: 12, background: 'rgba(201,162,39,0.1)', border: goldBorder, borderRadius: 20, padding: '3px 10px', color: '#c9a227' }}>🌍 {user.country}</span>}
                            {user.church && <span style={{ fontSize: 12, background: 'rgba(201,162,39,0.1)', border: goldBorder, borderRadius: 20, padding: '3px 10px', color: '#c9a227' }}>⛪ {user.church}</span>}
                            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 20, padding: '3px 10px', color: 'rgba(255,255,255,0.5)' }}>
                                📅 Desde {user.createdAt ? formatDate(user.createdAt) : '2026'}
                            </span>
                        </div>
                    </div>
                    <Link href="/ranking" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                        Ver Ranking
                    </Link>
                </div>

                {/* Stats */}
                <div className="profile-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                    {([
                        { label: 'TOTAL POINTS', value: user.stats.totalPoints.toLocaleString('pt-BR'), icon: '⭐' },
                        { label: 'PARTIDAS', value: String(user.stats.totalSessions), icon: '🎮' },
                        { label: 'PRECISÃO', value: `${user.stats.avgAccuracy}%`, icon: '🎯' },
                        { label: 'CONQUISTAS', value: String(achievements.filter(a => a.unlocked).length), icon: '🏆' },
                    ] as { label: string; value: string; icon: string }[]).map(({ label, value, icon }) => (
                        <div key={label} style={{ ...goldCard, padding: '16px 18px' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' as const }}>{label}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800 }}>{value}</p>
                                <span style={{ fontSize: 22, opacity: 0.5 }}>{icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="profile-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

                    {/* Session History */}
                    <div style={{ ...glass, padding: 24 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.6)', marginBottom: 18 }}>Histórico de Partidas</p>
                        {sessions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <div style={{ fontSize: 36, marginBottom: 10 }}>🎮</div>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Nenhuma partida ainda.</p>
                                <Link href="/dashboard" style={{ display: 'inline-block', marginTop: 12, padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Jogar Agora</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {sessions.map((s: any, i: number) => (
                                    <div key={s.id || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: s.status === 'completed' ? 'rgba(39,174,96,0.2)' : 'rgba(231,76,60,0.2)', border: `1px solid ${s.status === 'completed' ? 'rgba(39,174,96,0.4)' : 'rgba(231,76,60,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                            {s.status === 'completed' ? '✓' : '✕'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.cityName || 'Circuito MVP'}</p>
                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.completedAt ? formatDate(s.completedAt) : formatDate(s.startedAt)}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 15, color: '#c9a227' }}>{s.total_points || 0} pts</p>
                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.accuracy_percentage || 0}% • {formatTime(s.total_time_seconds || 0)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Achievements */}
                    <div style={{ ...glass, padding: 24 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.6)', marginBottom: 18 }}>Conquistas</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {achievements.map((a: any) => (
                                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: a.unlocked ? 'rgba(201,162,39,0.06)' : 'rgba(255,255,255,0.02)', border: a.unlocked ? goldBorder : '1px solid rgba(255,255,255,0.06)', opacity: a.unlocked ? 1 : 0.5 }}>
                                    <div style={{ fontSize: 28, flexShrink: 0, filter: a.unlocked ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: a.unlocked ? '#c9a227' : 'rgba(255,255,255,0.5)' }}>{a.name}</p>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{a.description}</p>
                                    </div>
                                    {a.unlocked && <div style={{ fontSize: 16 }}>✓</div>}
                                    {!a.unlocked && <div style={{ fontSize: 14 }}>🔒</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @media (max-width: 900px) {
                    .profile-main-grid { grid-template-columns: 1fr !important; }
                    .profile-stats-grid { grid-template-columns: 1fr 1fr !important; }
                }
                @media (max-width: 768px) {
                    header { padding: 0 16px !important; }
                    main { padding: 24px 16px !important; }
                }
                @media (max-width: 480px) {
                    .profile-stats-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
