'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const timer = parseInt(searchParams.get('time') || '0');

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any>(null);
    const [newAchievements, setNewAchievements] = useState<any[]>([]);
    const [showAnimation, setShowAnimation] = useState(false);
    const [shareMsg, setShareMsg] = useState('');
    const [cityId, setCityId] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) { router.push('/dashboard'); return; }
        const finish = async () => {
            try {
                const [res, achRes] = await Promise.all([
                    fetch('/api/sessions/' + sessionId + '/complete', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                        body: JSON.stringify({ totalTimeSeconds: timer }),
                    }),
                    fetch('/api/user/achievements', { credentials: 'include' }),
                ]);
                const data = await res.json();
                const achData = await achRes.json();
                if (!data.success) { router.push('/dashboard'); return; }
                setResults(data.data);
                if (data.data.cityId) setCityId(data.data.cityId);
                if (achData.success) {
                    setNewAchievements(achData.data.filter((a: any) => a.unlocked).slice(0, 3));
                }
                setLoading(false);
                setTimeout(() => setShowAnimation(true), 300);
            } catch { router.push('/dashboard'); }
        };
        finish();
    }, [sessionId, timer, router]);

    const formatTime = (s: number) => Math.floor(s / 60) + 'min ' + (s % 60) + 's';

    const handleShare = () => {
        if (!results) return;
        const text = 'Completei uma cidade no jogo O Discípulo! ' + results.totalPoints + ' pontos com ' + results.accuracyPercentage + '% de precisão. Venha jogar! disciplegame.com';
        if (navigator.share) {
            navigator.share({ title: 'O Discipulo', text });
        } else {
            navigator.clipboard.writeText(text).then(() => setShareMsg('Copiado!'));
            setTimeout(() => setShareMsg(''), 2000);
        }
    };

    const goldBorder = '1px solid rgba(201,162,39,0.35)';
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: goldBorder, borderRadius: 20, backdropFilter: 'blur(16px)' };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: '#fff' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Calculando pontuacao...</p>
        </div>
    );

    if (!results) return null;

    const accuracy = results.accuracyPercentage;
    const grade = accuracy === 100 ? { label: 'PERFEITO!', color: '#c9a227', emoji: '💎' }
        : accuracy >= 80 ? { label: 'EXCELENTE', color: '#2ecc71', emoji: '🌟' }
        : accuracy >= 60 ? { label: 'BOM', color: '#c9a227', emoji: '👍' }
        : { label: 'TENTE NOVAMENTE', color: '#e74c3c', emoji: '💪' };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", padding: '32px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,162,39,0.1) 0%,transparent 65%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    {/* Ornament top */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ flex: 1, maxWidth: 60, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,162,39,0.5))' }} />
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="20" rx="1" fill="#c9a227" /><rect x="4" y="7" width="16" height="4" rx="1" fill="#c9a227" /></svg>
                        <div style={{ flex: 1, maxWidth: 60, height: 1, background: 'linear-gradient(90deg,rgba(201,162,39,0.5),transparent)' }} />
                    </div>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(201,162,39,0.4)', fontSize: 36, border: '2px solid rgba(201,162,39,0.6)' }}>
                        {grade.emoji}
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Cidade Completa!</h1>
                    <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: grade.color, background: 'rgba(201,162,39,0.08)', border: goldBorder, borderRadius: 20, padding: '4px 16px' }}>{grade.label}</span>
                </div>

                {/* Main stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div style={{ ...glass, padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>🕐</div>
                        <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 22, fontWeight: 700 }}>{formatTime(results.totalTimeSeconds)}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Tempo Total</p>
                    </div>
                    <div style={{ ...glass, padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>🎯</div>
                        <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 22, fontWeight: 700, color: accuracy >= 80 ? '#2ecc71' : accuracy >= 60 ? '#c9a227' : '#e74c3c' }}>{accuracy}%</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Precisao</p>
                    </div>
                </div>

                {/* Points */}
                <div style={{ background: 'linear-gradient(135deg,rgba(201,162,39,0.15),rgba(139,105,20,0.1))', border: '2px solid rgba(201,162,39,0.4)', borderRadius: 20, padding: '24px', marginBottom: 14, textAlign: 'center', boxShadow: '0 8px 32px rgba(201,162,39,0.15)' }}>
                    <p style={{ fontSize: 12, color: '#c9a227', marginBottom: 6, letterSpacing: 1.5, fontWeight: 700 }}>PONTUACAO TOTAL</p>
                    <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: showAnimation ? 52 : 32, fontWeight: 800, transition: 'font-size 0.4s', color: '#fff' }}>
                        {showAnimation ? results.totalPoints.toLocaleString('pt-BR') : '0'}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>
                        {results.correctAnswers}/{results.totalQuestions} corretas
                    </p>
                </div>

                {/* XP Earned */}
                {results.xpEarned > 0 && (
                    <div style={{ background: results.levelUp ? 'linear-gradient(135deg,rgba(201,162,39,0.2),rgba(139,105,20,0.15))' : 'rgba(201,162,39,0.06)', border: results.levelUp ? '2px solid rgba(201,162,39,0.6)' : goldBorder, borderRadius: 16, padding: '14px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: 11, color: '#c9a227', fontWeight: 700, letterSpacing: 1.2, marginBottom: 4 }}>XP GANHOS</p>
                            <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, color: '#c9a227' }}>+{results.xpEarned} XP</p>
                        </div>
                        {results.levelUp && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 28, marginBottom: 2 }}>🎉</div>
                                <p style={{ fontSize: 12, color: '#2ecc71', fontWeight: 700 }}>Nível {results.newLevel}!</p>
                                <p style={{ fontSize: 11, color: '#c9a227' }}>{results.newLevelName}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Rank */}
                <div style={{ background: 'rgba(201,162,39,0.06)', border: goldBorder, borderRadius: 16, padding: '16px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontSize: 11, color: '#c9a227', fontWeight: 700, marginBottom: 4, letterSpacing: 1.2 }}>POSICAO NO RANKING GLOBAL</p>
                        <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 32, fontWeight: 800, color: '#c9a227', lineHeight: 1 }}>
                            {results.rank ? '#' + results.rank : '#-'}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 32 }}>🏆</div>
                        {results.rank && <p style={{ fontSize: 11, color: '#2ecc71', fontWeight: 700, marginTop: 4 }}>Subiu posicoes!</p>}
                    </div>
                </div>

                {/* New achievements */}
                {newAchievements.length > 0 && (
                    <div style={{ ...glass, padding: '16px 20px', marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 12 }}>Conquistas Desbloqueadas</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {newAchievements.map((a: any) => (
                                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(201,162,39,0.06)', border: goldBorder, borderRadius: 12 }}>
                                    <span style={{ fontSize: 24 }}>{a.icon}</span>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: 13, color: '#c9a227' }}>{a.name}</p>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{a.description}</p>
                                    </div>
                                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#c9a227', fontWeight: 700 }}>+{a.points} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {cityId && (
                    <Link href={`/game/${cityId}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 12, boxShadow: '0 4px 20px rgba(201,162,39,0.4)' }}>
                        🔁 Jogar Novamente
                    </Link>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <Link href="/dashboard" style={{ padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: goldBorder, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        🏠 Dashboard
                    </Link>
                    <button onClick={handleShare} style={{ padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: goldBorder, color: '#c9a227', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {shareMsg || '↗ Compartilhar'}
                    </button>
                </div>
                {/* Share Card Preview */}
                <div style={{ ...glass, padding: 14, marginBottom: 14, textAlign: 'center' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, marginBottom: 10 }}>SEU CARD DE RESULTADO</p>
                    <img
                        src={`/api/share-card?name=${encodeURIComponent('Jogador')}&points=${results.totalPoints}&accuracy=${results.accuracyPercentage}&rank=${results.rank || '-'}&level=${results.newLevel || 1}&levelName=${encodeURIComponent(results.newLevelName || 'Ouvinte')}`}
                        alt="Share Card"
                        style={{ width: '100%', maxWidth: 400, borderRadius: 12, border: goldBorder }}
                    />
                    <button onClick={() => {
                        const url = `/api/share-card?name=${encodeURIComponent('Jogador')}&points=${results.totalPoints}&accuracy=${results.accuracyPercentage}&rank=${results.rank || '-'}&level=${results.newLevel || 1}&levelName=${encodeURIComponent(results.newLevelName || 'Ouvinte')}`;
                        const fullUrl = window.location.origin + url;
                        navigator.clipboard.writeText(fullUrl).then(() => setShareMsg('Link do card copiado!'));
                        setTimeout(() => setShareMsg(''), 2000);
                    }} style={{ marginTop: 10, padding: '8px 20px', borderRadius: 8, background: 'rgba(201,162,39,0.12)', border: goldBorder, color: '#c9a227', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                        📋 Copiar Link do Card
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <Link href="/ranking" style={{ fontSize: 13, color: '#c9a227', textDecoration: 'none', fontWeight: 600 }}>
                        Ver Ranking →
                    </Link>
                    <Link href="/certificate" style={{ fontSize: 13, color: '#2ecc71', textDecoration: 'none', fontWeight: 600 }}>
                        Certificado →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}