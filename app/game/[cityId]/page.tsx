'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

const MVP_CIRCUIT_ID = '00000000-0000-0000-0000-000000000001';

const CITY_IMAGES: Record<string, string> = {
    'jerusalem': 'https://images.unsplash.com/photo-1549948575-1b43a40e6cfc?w=900&q=80',
    'jerusalém': 'https://images.unsplash.com/photo-1549948575-1b43a40e6cfc?w=900&q=80',
    'efeso': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=900&q=80',
    'éfeso': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=900&q=80',
    'malta': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=900&q=80',
};

const CITY_FLAGS: Record<string, string> = {
    'israel': '🇮🇱', 'turquia': '🇹🇷', 'turkey': '🇹🇷', 'malta': '🇲🇹',
};

function getCityImage(name: string) {
    return CITY_IMAGES[name.toLowerCase()] || 'https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=80';
}

const BLOCK_META: Record<number, { label: string; icon: string; color: string }> = {
    1: { label: 'Bíblico', icon: '📖', color: '#e8c847' },
    2: { label: 'Geografia', icon: '🌍', color: '#5dade2' },
    3: { label: 'Turismo', icon: '✈️', color: '#58d68d' },
};

const DIFF_STARS = ['⭐', '⭐⭐', '⭐⭐⭐'];

export default function GamePage({ params }: { params: Promise<{ cityId: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [city, setCity] = useState<any>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctOption, setCorrectOption] = useState('');
    const [answers, setAnswers] = useState<Array<{ correct: boolean }>>([]);
    const [timer, setTimer] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [streak, setStreak] = useState(0);
    const [pointsEarned, setPointsEarned] = useState<number | null>(null);
    const [totalPoints, setTotalPoints] = useState(0);
    const [powerups, setPowerups] = useState<any[]>([]);
    const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
    const [doubleXP, setDoubleXP] = useState(false);
    const [shake, setShake] = useState(false);
    const [celebrate, setCelebrate] = useState(false);

    useEffect(() => {
        const initGame = async () => {
            try {
                const sessionRes = await fetch('/api/sessions/start', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                    body: JSON.stringify({ circuitId: MVP_CIRCUIT_ID }),
                });
                if (!sessionRes.ok) { router.push('/auth/login'); return; }
                const sessionData = await sessionRes.json();
                if (!sessionData.success) { router.push('/auth/login'); return; }
                setSessionId(sessionData.data.sessionId);
                const [questionsRes, citiesRes] = await Promise.all([
                    fetch('/api/questions/' + resolvedParams.cityId + '?sessionId=' + sessionData.data.sessionId, { credentials: 'include' }),
                    fetch('/api/cities?circuitId=' + MVP_CIRCUIT_ID),
                ]);
                const questionsData = await questionsRes.json();
                const citiesData = await citiesRes.json();
                if (!questionsData.success) { router.push('/dashboard'); return; }
                if (citiesData.success) {
                    const found = citiesData.data.find((c: any) => c.id === resolvedParams.cityId);
                    if (found) setCity(found);
                }
                setQuestions(questionsData.data);
                try {
                    const puRes = await fetch('/api/powerups', { credentials: 'include' });
                    const puData = await puRes.json();
                    if (puData.success) setPowerups(puData.data.inventory);
                } catch {}
                setLoading(false);
                setQuestionStartTime(Date.now());
            } catch { router.push('/dashboard'); }
        };
        initGame();
    }, [resolvedParams.cityId, router]);

    useEffect(() => {
        if (loading) return;
        const interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [loading]);

    const formatTime = (s: number) =>
        Math.floor(s / 60).toString().padStart(2, '0') + ':' + (s % 60).toString().padStart(2, '0');

    const handleAnswer = (letter: string) => { if (!showFeedback) setSelectedAnswer(letter); };

    const confirmAnswer = async () => {
        if (!selectedAnswer || !sessionId) return;
        const question = questions[currentQuestion];
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
        try {
            const response = await fetch('/api/sessions/' + sessionId + '/answer', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ questionId: question.id, selectedOption: selectedAnswer, timeTaken }),
            });
            const data = await response.json();
            if (!data.success) return;
            const correct = data.data.isCorrect;
            setIsCorrect(correct);
            setCorrectOption(data.data.correctOption);
            const newAnswers = [...answers, { correct }];
            setAnswers(newAnswers);
            const newStreak = correct ? streak + 1 : 0;
            setStreak(newStreak);
            const pts = correct ? (newStreak >= 3 ? 130 : 100) : 0;
            setPointsEarned(pts);
            setTotalPoints(prev => prev + pts);
            setShowFeedback(true);
            if (correct) {
                setCelebrate(true);
                setTimeout(() => setCelebrate(false), 1200);
            } else {
                setShake(true);
                setTimeout(() => setShake(false), 600);
            }
            setTimeout(() => {
                setPointsEarned(null);
                setHiddenOptions([]);
                if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion(prev => prev + 1);
                    setSelectedAnswer(null);
                    setShowFeedback(false);
                    setQuestionStartTime(Date.now());
                } else {
                    router.push('/results?sessionId=' + sessionId + '&time=' + timer);
                }
            }, 2800);
        } catch { console.error('Error submitting answer'); }
    };

    if (loading) return (
        <div className="gm-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
            <div className="gm-loader" />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Carregando jogo...</p>
            <GameStyle />
        </div>
    );

    if (!city || questions.length === 0) return (
        <div className="gm-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Cidade não encontrada<GameStyle /></div>
    );

    const question = questions[currentQuestion];
    const options = (question.options || [
        { letter: 'A', text: question.option_a },
        { letter: 'B', text: question.option_b },
        { letter: 'C', text: question.option_c },
        { letter: 'D', text: question.option_d },
    ]).filter((o: any) => !hiddenOptions.includes(o.letter));
    const block = BLOCK_META[question.block] || BLOCK_META[1];
    const progressPct = ((currentQuestion + (showFeedback ? 1 : 0)) / questions.length) * 100;
    const correctCount = answers.filter(a => a.correct).length;

    return (
        <div className="gm-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>

            {/* ── City banner ── */}
            <div className="city-banner">
                <img src={city.image_url || getCityImage(city.name)} alt={city.name} className="city-banner-img" />
                <div className="city-banner-overlay" />
                <div className="city-banner-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="city-flag">{CITY_FLAGS[city.country?.toLowerCase()] || '🌍'}</div>
                        <div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1 }}>{city.country?.toUpperCase()}</div>
                            <div style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700 }}>{city.name}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {streak >= 2 && <div className="gm-streak">🔥 {streak}x</div>}
                        <div className="gm-score">⭐ {totalPoints}</div>
                        <div className="gm-timer">{formatTime(timer)}</div>
                        <button onClick={() => router.push('/dashboard')} className="gm-close">✕</button>
                    </div>
                </div>
            </div>

            {/* ── Progress ── */}
            <div className="gm-progress-container">
                <div className="gm-progress-bar">
                    <div className="gm-progress-fill" style={{ width: `${progressPct}%` }}>
                        <div className="gm-progress-glow" />
                    </div>
                </div>
                <div className="gm-progress-labels">
                    <span>✓ {correctCount} · ✕ {answers.length - correctCount}</span>
                    <span style={{ color: block.color }}>{block.icon} {block.label}</span>
                    <span>{currentQuestion + 1}/{questions.length}</span>
                </div>
            </div>

            {/* ── Question area ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px 28px', maxWidth: 540, margin: '0 auto', width: '100%' }}>

                {/* Points floating */}
                {pointsEarned !== null && pointsEarned > 0 && (
                    <div className="gm-pts-popup">+{pointsEarned} pts{streak >= 3 ? ' 🔥' : ''}</div>
                )}

                {/* Context card */}
                {(city.biblicalContext || city.biblical_context) && (
                    <div className="gm-context">
                        <div className="gm-context-icon">
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="20" rx="1" fill="#fff" /><rect x="4" y="7" width="16" height="4" rx="1" fill="#fff" /></svg>
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
                            {city.biblicalContext || city.biblical_context}
                        </p>
                    </div>
                )}

                {/* Question card */}
                <div className={`gm-question ${shake ? 'shake' : ''} ${celebrate ? 'celebrate' : ''}`}>
                    <div className="gm-q-number">PERGUNTA {currentQuestion + 1} <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>·</span> {DIFF_STARS[(question.difficulty || 1) - 1]}</div>
                    <h2 className="gm-q-text">{question.questionText || question.question_text}</h2>
                </div>

                {/* Options */}
                <div className="gm-options">
                    {options.map((opt: { letter: string; text: string }, idx: number) => {
                        const isSel = selectedAnswer === opt.letter;
                        const isCorr = showFeedback && opt.letter === correctOption;
                        const isWrong = showFeedback && isSel && !isCorrect;
                        const cls = isCorr ? 'opt-correct' : isWrong ? 'opt-wrong' : isSel ? 'opt-selected' : '';
                        return (
                            <button key={opt.letter} onClick={() => handleAnswer(opt.letter)} disabled={showFeedback}
                                className={`gm-opt ${cls}`}>
                                <div className="gm-opt-letter">{isCorr ? '✓' : isWrong ? '✕' : opt.letter}</div>
                                <span className="gm-opt-text">{opt.text}</span>
                                {isCorr && <div className="gm-opt-glow-g" />}
                                {isWrong && <div className="gm-opt-glow-r" />}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback */}
                {showFeedback && (
                    <div className={`gm-feedback ${isCorrect ? 'fb-ok' : 'fb-no'}`}>
                        <div className="gm-fb-icon">{isCorrect ? '✓' : '✕'}</div>
                        <div>
                            <div className="gm-fb-title">{isCorrect ? (streak >= 3 ? `${streak}x Seguidas! 🔥` : 'Correto!') : 'Incorreto'}</div>
                            <div className="gm-fb-explain">{question.explanation}</div>
                        </div>
                    </div>
                )}

                {/* Power-ups */}
                {!showFeedback && powerups.length > 0 && (
                    <div className="gm-powerups">
                        {powerups.filter((p: any) => p.count > 0 && p.id !== 'double_xp').map((p: any) => (
                            <button key={p.id} className="gm-pu-btn" onClick={async () => {
                                const res = await fetch('/api/powerups', { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ action: 'use', powerupId: p.id }) });
                                const data = await res.json();
                                if (!data.success) return;
                                setPowerups(prev => prev.map((x: any) => x.id === p.id ? {...x, count: x.count - 1} : x));
                                if (p.id === 'eliminate2') {
                                    const q = questions[currentQuestion];
                                    const allOpts = (q.options || [{letter:'A'},{letter:'B'},{letter:'C'},{letter:'D'}]).filter((o: any) => o.letter !== (q.correctOption || q.correct_option));
                                    const toHide = allOpts.sort(() => Math.random() - 0.5).slice(0, 2).map((o: any) => o.letter);
                                    setHiddenOptions(toHide);
                                }
                            }}>
                                <span>{p.icon}</span> {p.name} <span className="gm-pu-count">({p.count})</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Confirm */}
                {!showFeedback && (
                    <button onClick={confirmAnswer} disabled={!selectedAnswer} className={`gm-confirm ${selectedAnswer ? 'active' : ''}`}>
                        Confirmar Resposta
                    </button>
                )}
            </div>
            <GameStyle />
        </div>
    );
}

function GameStyle() {
    return <style>{`
        .gm-root {
            background: radial-gradient(ellipse at 50% 0%, #1a0f4a 0%, #0d0b2e 50%, #060618 100%);
            position: relative; overflow: hidden;
        }
        .gm-root::before {
            content: ''; position: absolute; inset: 0; pointer-events: none;
            background: url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='s'%3E%3Cstop offset='0' stop-color='%23fff' stop-opacity='.7'/%3E%3Cstop offset='1' stop-color='%23fff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='80' r='1.5' fill='url(%23s)'/%3E%3Ccircle cx='150' cy='30' r='1' fill='url(%23s)'/%3E%3Ccircle cx='250' cy='120' r='1.2' fill='url(%23s)'/%3E%3Ccircle cx='350' cy='60' r='0.8' fill='url(%23s)'/%3E%3Ccircle cx='100' cy='200' r='1.3' fill='url(%23s)'/%3E%3Ccircle cx='300' cy='250' r='1' fill='url(%23s)'/%3E%3Ccircle cx='200' cy='350' r='1.5' fill='url(%23s)'/%3E%3C/svg%3E");
            animation: gmDrift 60s linear infinite; opacity: 0.4;
        }
        @keyframes gmDrift { to { background-position: 400px 400px; } }
        @keyframes gmSpin { to { transform: rotate(360deg); } }
        @keyframes gmPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.05); } }
        @keyframes gmShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes gmCelebrate { 0%{transform:scale(1)} 30%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes gmFloat { 0%{opacity:0;transform:translateX(-50%) translateY(20px) scale(.8)} 20%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.1)} 60%{opacity:1;transform:translateX(-50%) translateY(-20px) scale(1)} 100%{opacity:0;transform:translateX(-50%) translateY(-60px) scale(.8)} }
        @keyframes gmSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gmGlow { 0%{box-shadow:0 0 0 rgba(39,174,96,0)} 50%{box-shadow:0 0 40px rgba(39,174,96,.4)} 100%{box-shadow:0 0 24px rgba(39,174,96,.2)} }

        .gm-loader { width:56px; height:56px; border-radius:50%; border:3px solid rgba(255,255,255,.08); border-top-color:#e8c847; animation:gmSpin .8s linear infinite; box-shadow:0 0 24px rgba(232,200,71,.3); }

        /* Banner */
        .city-banner { position:relative; height:90px; overflow:hidden; z-index:5; }
        .city-banner-img { width:100%; height:100%; object-fit:cover; position:absolute; inset:0; }
        .city-banner-overlay { position:absolute; inset:0; background:linear-gradient(0deg,rgba(6,6,24,.95) 5%,rgba(13,11,46,.7) 50%,rgba(26,15,74,.5) 100%); }
        .city-banner-content { position:relative; z-index:2; height:100%; padding:0 16px; display:flex; align-items:center; justify-content:space-between; }
        .city-flag { width:38px; height:38px; border-radius:10px; background:rgba(0,0,0,.4); backdrop-filter:blur(8px); border:1px solid rgba(201,162,39,.2); display:flex; align-items:center; justify-content:center; font-size:18px; }
        .gm-streak { padding:4px 10px; border-radius:20px; font-size:12px; font-weight:700; background:rgba(255,107,0,.2); border:1px solid rgba(255,107,0,.5); color:#ff8c00; animation:gmPulse 1.5s ease-in-out infinite; }
        .gm-score { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; background:rgba(201,162,39,.12); border:1px solid rgba(201,162,39,.3); color:#e8c847; }
        .gm-timer { padding:5px 12px; border-radius:10px; font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; letter-spacing:2px; color:#e8c847; background:rgba(0,0,0,.4); border:1px solid rgba(201,162,39,.25); }
        .gm-close { width:32px; height:32px; border-radius:50%; background:rgba(0,0,0,.4); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.5); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; backdrop-filter:blur(8px); transition:all .2s; }
        .gm-close:hover { color:#e74c3c; border-color:rgba(231,76,60,.3); }

        /* Progress */
        .gm-progress-container { position:relative; z-index:5; padding:10px 16px 6px; background:rgba(0,0,0,.2); }
        .gm-progress-bar { height:6px; border-radius:3px; background:rgba(255,255,255,.06); overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,.3); }
        .gm-progress-fill { height:100%; border-radius:3px; position:relative; transition:width .6s cubic-bezier(.4,0,.2,1); background:linear-gradient(90deg,#7c3aed,#c9a227,#e8c847); }
        .gm-progress-glow { position:absolute; right:-4px; top:-4px; width:14px; height:14px; border-radius:50%; background:#e8c847; filter:blur(4px); animation:gmPulse 1.5s ease-in-out infinite; }
        .gm-progress-labels { display:flex; justify-content:space-between; padding:6px 2px 0; font-size:11px; color:rgba(255,255,255,.35); font-weight:600; }

        /* Context */
        .gm-context { position:relative; z-index:5; display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:14px; margin-bottom:12px; width:100%; background:rgba(255,255,255,.03); border:1px solid rgba(124,58,237,.15); backdrop-filter:blur(12px); }
        .gm-context-icon { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#c9a227,#8b6914); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 12px rgba(201,162,39,.3); }

        /* Points popup */
        .gm-pts-popup { position:fixed; top:100px; left:50%; transform:translateX(-50%); z-index:50; padding:8px 24px; border-radius:24px; font-size:18px; font-weight:800; background:linear-gradient(135deg,#27ae60,#2ecc71); color:#fff; box-shadow:0 4px 24px rgba(39,174,96,.5); animation:gmFloat 1.2s ease-out forwards; }

        /* Question */
        .gm-question { position:relative; z-index:5; width:100%; padding:20px 22px; border-radius:20px; margin-bottom:14px; background:rgba(255,255,255,.04); backdrop-filter:blur(20px); border:1px solid rgba(124,58,237,.2); box-shadow:0 8px 32px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.05); transition:all .3s; }
        .gm-question.shake { animation:gmShake .5s ease-in-out; }
        .gm-question.celebrate { animation:gmCelebrate .6s ease-out; box-shadow:0 0 40px rgba(39,174,96,.3),0 8px 32px rgba(0,0,0,.3); border-color:rgba(39,174,96,.4); }
        .gm-q-number { font-size:10px; font-weight:700; letter-spacing:2px; color:rgba(232,200,71,.6); text-transform:uppercase; margin-bottom:10px; }
        .gm-q-text { font-family:'Playfair Display','Georgia',serif; font-size:19px; font-weight:700; text-align:center; line-height:1.45; color:#fff; margin:0; }

        /* Options */
        .gm-options { position:relative; z-index:5; width:100%; display:flex; flex-direction:column; gap:10px; margin-bottom:12px; }
        .gm-opt { position:relative; display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:16px; cursor:pointer; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); color:#fff; text-align:left; font-family:inherit; font-size:14px; transition:all .25s cubic-bezier(.4,0,.2,1); overflow:hidden; backdrop-filter:blur(8px); }
        .gm-opt:not(:disabled):hover { background:rgba(124,58,237,.08); border-color:rgba(124,58,237,.3); transform:translateY(-1px); box-shadow:0 4px 16px rgba(124,58,237,.15); }
        .gm-opt.opt-selected { background:rgba(201,162,39,.1); border-color:rgba(232,200,71,.5); box-shadow:0 0 20px rgba(232,200,71,.15); }
        .gm-opt.opt-selected .gm-opt-letter { background:linear-gradient(135deg,#c9a227,#e8c847); color:#1a0a4a; }
        .gm-opt.opt-correct { background:rgba(39,174,96,.12); border-color:rgba(46,204,113,.6); box-shadow:0 0 24px rgba(39,174,96,.2); animation:gmGlow .8s ease-out; }
        .gm-opt.opt-correct .gm-opt-letter { background:linear-gradient(135deg,#27ae60,#2ecc71); color:#fff; }
        .gm-opt.opt-wrong { background:rgba(231,76,60,.12); border-color:rgba(231,76,60,.6); animation:gmShake .5s ease-in-out; }
        .gm-opt.opt-wrong .gm-opt-letter { background:linear-gradient(135deg,#c0392b,#e74c3c); color:#fff; }
        .gm-opt-letter { width:36px; height:36px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; background:rgba(255,255,255,.08); transition:all .25s; }
        .gm-opt-text { line-height:1.35; font-weight:500; }
        .gm-opt-glow-g,.gm-opt-glow-r { position:absolute; inset:0; border-radius:16px; pointer-events:none; }
        .gm-opt-glow-g { background:radial-gradient(circle at center,rgba(39,174,96,.15) 0%,transparent 70%); }
        .gm-opt-glow-r { background:radial-gradient(circle at center,rgba(231,76,60,.15) 0%,transparent 70%); }

        /* Feedback */
        .gm-feedback { position:relative; z-index:5; width:100%; display:flex; align-items:flex-start; gap:12px; padding:14px 16px; border-radius:16px; backdrop-filter:blur(12px); animation:gmSlide .3s ease-out; margin-bottom:8px; }
        .gm-feedback.fb-ok { background:rgba(39,174,96,.1); border:1px solid rgba(46,204,113,.4); }
        .gm-feedback.fb-no { background:rgba(231,76,60,.1); border:1px solid rgba(231,76,60,.4); }
        .gm-fb-icon { width:32px; height:32px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:800; color:#fff; }
        .fb-ok .gm-fb-icon { background:linear-gradient(135deg,#27ae60,#2ecc71); box-shadow:0 0 16px rgba(39,174,96,.4); }
        .fb-no .gm-fb-icon { background:linear-gradient(135deg,#c0392b,#e74c3c); box-shadow:0 0 16px rgba(231,76,60,.4); }
        .gm-fb-title { font-weight:700; font-size:14px; margin-bottom:3px; }
        .fb-ok .gm-fb-title { color:#2ecc71; }
        .fb-no .gm-fb-title { color:#e74c3c; }
        .gm-fb-explain { font-size:12px; color:rgba(255,255,255,.55); line-height:1.5; }

        /* Powerups */
        .gm-powerups { position:relative; z-index:5; display:flex; gap:8px; margin-top:4px; margin-bottom:4px; justify-content:center; flex-wrap:wrap; }
        .gm-pu-btn { padding:8px 14px; border-radius:12px; background:rgba(124,58,237,.08); border:1px solid rgba(124,58,237,.25); color:#a78bfa; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; font-family:inherit; transition:all .2s; }
        .gm-pu-btn:hover { background:rgba(124,58,237,.15); border-color:rgba(124,58,237,.4); transform:translateY(-1px); }
        .gm-pu-count { opacity:.5; }

        /* Confirm */
        .gm-confirm { position:relative; z-index:5; width:100%; margin-top:6px; padding:16px; border-radius:16px; font-weight:700; font-size:15px; font-family:inherit; cursor:not-allowed; transition:all .3s; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); color:rgba(255,255,255,.3); opacity:.6; }
        .gm-confirm.active { cursor:pointer; opacity:1; color:#1a0a4a; background:linear-gradient(135deg,#c9a227,#e8c847); border:none; box-shadow:0 4px 24px rgba(201,162,39,.4),0 0 48px rgba(232,200,71,.15); }
        .gm-confirm.active:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(201,162,39,.5); }

        @media(max-width:480px) {
            .gm-q-text { font-size:16px !important; }
            .city-banner-content { flex-wrap:wrap; gap:8px; padding:0 12px; }
        }
    `}</style>;
}