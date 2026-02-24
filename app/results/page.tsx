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
    const [animPts, setAnimPts] = useState(0);
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
                setTimeout(() => setShowAnimation(true), 400);
            } catch { router.push('/dashboard'); }
        };
        finish();
    }, [sessionId, timer, router]);

    // Animated score counter
    useEffect(() => {
        if (!showAnimation || !results) return;
        const target = results.totalPoints;
        if (target <= 0) { setAnimPts(0); return; }
        let cur = 0;
        const step = Math.ceil(target / 50);
        const iv = setInterval(() => {
            cur = Math.min(cur + step, target);
            setAnimPts(cur);
            if (cur >= target) clearInterval(iv);
        }, 25);
        return () => clearInterval(iv);
    }, [showAnimation, results]);

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

    if (loading) return (
        <div className="rs-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
            <div className="rs-loader" />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Calculando pontuação...</p>
            <RStyle />
        </div>
    );

    if (!results) return null;

    const accuracy = results.accuracyPercentage;
    const grade = accuracy === 100 ? { label: 'PERFEITO!', color: '#e8c847', emoji: '💎' }
        : accuracy >= 80 ? { label: 'EXCELENTE!', color: '#2ecc71', emoji: '🏆' }
        : accuracy >= 60 ? { label: 'BOM TRABALHO!', color: '#e8c847', emoji: '⭐' }
        : { label: 'CONTINUE TENTANDO!', color: '#e74c3c', emoji: '💪' };

    return (
        <div className="rs-root" style={{ minHeight: '100vh', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", padding: '28px 16px 40px' }}>

            <div style={{ position: 'relative', zIndex: 2, maxWidth: 460, margin: '0 auto' }}>

                {/* ── Glow orb ── */}
                <div className="rs-glow" />

                {/* ── Badge ── */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div className="rs-badge">
                        <div className="rs-badge-inner"><span style={{ fontSize: 48 }}>{grade.emoji}</span></div>
                        <div className="rs-ring" />
                        <div className="rs-ring2" />
                    </div>
                    <h1 className="rs-title">Cidade Completa!</h1>
                    <div className="rs-grade" style={{ color: grade.color }}>{grade.label}</div>
                </div>

                {/* ── Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div className="rs-stat">
                        <div className="rs-stat-icon">⏱️</div>
                        <div className="rs-stat-val">{formatTime(results.totalTimeSeconds)}</div>
                        <div className="rs-stat-lbl">Tempo</div>
                        <div className="rs-bar"><div className="rs-bar-fill" style={{ width: `${Math.min(100, (results.totalTimeSeconds / 180) * 100)}%`, background: 'linear-gradient(90deg,#5dade2,#3498db)' }} /></div>
                    </div>
                    <div className="rs-stat">
                        <div className="rs-stat-icon">🎯</div>
                        <div className="rs-stat-val" style={{ color: accuracy >= 80 ? '#2ecc71' : accuracy >= 50 ? '#e8c847' : '#e74c3c' }}>{accuracy}%</div>
                        <div className="rs-stat-lbl">Precisão</div>
                        <div className="rs-bar"><div className="rs-bar-fill" style={{ width: `${accuracy}%`, background: accuracy >= 80 ? 'linear-gradient(90deg,#27ae60,#2ecc71)' : accuracy >= 50 ? 'linear-gradient(90deg,#c9a227,#e8c847)' : 'linear-gradient(90deg,#c0392b,#e74c3c)' }} /></div>
                    </div>
                </div>

                {/* ── Points card ── */}
                <div className="rs-points">
                    <div className="rs-pts-trophy">🏆</div>
                    <div className="rs-pts-val">{showAnimation ? animPts.toLocaleString('pt-BR') : '0'}<span className="rs-pts-unit"> pontos</span></div>
                    <div className="rs-pts-detail">{results.correctAnswers}/{results.totalQuestions} corretas</div>
                    <div className="rs-shimmer" />
                </div>

                {/* ── XP ── */}
                {results.xpEarned > 0 && (
                    <div className={`rs-xp ${results.levelUp ? 'level-up' : ''}`}>
                        <div>
                            <div className="rs-xp-label">XP GANHOS</div>
                            <div className="rs-xp-val">+{results.xpEarned} XP</div>
                        </div>
                        {results.levelUp && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 28 }}>🎉</div>
                                <div style={{ fontSize: 12, color: '#2ecc71', fontWeight: 700 }}>Nível {results.newLevel}!</div>
                                <div style={{ fontSize: 11, color: '#e8c847' }}>{results.newLevelName}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Rank ── */}
                <div className="rs-rank">
                    <div>
                        <div className="rs-rank-label">RANKING GLOBAL</div>
                        <div className="rs-rank-val">{results.rank ? '#' + results.rank : '#-'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 32 }}>🏆</div>
                        {results.rank && <div style={{ fontSize: 11, color: '#2ecc71', fontWeight: 700, marginTop: 4 }}>Subiu posições!</div>}
                    </div>
                </div>

                {/* ── Achievements ── */}
                {newAchievements.length > 0 && (
                    <div className="rs-achievements">
                        <div className="rs-ach-title">Conquistas Desbloqueadas</div>
                        {newAchievements.map((a: any) => (
                            <div key={a.id} className="rs-ach-item">
                                <span style={{ fontSize: 24 }}>{a.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#e8c847' }}>{a.name}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{a.description}</div>
                                </div>
                                <span style={{ fontSize: 11, color: '#e8c847', fontWeight: 700 }}>+{a.points}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Actions ── */}
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {cityId && (
                        <Link href={`/game/${cityId}`} className="rs-btn-primary">🔁 Jogar Novamente</Link>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Link href="/dashboard" className="rs-btn-sec">🏠 Dashboard</Link>
                        <button onClick={handleShare} className="rs-btn-sec rs-btn-gold">{shareMsg || '↗ Compartilhar'}</button>
                    </div>
                </div>

                {/* ── Share Card ── */}
                <div className="rs-card-preview">
                    <div className="rs-card-label">SEU CARD DE RESULTADO</div>
                    <img
                        src={`/api/share-card?name=${encodeURIComponent('Jogador')}&points=${results.totalPoints}&accuracy=${results.accuracyPercentage}&rank=${results.rank || '-'}&level=${results.newLevel || 1}&levelName=${encodeURIComponent(results.newLevelName || 'Ouvinte')}`}
                        alt="Share Card" className="rs-card-img"
                    />
                    <button onClick={() => {
                        const url = `/api/share-card?name=${encodeURIComponent('Jogador')}&points=${results.totalPoints}&accuracy=${results.accuracyPercentage}&rank=${results.rank || '-'}&level=${results.newLevel || 1}&levelName=${encodeURIComponent(results.newLevelName || 'Ouvinte')}`;
                        navigator.clipboard.writeText(window.location.origin + url).then(() => setShareMsg('Link copiado!'));
                        setTimeout(() => setShareMsg(''), 2000);
                    }} className="rs-copy-btn">📋 Copiar Link do Card</button>
                </div>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
                    <Link href="/ranking" className="rs-link">Ver Ranking →</Link>
                    <Link href="/certificate" className="rs-link rs-link-green">Certificado →</Link>
                </div>
            </div>
            <RStyle />
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="rs-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="rs-loader" />
                <RStyle />
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}

function RStyle() {
    return <style>{`
        .rs-root {
            background: radial-gradient(ellipse at 50% 0%, #1a0f4a 0%, #0d0b2e 50%, #060618 100%);
            position: relative; overflow: hidden;
        }
        .rs-root::before {
            content: ''; position: absolute; inset: 0; pointer-events: none;
            background: url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='s'%3E%3Cstop offset='0' stop-color='%23fff' stop-opacity='.7'/%3E%3Cstop offset='1' stop-color='%23fff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='80' r='1.5' fill='url(%23s)'/%3E%3Ccircle cx='150' cy='30' r='1' fill='url(%23s)'/%3E%3Ccircle cx='250' cy='120' r='1.2' fill='url(%23s)'/%3E%3Ccircle cx='350' cy='60' r='0.8' fill='url(%23s)'/%3E%3Ccircle cx='100' cy='200' r='1.3' fill='url(%23s)'/%3E%3Ccircle cx='300' cy='250' r='1' fill='url(%23s)'/%3E%3Ccircle cx='200' cy='350' r='1.5' fill='url(%23s)'/%3E%3C/svg%3E");
            animation: rsDrift 60s linear infinite; opacity: 0.5;
        }
        @keyframes rsDrift { to { background-position: 400px 400px; } }
        @keyframes rsSpin { to { transform: rotate(360deg); } }
        @keyframes rsBreath { 0%,100%{opacity:.6;transform:translateX(-50%) scale(1)} 50%{opacity:1;transform:translateX(-50%) scale(1.1)} }
        @keyframes rsShimmer { 0%{left:-50%} 100%{left:150%} }

        .rs-loader { width:56px; height:56px; border-radius:50%; border:3px solid rgba(255,255,255,.08); border-top-color:#e8c847; animation:rsSpin .8s linear infinite; box-shadow:0 0 24px rgba(232,200,71,.3); }

        .rs-glow { position:absolute; top:-120px; left:50%; transform:translateX(-50%); width:600px; height:600px; border-radius:50%; pointer-events:none; background:radial-gradient(circle,rgba(124,58,237,.15) 0%,rgba(201,162,39,.08) 40%,transparent 70%); animation:rsBreath 6s ease-in-out infinite; }

        /* Badge */
        .rs-badge { position:relative; display:inline-block; width:110px; height:110px; }
        .rs-badge-inner { position:relative; z-index:2; width:110px; height:110px; border-radius:50%; background:linear-gradient(135deg,#1a0f4a,#2d1b69); border:3px solid rgba(232,200,71,.5); display:flex; align-items:center; justify-content:center; box-shadow:0 0 50px rgba(201,162,39,.3),inset 0 0 24px rgba(124,58,237,.2); }
        .rs-ring { position:absolute; inset:-10px; border-radius:50%; border:2px solid rgba(232,200,71,.15); animation:rsSpin 12s linear infinite; }
        .rs-ring::before { content:''; position:absolute; top:-3px; left:50%; width:6px; height:6px; border-radius:50%; background:#e8c847; box-shadow:0 0 10px #e8c847; }
        .rs-ring2 { position:absolute; inset:-20px; border-radius:50%; border:1px solid rgba(124,58,237,.1); animation:rsSpin 20s linear infinite reverse; }
        .rs-ring2::before { content:''; position:absolute; bottom:-2px; left:30%; width:4px; height:4px; border-radius:50%; background:#7c3aed; box-shadow:0 0 8px #7c3aed; }
        .rs-title { font-family:'Playfair Display','Georgia',serif; font-size:28px; font-weight:800; margin-top:18px; margin-bottom:6px; color:#fff; }
        .rs-grade { font-size:14px; font-weight:800; letter-spacing:3px; text-shadow:0 0 20px currentColor; }

        /* Stats */
        .rs-stat { position:relative; z-index:2; padding:16px; border-radius:16px; text-align:center; background:rgba(255,255,255,.04); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.08); box-shadow:0 4px 16px rgba(0,0,0,.2); }
        .rs-stat-icon { font-size:20px; margin-bottom:6px; }
        .rs-stat-val { font-family:'Playfair Display','Georgia',serif; font-size:22px; font-weight:800; color:#fff; }
        .rs-stat-lbl { font-size:11px; color:rgba(255,255,255,.4); margin-top:2px; font-weight:600; text-transform:uppercase; letter-spacing:1px; }
        .rs-bar { height:4px; border-radius:2px; background:rgba(255,255,255,.06); margin-top:8px; overflow:hidden; }
        .rs-bar-fill { height:100%; border-radius:2px; transition:width 1.2s ease-out; }

        /* Points */
        .rs-points { position:relative; z-index:2; padding:26px; border-radius:20px; text-align:center; margin-bottom:14px; background:linear-gradient(135deg,rgba(201,162,39,.12),rgba(139,105,20,.08)); border:2px solid rgba(232,200,71,.35); box-shadow:0 8px 40px rgba(201,162,39,.15),inset 0 1px 0 rgba(255,255,255,.05); overflow:hidden; }
        .rs-pts-trophy { font-size:34px; margin-bottom:6px; }
        .rs-pts-val { font-family:'Playfair Display','Georgia',serif; font-size:50px; font-weight:800; color:#fff; line-height:1; text-shadow:0 0 30px rgba(232,200,71,.3); }
        .rs-pts-unit { font-size:20px; font-weight:600; color:#e8c847; }
        .rs-pts-detail { font-size:14px; color:rgba(255,255,255,.45); margin-top:6px; }
        .rs-shimmer { position:absolute; top:0; left:-100%; width:50%; height:100%; background:linear-gradient(90deg,transparent,rgba(232,200,71,.08),transparent); animation:rsShimmer 3s ease-in-out infinite; }

        /* XP */
        .rs-xp { position:relative; z-index:2; display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-radius:16px; margin-bottom:14px; background:rgba(232,200,71,.04); border:1px solid rgba(232,200,71,.2); backdrop-filter:blur(12px); }
        .rs-xp.level-up { background:linear-gradient(135deg,rgba(201,162,39,.15),rgba(139,105,20,.1)); border:2px solid rgba(232,200,71,.5); box-shadow:0 0 24px rgba(201,162,39,.15); }
        .rs-xp-label { font-size:10px; font-weight:700; letter-spacing:1.5px; color:rgba(232,200,71,.7); margin-bottom:4px; }
        .rs-xp-val { font-family:'Playfair Display','Georgia',serif; font-size:28px; font-weight:800; color:#e8c847; }

        /* Rank */
        .rs-rank { position:relative; z-index:2; display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-radius:16px; margin-bottom:14px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); backdrop-filter:blur(12px); }
        .rs-rank-label { font-size:10px; font-weight:700; letter-spacing:1.5px; color:rgba(232,200,71,.6); margin-bottom:4px; }
        .rs-rank-val { font-family:'Playfair Display','Georgia',serif; font-size:34px; font-weight:800; color:#e8c847; line-height:1; }

        /* Achievements */
        .rs-achievements { position:relative; z-index:2; padding:16px 18px; border-radius:16px; margin-bottom:14px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); backdrop-filter:blur(12px); }
        .rs-ach-title { font-size:10px; font-weight:700; letter-spacing:1.5px; color:rgba(232,200,71,.6); text-transform:uppercase; margin-bottom:12px; }
        .rs-ach-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; background:rgba(232,200,71,.04); border:1px solid rgba(232,200,71,.15); margin-bottom:8px; }
        .rs-ach-item:last-child { margin-bottom:0; }

        /* Buttons */
        .rs-btn-primary { display:block; width:100%; padding:16px; border-radius:16px; text-align:center; text-decoration:none; background:linear-gradient(135deg,#c9a227,#e8c847); color:#1a0a4a; font-weight:700; font-size:16px; box-shadow:0 4px 24px rgba(201,162,39,.4),0 0 48px rgba(232,200,71,.15); transition:all .3s; }
        .rs-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(201,162,39,.5); }
        .rs-btn-sec { display:flex; align-items:center; justify-content:center; padding:13px 16px; border-radius:14px; text-decoration:none; font-weight:600; font-size:13px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.6); cursor:pointer; font-family:inherit; transition:all .2s; }
        .rs-btn-sec:hover { background:rgba(255,255,255,.08); border-color:rgba(201,162,39,.3); }
        .rs-btn-gold { color:#e8c847; border-color:rgba(232,200,71,.2); }
        .rs-btn-gold:hover { border-color:rgba(232,200,71,.4); }

        /* Share card */
        .rs-card-preview { position:relative; z-index:2; padding:16px; border-radius:16px; margin-top:16px; text-align:center; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); backdrop-filter:blur(12px); }
        .rs-card-label { font-size:10px; font-weight:700; letter-spacing:1.5px; color:rgba(255,255,255,.35); margin-bottom:10px; }
        .rs-card-img { width:100%; max-width:380px; border-radius:12px; border:1px solid rgba(232,200,71,.2); }
        .rs-copy-btn { margin-top:10px; padding:8px 20px; border-radius:10px; background:rgba(232,200,71,.08); border:1px solid rgba(232,200,71,.2); color:#e8c847; font-weight:600; font-size:12px; cursor:pointer; font-family:inherit; transition:all .2s; }
        .rs-copy-btn:hover { background:rgba(232,200,71,.15); }

        .rs-link { font-size:13px; color:#e8c847; text-decoration:none; font-weight:600; transition:opacity .2s; }
        .rs-link:hover { opacity:.8; }
        .rs-link-green { color:#2ecc71; }

        @media(max-width:480px) {
            .rs-pts-val { font-size:38px !important; }
            .rs-title { font-size:24px !important; }
        }
    `}</style>;
}