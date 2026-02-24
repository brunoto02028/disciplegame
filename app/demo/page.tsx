'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const BLOCK_META: Record<number, { label: string; icon: string; color: string; glow: string }> = {
    1: { label: 'Bíblico', icon: '📖', color: '#e8c847', glow: 'rgba(232,200,71,0.4)' },
    2: { label: 'Geografia', icon: '🌍', color: '#5dade2', glow: 'rgba(93,173,226,0.4)' },
    3: { label: 'Turismo', icon: '✈️', color: '#58d68d', glow: 'rgba(88,214,141,0.4)' },
};

const DIFF_STARS = ['⭐', '⭐⭐', '⭐⭐⭐'];

export default function DemoPage() {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [timer, setTimer] = useState(0);
    const [shake, setShake] = useState(false);
    const [celebrate, setCelebrate] = useState(false);
    const [pointsAnim, setPointsAnim] = useState(false);
    const [animScore, setAnimScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetch('/api/demo').then(r => r.json()).then(d => {
            if (d.success) setQuestions(d.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading && !finished && questions.length > 0) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [loading, finished, questions.length]);

    // Animated score counter for results
    useEffect(() => {
        if (finished && score > 0) {
            const target = score * 100;
            let cur = 0;
            const step = Math.ceil(target / 40);
            const iv = setInterval(() => {
                cur = Math.min(cur + step, target);
                setAnimScore(cur);
                if (cur >= target) clearInterval(iv);
            }, 30);
            return () => clearInterval(iv);
        }
    }, [finished, score]);

    const handleAnswer = (letter: string) => {
        if (showFeedback) return;
        setSelected(letter);
    };

    const confirmAnswer = () => {
        if (!selected) return;
        const q = questions[current];
        const correct = selected === q.correctOption;
        if (correct) {
            setScore(prev => prev + 1);
            setStreak(prev => prev + 1);
            setCelebrate(true);
            setPointsAnim(true);
            setTimeout(() => { setCelebrate(false); setPointsAnim(false); }, 1200);
        } else {
            setStreak(0);
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
        setShowFeedback(true);

        setTimeout(() => {
            if (current < questions.length - 1) {
                setCurrent(prev => prev + 1);
                setSelected(null);
                setShowFeedback(false);
            } else {
                setFinished(true);
                if (timerRef.current) clearInterval(timerRef.current);
            }
        }, 2800);
    };

    const fmtTime = (s: number) => `${Math.floor(s / 60)}min ${s % 60}s`;
    const progressPct = questions.length > 0 ? ((current + (showFeedback ? 1 : 0)) / questions.length) * 100 : 0;

    // ─── Loading ───
    if (loading) return (
        <div className="demo-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
            <div className="demo-loader" />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 500 }}>Preparando perguntas...</p>
            <Style />
        </div>
    );

    // ─── Results ───
    if (finished) {
        const total = questions.length;
        const pct = Math.round((score / total) * 100);
        const pts = score * 100;
        const grade = pct === 100 ? { emoji: '💎', label: 'PERFEITO!', color: '#e8c847' }
            : pct >= 80 ? { emoji: '🏆', label: 'EXCELENTE!', color: '#2ecc71' }
            : pct >= 50 ? { emoji: '⭐', label: 'BOM TRABALHO!', color: '#e8c847' }
            : { emoji: '💪', label: 'CONTINUE TENTANDO!', color: '#e74c3c' };

        return (
            <div className="demo-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
                <div style={{ maxWidth: 440, width: '100%', position: 'relative', zIndex: 2 }}>

                    {/* Glow orb behind */}
                    <div className="result-glow" />

                    {/* Check / Trophy circle */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div className="result-badge">
                            <div className="result-badge-inner">
                                <span style={{ fontSize: 48 }}>{grade.emoji}</span>
                            </div>
                            <div className="result-ring" />
                        </div>
                        <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, marginTop: 16, marginBottom: 4, color: '#fff' }}>
                            Demo Completa!
                        </h1>
                        <div className="result-grade" style={{ color: grade.color }}>{grade.label}</div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div className="stat-card">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-value">{fmtTime(timer)}</div>
                            <div className="stat-label">Tempo</div>
                            <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${Math.min(100, (timer / 180) * 100)}%`, background: 'linear-gradient(90deg,#5dade2,#3498db)' }} /></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-value" style={{ color: pct >= 80 ? '#2ecc71' : pct >= 50 ? '#e8c847' : '#e74c3c' }}>{pct}%</div>
                            <div className="stat-label">Precisão</div>
                            <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'linear-gradient(90deg,#27ae60,#2ecc71)' : pct >= 50 ? 'linear-gradient(90deg,#c9a227,#e8c847)' : 'linear-gradient(90deg,#c0392b,#e74c3c)' }} /></div>
                        </div>
                    </div>

                    {/* Points card */}
                    <div className="points-card">
                        <div className="points-trophy">🏆</div>
                        <div className="points-value">{animScore}<span className="points-unit"> pontos</span></div>
                        <div className="points-detail">{score}/{total} corretas</div>
                        <div className="points-shimmer" />
                    </div>

                    {/* CTA */}
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>
                            Isso foi só uma amostra! O jogo completo tem <strong style={{ color: '#e8c847' }}>27+ perguntas</strong>, <strong style={{ color: '#e8c847' }}>3 cidades bíblicas</strong>, ranking global, conquistas e muito mais.
                        </p>
                        <Link href="/auth/register" className="cta-btn-primary">
                            Criar Conta Grátis e Jogar
                        </Link>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <Link href="/" className="cta-btn-secondary">← Voltar</Link>
                            <button onClick={() => { setCurrent(0); setScore(0); setStreak(0); setSelected(null); setShowFeedback(false); setFinished(false); setTimer(0); setAnimScore(0); }} className="cta-btn-secondary">🔄 Jogar de Novo</button>
                        </div>
                    </div>
                </div>
                <Style />
            </div>
        );
    }

    if (questions.length === 0) return (
        <div className="demo-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <p>Nenhuma pergunta disponível. <Link href="/" style={{ color: '#e8c847' }}>Voltar</Link></p>
            <Style />
        </div>
    );

    const q = questions[current];
    const block = BLOCK_META[q.block] || BLOCK_META[1];
    const isCorrect = selected === q.correctOption;

    return (
        <div className="demo-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>

            {/* ── Top bar ── */}
            <div className="game-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="logo-circle"><svg width={14} height={14} viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="20" rx="1" fill="#fff" /><rect x="4" y="7" width="16" height="4" rx="1" fill="#fff" /></svg></div>
                    <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>DEMO GRATUITA</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{q.cityFlag} {q.cityName}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {streak >= 2 && <div className="streak-badge">🔥 {streak}x</div>}
                    <div className="score-badge">⭐ {score * 100}</div>
                    <div className="timer-badge">{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</div>
                </div>
            </div>

            {/* ── Progress bar ── */}
            <div className="progress-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPct}%` }}>
                        <div className="progress-glow" />
                    </div>
                </div>
                <div className="progress-labels">
                    <span>{current + 1} / {questions.length}</span>
                    <span style={{ color: block.color }}>{block.icon} {block.label}</span>
                    <span>{DIFF_STARS[(q.difficulty || 1) - 1]}</span>
                </div>
            </div>

            {/* ── Question area ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 28px', maxWidth: 540, margin: '0 auto', width: '100%' }}>

                {/* Points animation */}
                {pointsAnim && (
                    <div className="points-popup">+{streak >= 3 ? 130 : 100} pts{streak >= 3 ? ' 🔥' : ''}</div>
                )}

                {/* Question card */}
                <div className={`question-card ${shake ? 'shake' : ''} ${celebrate ? 'celebrate' : ''}`}>
                    <div className="question-number">PERGUNTA {current + 1}</div>
                    <h2 className="question-text">{q.questionText}</h2>
                </div>

                {/* Options */}
                <div className="options-grid">
                    {q.options.map((opt: { letter: string; text: string }, idx: number) => {
                        const isSel = selected === opt.letter;
                        const isCorr = opt.letter === q.correctOption;
                        const showGreen = showFeedback && isCorr;
                        const showRed = showFeedback && isSel && !isCorrect;
                        const cls = showGreen ? 'opt-correct' : showRed ? 'opt-wrong' : isSel ? 'opt-selected' : '';
                        return (
                            <button key={opt.letter} onClick={() => handleAnswer(opt.letter)} disabled={showFeedback}
                                className={`option-btn ${cls}`}
                                style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="opt-letter">
                                    {showGreen ? '✓' : showRed ? '✕' : opt.letter}
                                </div>
                                <span className="opt-text">{opt.text}</span>
                                {showGreen && <div className="opt-glow-green" />}
                                {showRed && <div className="opt-glow-red" />}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback */}
                {showFeedback && (
                    <div className={`feedback-card ${isCorrect ? 'fb-correct' : 'fb-wrong'}`}>
                        <div className="fb-icon">{isCorrect ? '✓' : '✕'}</div>
                        <div>
                            <div className="fb-title">{isCorrect ? (streak >= 3 ? `${streak}x Seguidas! 🔥` : 'Correto!') : 'Incorreto'}</div>
                            <div className="fb-explain">{q.explanation}</div>
                        </div>
                    </div>
                )}

                {/* Confirm button */}
                {!showFeedback && (
                    <button onClick={confirmAnswer} disabled={!selected} className={`confirm-btn ${selected ? 'active' : ''}`}>
                        Confirmar Resposta
                    </button>
                )}
            </div>

            <Style />
        </div>
    );
}

function Style() {
    return <style>{`
        /* ── Base ── */
        .demo-root {
            background: radial-gradient(ellipse at 50% 0%, #1a0f4a 0%, #0d0b2e 50%, #060618 100%);
            position: relative; overflow: hidden;
        }
        .demo-root::before {
            content: ''; position: absolute; inset: 0; pointer-events: none;
            background: url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='s'%3E%3Cstop offset='0' stop-color='%23fff' stop-opacity='.7'/%3E%3Cstop offset='1' stop-color='%23fff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='80' r='1.5' fill='url(%23s)'/%3E%3Ccircle cx='150' cy='30' r='1' fill='url(%23s)'/%3E%3Ccircle cx='250' cy='120' r='1.2' fill='url(%23s)'/%3E%3Ccircle cx='350' cy='60' r='0.8' fill='url(%23s)'/%3E%3Ccircle cx='100' cy='200' r='1.3' fill='url(%23s)'/%3E%3Ccircle cx='300' cy='250' r='1' fill='url(%23s)'/%3E%3Ccircle cx='200' cy='350' r='1.5' fill='url(%23s)'/%3E%3Ccircle cx='80' cy='320' r='0.7' fill='url(%23s)'/%3E%3Ccircle cx='370' cy='180' r='1.1' fill='url(%23s)'/%3E%3Ccircle cx='180' cy='150' r='0.9' fill='url(%23s)'/%3E%3C/svg%3E");
            animation: drift 60s linear infinite; opacity: 0.5;
        }
        .demo-root::after {
            content: ''; position: absolute; top: -50%; left: 50%; transform: translateX(-50%);
            width: 800px; height: 800px; border-radius: 50%;
            background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(201,162,39,0.06) 40%, transparent 70%);
            pointer-events: none; animation: breathe 8s ease-in-out infinite;
        }
        @keyframes drift { to { background-position: 400px 400px; } }
        @keyframes breathe { 0%,100% { opacity:0.6; transform: translateX(-50%) scale(1); } 50% { opacity:1; transform: translateX(-50%) scale(1.1); } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .demo-loader {
            width: 56px; height: 56px; border-radius: 50%;
            border: 3px solid rgba(255,255,255,0.08); border-top-color: #e8c847;
            animation: spin 0.8s linear infinite;
            box-shadow: 0 0 24px rgba(232,200,71,0.3);
        }

        /* ── Top bar ── */
        .game-topbar {
            position: relative; z-index: 5; display: flex; align-items: center; justify-content: space-between;
            padding: 10px 16px; background: rgba(6,6,24,0.85); backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(201,162,39,0.15);
        }
        .logo-circle {
            width: 34px; height: 34px; border-radius: 10px;
            background: linear-gradient(135deg, #c9a227, #8b6914);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 12px rgba(201,162,39,0.4);
        }
        .streak-badge {
            padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;
            background: rgba(255,107,0,0.2); border: 1px solid rgba(255,107,0,0.5); color: #ff8c00;
            animation: pulse 1.5s ease-in-out infinite;
        }
        .score-badge {
            padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
            background: rgba(201,162,39,0.12); border: 1px solid rgba(201,162,39,0.3); color: #e8c847;
        }
        .timer-badge {
            padding: 5px 12px; border-radius: 10px; font-family: 'JetBrains Mono', monospace;
            font-size: 15px; font-weight: 700; letter-spacing: 2px; color: #e8c847;
            background: rgba(0,0,0,0.4); border: 1px solid rgba(201,162,39,0.25);
        }

        /* ── Progress ── */
        .progress-container { position: relative; z-index: 5; padding: 10px 16px 6px; background: rgba(0,0,0,0.2); }
        .progress-bar {
            height: 6px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
        }
        .progress-fill {
            height: 100%; border-radius: 3px; position: relative; transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
            background: linear-gradient(90deg, #7c3aed, #c9a227, #e8c847);
        }
        .progress-glow {
            position: absolute; right: -4px; top: -4px; width: 14px; height: 14px; border-radius: 50%;
            background: #e8c847; filter: blur(4px); animation: pulse 1.5s ease-in-out infinite;
        }
        .progress-labels {
            display: flex; justify-content: space-between; padding: 6px 2px 0; font-size: 11px;
            color: rgba(255,255,255,0.35); font-weight: 600;
        }

        /* ── Points popup ── */
        .points-popup {
            position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 50;
            padding: 8px 24px; border-radius: 24px; font-size: 18px; font-weight: 800;
            background: linear-gradient(135deg, #27ae60, #2ecc71); color: #fff;
            box-shadow: 0 4px 24px rgba(39,174,96,0.5);
            animation: floatUp 1.2s ease-out forwards;
        }
        @keyframes floatUp { 0% { opacity:0; transform: translateX(-50%) translateY(20px) scale(0.8); } 20% { opacity:1; transform: translateX(-50%) translateY(0) scale(1.1); } 60% { opacity:1; transform: translateX(-50%) translateY(-20px) scale(1); } 100% { opacity:0; transform: translateX(-50%) translateY(-60px) scale(0.8); } }

        /* ── Question card ── */
        .question-card {
            position: relative; z-index: 5; width: 100%; padding: 20px 22px;
            border-radius: 20px; margin-bottom: 16px;
            background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
            border: 1px solid rgba(124,58,237,0.2);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
            transition: all 0.3s;
        }
        .question-card.shake { animation: shakeAnim 0.5s ease-in-out; }
        .question-card.celebrate { animation: celebrateAnim 0.6s ease-out; box-shadow: 0 0 40px rgba(39,174,96,0.3), 0 8px 32px rgba(0,0,0,0.3); border-color: rgba(39,174,96,0.4); }
        @keyframes shakeAnim { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
        @keyframes celebrateAnim { 0% { transform: scale(1); } 30% { transform: scale(1.03); } 100% { transform: scale(1); } }
        .question-number {
            font-size: 10px; font-weight: 700; letter-spacing: 2px; color: rgba(232,200,71,0.6);
            text-transform: uppercase; margin-bottom: 10px;
        }
        .question-text {
            font-family: 'Playfair Display','Georgia',serif; font-size: 19px; font-weight: 700;
            text-align: center; line-height: 1.45; color: #fff; margin: 0;
        }

        /* ── Options ── */
        .options-grid {
            position: relative; z-index: 5; width: 100%; display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;
        }
        .option-btn {
            position: relative; display: flex; align-items: center; gap: 14px;
            padding: 14px 16px; border-radius: 16px; cursor: pointer;
            background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08);
            color: #fff; text-align: left; font-family: inherit; font-size: 14px;
            transition: all 0.25s cubic-bezier(0.4,0,0.2,1); overflow: hidden;
            backdrop-filter: blur(8px);
        }
        .option-btn:not(:disabled):hover {
            background: rgba(124,58,237,0.08); border-color: rgba(124,58,237,0.3);
            transform: translateY(-1px); box-shadow: 0 4px 16px rgba(124,58,237,0.15);
        }
        .option-btn.opt-selected {
            background: rgba(201,162,39,0.1); border-color: rgba(232,200,71,0.5);
            box-shadow: 0 0 20px rgba(232,200,71,0.15);
        }
        .option-btn.opt-selected .opt-letter { background: linear-gradient(135deg, #c9a227, #e8c847); color: #1a0a4a; }
        .option-btn.opt-correct {
            background: rgba(39,174,96,0.12); border-color: rgba(46,204,113,0.6);
            box-shadow: 0 0 24px rgba(39,174,96,0.2); animation: glowGreen 0.8s ease-out;
        }
        .option-btn.opt-correct .opt-letter { background: linear-gradient(135deg, #27ae60, #2ecc71); color: #fff; }
        .option-btn.opt-wrong {
            background: rgba(231,76,60,0.12); border-color: rgba(231,76,60,0.6);
            animation: shakeAnim 0.5s ease-in-out;
        }
        .option-btn.opt-wrong .opt-letter { background: linear-gradient(135deg, #c0392b, #e74c3c); color: #fff; }
        @keyframes glowGreen { 0% { box-shadow: 0 0 0 rgba(39,174,96,0); } 50% { box-shadow: 0 0 40px rgba(39,174,96,0.4); } 100% { box-shadow: 0 0 24px rgba(39,174,96,0.2); } }

        .opt-letter {
            width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 14px;
            background: rgba(255,255,255,0.08); transition: all 0.25s;
        }
        .opt-text { line-height: 1.35; font-weight: 500; }
        .opt-glow-green, .opt-glow-red {
            position: absolute; inset: 0; border-radius: 16px; pointer-events: none;
            animation: optGlow 1s ease-out;
        }
        .opt-glow-green { background: radial-gradient(circle at center, rgba(39,174,96,0.15) 0%, transparent 70%); }
        .opt-glow-red { background: radial-gradient(circle at center, rgba(231,76,60,0.15) 0%, transparent 70%); }
        @keyframes optGlow { 0% { opacity:0; } 30% { opacity:1; } 100% { opacity:0.5; } }

        /* ── Feedback ── */
        .feedback-card {
            position: relative; z-index: 5; width: 100%; display: flex; align-items: flex-start; gap: 12px;
            padding: 14px 16px; border-radius: 16px; backdrop-filter: blur(12px);
            animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fb-correct { background: rgba(39,174,96,0.1); border: 1px solid rgba(46,204,113,0.4); }
        .fb-wrong { background: rgba(231,76,60,0.1); border: 1px solid rgba(231,76,60,0.4); }
        .fb-icon {
            width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px; font-weight: 800; color: #fff;
        }
        .fb-correct .fb-icon { background: linear-gradient(135deg, #27ae60, #2ecc71); box-shadow: 0 0 16px rgba(39,174,96,0.4); }
        .fb-wrong .fb-icon { background: linear-gradient(135deg, #c0392b, #e74c3c); box-shadow: 0 0 16px rgba(231,76,60,0.4); }
        .fb-title { font-weight: 700; font-size: 14px; margin-bottom: 3px; }
        .fb-correct .fb-title { color: #2ecc71; }
        .fb-wrong .fb-title { color: #e74c3c; }
        .fb-explain { font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.5; }

        /* ── Confirm button ── */
        .confirm-btn {
            position: relative; z-index: 5; width: 100%; margin-top: 6px; padding: 16px;
            border-radius: 16px; font-weight: 700; font-size: 15px; font-family: inherit;
            cursor: not-allowed; transition: all 0.3s;
            background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.3); opacity: 0.6;
        }
        .confirm-btn.active {
            cursor: pointer; opacity: 1; color: #1a0a4a;
            background: linear-gradient(135deg, #c9a227, #e8c847);
            border: none; box-shadow: 0 4px 24px rgba(201,162,39,0.4), 0 0 48px rgba(232,200,71,0.15);
        }
        .confirm-btn.active:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,162,39,0.5); }

        /* ── Results ── */
        .result-glow {
            position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
            width: 500px; height: 500px; border-radius: 50%; pointer-events: none;
            background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(201,162,39,0.08) 40%, transparent 70%);
            animation: breathe 6s ease-in-out infinite;
        }
        .result-badge {
            position: relative; display: inline-block; width: 100px; height: 100px;
        }
        .result-badge-inner {
            position: relative; z-index: 2; width: 100px; height: 100px; border-radius: 50%;
            background: linear-gradient(135deg, #1a0f4a, #2d1b69);
            border: 3px solid rgba(232,200,71,0.5);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 40px rgba(201,162,39,0.3), inset 0 0 20px rgba(124,58,237,0.2);
        }
        .result-ring {
            position: absolute; inset: -8px; border-radius: 50%;
            border: 2px solid rgba(232,200,71,0.2);
            animation: spin 12s linear infinite;
        }
        .result-ring::before {
            content: ''; position: absolute; top: -3px; left: 50%; width: 6px; height: 6px;
            border-radius: 50%; background: #e8c847; box-shadow: 0 0 8px #e8c847;
        }
        .result-grade {
            font-size: 14px; font-weight: 800; letter-spacing: 3px; margin-top: 8px;
            text-shadow: 0 0 20px currentColor;
        }

        .stat-card {
            position: relative; z-index: 2; padding: 16px; border-radius: 16px; text-align: center;
            background: rgba(255,255,255,0.04); backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .stat-icon { font-size: 20px; margin-bottom: 6px; }
        .stat-value { font-family: 'Playfair Display','Georgia',serif; font-size: 22px; font-weight: 800; color: #fff; }
        .stat-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .stat-bar { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.06); margin-top: 8px; overflow: hidden; }
        .stat-bar-fill { height: 100%; border-radius: 2px; transition: width 1s ease-out; }

        .points-card {
            position: relative; z-index: 2; padding: 24px; border-radius: 20px; text-align: center;
            background: linear-gradient(135deg, rgba(201,162,39,0.12), rgba(139,105,20,0.08));
            border: 2px solid rgba(232,200,71,0.35);
            box-shadow: 0 8px 40px rgba(201,162,39,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
            overflow: hidden;
        }
        .points-trophy { font-size: 32px; margin-bottom: 6px; }
        .points-value {
            font-family: 'Playfair Display','Georgia',serif; font-size: 48px; font-weight: 800;
            color: #fff; line-height: 1; text-shadow: 0 0 30px rgba(232,200,71,0.3);
        }
        .points-unit { font-size: 20px; font-weight: 600; color: #e8c847; }
        .points-detail { font-size: 14px; color: rgba(255,255,255,0.45); margin-top: 6px; }
        .points-shimmer {
            position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(232,200,71,0.08), transparent);
            animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer { 0% { left: -50%; } 100% { left: 150%; } }

        /* ── CTA buttons ── */
        .cta-btn-primary {
            display: block; width: 100%; padding: 16px; border-radius: 16px; text-align: center;
            background: linear-gradient(135deg, #c9a227, #e8c847); color: #1a0a4a;
            font-weight: 700; font-size: 16px; text-decoration: none;
            box-shadow: 0 4px 24px rgba(201,162,39,0.4), 0 0 48px rgba(232,200,71,0.15);
            transition: all 0.3s;
        }
        .cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,162,39,0.5); }
        .cta-btn-secondary {
            display: flex; align-items: center; justify-content: center; padding: 13px 16px;
            border-radius: 14px; text-decoration: none; font-weight: 600; font-size: 13px;
            background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.6); cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .cta-btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(201,162,39,0.3); color: #e8c847; }

        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.05); } }

        @media (max-width: 480px) {
            .question-text { font-size: 16px !important; }
            .points-value { font-size: 38px !important; }
            .game-topbar { flex-wrap: wrap; gap: 8px; }
        }
    `}</style>;
}
