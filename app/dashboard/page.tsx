'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MVP_CIRCUIT_ID = '00000000-0000-0000-0000-000000000001';

const CITY_IMAGES: Record<string, string> = {
    'jerusalem': 'https://images.unsplash.com/photo-1549948575-1b43a40e6cfc?w=600&q=80',
    'jerusalém': 'https://images.unsplash.com/photo-1549948575-1b43a40e6cfc?w=600&q=80',
    'efeso': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80',
    'éfeso': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80',
    'ephesus': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80',
    'malta': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600&q=80',
};

const CITY_FLAGS: Record<string, string> = {
    'israel': '🇮🇱', 'turquia': '🇹🇷', 'turkey': '🇹🇷', 'malta': '🇲🇹',
};

function getCityImage(name: string) {
    return CITY_IMAGES[name.toLowerCase()] || 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80';
}

function CrossIcon({ size = 24, color = '#c9a227' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="10" y="2" width="4" height="20" rx="1" fill={color} />
            <rect x="4" y="7" width="16" height="4" rx="1" fill={color} />
        </svg>
    );
}

function WeeklyCountdown() {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        const calc = () => {
            const now = new Date();
            const nextMonday = new Date(now);
            nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7));
            nextMonday.setHours(0, 0, 0, 0);
            const diff = nextMonday.getTime() - now.getTime();
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(d + 'D ' + h + 'H ' + m + 'M');
        };
        calc();
        const t = setInterval(calc, 60000);
        return () => clearInterval(t);
    }, []);
    return (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 8 }}>
            ⏳ Termina em: <strong style={{ color: '#c9a227' }}>{timeLeft}</strong>
        </p>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [cities, setCities] = useState<any[]>([]);
    const [rankings, setRankings] = useState<any[]>([]);
    const [gamification, setGamification] = useState<any>(null);
    const [dailyChallenge, setDailyChallenge] = useState<any>(null);
    const [dailyClaimed, setDailyClaimed] = useState(false);
    const [claimingDaily, setClaimingDaily] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await fetch('/api/user/profile', { credentials: 'include' });
                if (!profileRes.ok) { router.push('/auth/login'); return; }
                const profileData = await profileRes.json();
                if (!profileData.success) { router.push('/auth/login'); return; }
                setUser(profileData.data);
                const [citiesRes, rankingsRes, gamRes, dcRes] = await Promise.all([
                    fetch(`/api/cities?circuitId=${MVP_CIRCUIT_ID}`),
                    fetch('/api/rankings?limit=5'),
                    fetch('/api/user/gamification', { credentials: 'include' }),
                    fetch('/api/daily-challenge', { credentials: 'include' }),
                ]);
                const citiesData = await citiesRes.json();
                const rankingsData = await rankingsRes.json();
                const gamData = await gamRes.json();
                const dcData = await dcRes.json();
                if (citiesData.success) setCities(citiesData.data);
                if (rankingsData.success) setRankings(rankingsData.data);
                if (gamData.success) { setGamification(gamData.data); setDailyClaimed(gamData.data.dailyClaimed); }
                if (dcData.success) setDailyChallenge(dcData.data);
                setLoading(false);
            } catch (error) {
                console.error('Error loading dashboard:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    if (!user) return null;

    const completedCount = cities.filter(c => c.completed).length;
    const totalCities = cities.length;
    const progress = totalCities > 0 ? (completedCount / totalCities) * 100 : 0;

    const goldBorder = '1px solid rgba(201,162,39,0.35)';
    const goldCard: React.CSSProperties = { background: 'rgba(201,162,39,0.06)', border: goldBorder, borderRadius: 16, padding: '18px 20px' };
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 16 };
    const rankMedals = ['linear-gradient(135deg,#c9a227,#8b6914)', 'linear-gradient(135deg,#b0b8c1,#8a9299)', 'linear-gradient(135deg,#cd7f32,#a0522d)'];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>

            {/* HEADER */}
            <header style={{ background: 'rgba(13,11,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: goldBorder, position: 'sticky', top: 0, zIndex: 50, padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(201,162,39,0.4)' }}>
                        <CrossIcon size={16} color="#fff" />
                    </div>
                    <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 17, color: '#fff' }}>O Discipulo</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button style={{ background: 'rgba(255,255,255,0.06)', border: goldBorder, borderRadius: 10, padding: '7px 9px', color: '#c9a227', cursor: 'pointer', lineHeight: 0 }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowMenu(!showMenu)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: goldBorder, borderRadius: 10, padding: '6px 12px', color: '#fff', cursor: 'pointer' }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#1a0a4a' }}>{user.name.charAt(0).toUpperCase()}</div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {showMenu && (
                            <div style={{ position: 'absolute', right: 0, top: '110%', width: 180, background: '#150d3a', border: goldBorder, borderRadius: 12, padding: '6px 0', zIndex: 100 }}>
                                <Link href="/profile" style={{ display: 'block', padding: '9px 14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>👤 Meu Perfil</Link>
                                <Link href="/ranking" style={{ display: 'block', padding: '9px 14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>🏆 Ranking Global</Link>
                                <Link href="/" style={{ display: 'block', padding: '9px 14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>🏠 Home</Link>
                                <hr style={{ border: 'none', borderTop: '1px solid rgba(201,162,39,0.15)', margin: '4px 0' }} />
                                <Link href="/" style={{ display: 'block', padding: '9px 14px', color: '#ff6b6b', textDecoration: 'none', fontSize: 13 }}>Sair</Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
                <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Ola, {user.name.split(' ')[0]}! <span style={{ color: '#c9a227' }}>✝</span></p>

                <div className="dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

                    {/* LEFT COLUMN */}
                    <div>
                        {/* Stats 2x2 */}
                        <div className="dash-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                            {([
                                { label: 'PONTOS TOTAIS', value: String(user.stats.totalPoints || 0), sub: 'Pontuação geral', icon: '⭐' },
                                { label: 'RANKING GLOBAL', value: '#—', sub: 'Sua posição', icon: '🏆' },
                                { label: 'PRECISÃO', value: `${user.stats.avgAccuracy || 0}%`, sub: 'Últimas partidas', icon: '🎯' },
                                { label: 'CIDADES', value: `${completedCount}/${totalCities}`, sub: 'Progresso da jornada', icon: '📍' },
                            ] as { label: string; value: string; sub: string; icon: string }[]).map(({ label, value, sub, icon }) => (
                                <div key={label} style={{ ...goldCard, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>{label}</p>
                                        <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{value}</p>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{sub}</p>
                                    </div>
                                    <span style={{ fontSize: 26, opacity: 0.55 }}>{icon}</span>
                                </div>
                            ))}
                        </div>

                        {/* Pilgrimage Path — City Cards with Photos */}
                        <div style={{ ...glass, padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.8)', fontFamily: "'Playfair Display','Georgia',serif" }}>JORNADA DO DISCÍPULO</span>
                                <span style={{ fontSize: 11, color: '#c9a227', background: 'rgba(201,162,39,0.1)', border: goldBorder, borderRadius: 20, padding: '3px 10px' }}>✝ Viagens de Paulo</span>
                            </div>
                            {/* Progress bar */}
                            <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#c9a227,#8b6914)', borderRadius: 8, transition: 'width 0.6s' }} />
                            </div>
                            {/* City cards with photos */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {cities.map((city, index) => (
                                    <div key={city.id} style={{ display: 'flex', alignItems: 'stretch', borderRadius: 14, overflow: 'hidden', border: city.completed ? '1px solid rgba(39,174,96,0.35)' : goldBorder, background: '#0d0b2e' }}>
                                        {/* City photo */}
                                        <div style={{ width: 110, minHeight: 90, position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                                            <img src={getCityImage(city.name)} alt={city.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 50%,#0d0b2e 100%)' }} />
                                            {city.completed && (
                                                <div style={{ position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: '50%', background: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>✓</div>
                                            )}
                                        </div>
                                        {/* City info */}
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', gap: 12 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                                    <span style={{ fontSize: 13 }}>{CITY_FLAGS[city.country?.toLowerCase()] || '🌍'}</span>
                                                    <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 16 }}>{city.name}</p>
                                                </div>
                                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{city.country} · 9 perguntas</p>
                                            </div>
                                            <Link href={`/game/${city.id}`} style={{ padding: '9px 20px', borderRadius: 10, background: city.completed ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(201,162,39,0.12)', color: city.completed ? '#1a0a4a' : '#c9a227', border: city.completed ? 'none' : '1px solid rgba(201,162,39,0.4)', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                                                ▶ JOGAR
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* XP & Level */}
                        {gamification && (
                        <div style={{ background: 'linear-gradient(135deg,rgba(201,162,39,0.1),rgba(26,10,74,0.9))', border: goldBorder, borderRadius: 16, padding: 18, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,162,39,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#1a0a4a', boxShadow: '0 0 16px rgba(201,162,39,0.4)' }}>
                                    {gamification.level}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Playfair Display','Georgia',serif" }}>{gamification.levelName}</p>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Nível {gamification.level} · {gamification.xp} XP</p>
                                </div>
                                <span style={{ fontSize: 12, color: '#c9a227', background: 'rgba(201,162,39,0.1)', border: goldBorder, borderRadius: 20, padding: '3px 10px', fontWeight: 700 }}>
                                    {gamification.league}
                                </span>
                            </div>
                            <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 4 }}>
                                <div style={{ height: '100%', width: `${gamification.xpProgress}%`, background: 'linear-gradient(90deg,#c9a227,#8b6914)', borderRadius: 6, transition: 'width 0.6s' }} />
                            </div>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                                {gamification.xp} / {gamification.xpNext} XP
                            </p>
                        </div>
                        )}

                        {/* Daily Streak */}
                        {gamification && (
                        <div style={{ ...glass, padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,0.6)' }}>STREAK DIÁRIO</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 16 }}>🔥</span>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: '#c9a227' }}>{gamification.dailyStreak}</span>
                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>dias</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                                {[1,2,3,4,5,6,7].map(d => {
                                    const active = d <= gamification.dailyStreak;
                                    return (
                                        <div key={d} style={{ flex: 1, height: 28, borderRadius: 6, background: active ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(255,255,255,0.06)', border: active ? 'none' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: active ? '#1a0a4a' : 'rgba(255,255,255,0.2)' }}>
                                            {active ? '✓' : d}
                                        </div>
                                    );
                                })}
                            </div>
                            {!dailyClaimed ? (
                                <button onClick={async () => {
                                    setClaimingDaily(true);
                                    const res = await fetch('/api/user/gamification', { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ action: 'claim_daily' }) });
                                    const data = await res.json();
                                    if (data.success && !data.data.alreadyClaimed) {
                                        setDailyClaimed(true);
                                        setGamification((prev: any) => prev ? {...prev, dailyStreak: data.data.streakDay, xp: prev.xp + data.data.xpReward} : prev);
                                    }
                                    setClaimingDaily(false);
                                }} disabled={claimingDaily} style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                                    🎁 Coletar Recompensa Diária
                                </button>
                            ) : (
                                <p style={{ textAlign: 'center', fontSize: 12, color: '#2ecc71', fontWeight: 600 }}>✓ Recompensa coletada hoje!</p>
                            )}
                        </div>
                        )}

                        {/* Daily Challenge */}
                        {dailyChallenge && !dailyChallenge.alreadyDone && (
                        <div style={{ background: 'linear-gradient(135deg,rgba(39,174,96,0.08),rgba(26,10,74,0.9))', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 16, padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(39,174,96,0.2)', border: '1px solid rgba(39,174,96,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>�</div>
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: '#2ecc71', letterSpacing: 1.2 }}>DESAFIO DIÁRIO</p>
                                    <p style={{ fontSize: 13, fontWeight: 700 }}>{dailyChallenge.cityFlag} {dailyChallenge.cityName}</p>
                                </div>
                            </div>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                                Responda 1 pergunta especial. Acerte e ganhe <strong style={{ color: '#c9a227' }}>200 XP</strong>!
                            </p>
                            <Link href="/daily" style={{ display: 'block', width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(39,174,96,0.2)', border: '1px solid rgba(39,174,96,0.4)', color: '#2ecc71', fontWeight: 700, fontSize: 13, textDecoration: 'none', textAlign: 'center' }}>
                                ✝ Jogar Desafio
                            </Link>
                        </div>
                        )}
                        {dailyChallenge?.alreadyDone && (
                        <div style={{ ...glass, padding: 14, textAlign: 'center' }}>
                            <p style={{ fontSize: 12, color: '#2ecc71', fontWeight: 600 }}>✓ Desafio diário completo!</p>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Volte amanhã para um novo desafio</p>
                        </div>
                        )}

                        {/* Top 5 Rankings */}
                        <div style={{ ...glass, padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,0.6)' }}>TOP 5 JOGADORES</p>
                                <Link href="/ranking" style={{ fontSize: 11, color: '#c9a227', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {rankings.length > 0 ? rankings.map((player, i) => (
                                    <div key={player.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: i < 3 ? 'rgba(201,162,39,0.06)' : 'transparent', border: i < 3 ? goldBorder : '1px solid transparent' }}>
                                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: i < 3 ? rankMedals[i] : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0, color: i < 3 ? '#1a0a4a' : '#fff' }}>
                                            {player.rank}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.user_name}</p>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#c9a227', fontWeight: 700 }}>{player.total_points}</span>
                                    </div>
                                )) : (
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '12px 0' }}>Seja o primeiro no ranking!</p>
                                )}
                            </div>
                        </div>

                        {/* Invite Friends */}
                        <div style={{ ...glass, padding: 16, textAlign: 'center' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>CONVIDE AMIGOS</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 12, lineHeight: 1.5 }}>
                                Convide amigos e ganhe <strong style={{ color: '#c9a227' }}>500 XP</strong> por cada convite aceito!
                            </p>
                            <button onClick={() => {
                                const text = 'Venha jogar O Discípulo! Um quiz sobre as viagens do Apóstolo Paulo. disciplegame.com';
                                if (navigator.share) navigator.share({ title: 'O Discípulo', text });
                                else navigator.clipboard.writeText(text);
                            }} style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(201,162,39,0.12)', border: goldBorder, color: '#c9a227', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                📤 Compartilhar Convite
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @media (max-width: 900px) {
                    .dash-main-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 768px) {
                    header { padding: 0 16px !important; }
                    main { padding: 20px 14px !important; }
                }
                @media (max-width: 480px) {
                    .dash-stats-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
