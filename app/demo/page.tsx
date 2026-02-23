'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const blockColors: Record<number, { bg: string; border: string; label: string; color: string }> = {
    1: { bg: 'rgba(201,162,39,0.2)', border: 'rgba(201,162,39,0.5)', label: 'Contexto Bíblico', color: '#d4b84a' },
    2: { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.3)', label: 'Geografia Atual', color: 'rgba(255,255,255,0.7)' },
    3: { bg: 'rgba(201,162,39,0.2)', border: 'rgba(201,162,39,0.5)', label: 'Turismo e Economia', color: '#c9a227' },
};

function CrossIcon({ size = 24, color = '#c9a227' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="10" y="2" width="4" height="20" rx="1" fill={color} />
            <rect x="4" y="7" width="16" height="4" rx="1" fill={color} />
        </svg>
    );
}

export default function DemoPage() {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        fetch('/api/demo').then(r => r.json()).then(d => {
            if (d.success) setQuestions(d.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleAnswer = (letter: string) => {
        if (showFeedback) return;
        setSelected(letter);
    };

    const confirmAnswer = () => {
        if (!selected) return;
        const q = questions[current];
        const correct = selected === q.correctOption;
        if (correct) setScore(prev => prev + 1);
        setShowFeedback(true);

        setTimeout(() => {
            if (current < questions.length - 1) {
                setCurrent(prev => prev + 1);
                setSelected(null);
                setShowFeedback(false);
            } else {
                setFinished(true);
            }
        }, 2500);
    };

    const goldBorder = '1px solid rgba(201,162,39,0.35)';
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: goldBorder, borderRadius: 20, backdropFilter: 'blur(16px)' };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    if (finished) {
        const perfect = score === questions.length;
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36, boxShadow: '0 0 40px rgba(201,162,39,0.4)' }}>
                        {perfect ? '💎' : score > 0 ? '🌟' : '💪'}
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
                        Demo Completa!
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 8 }}>
                        Você acertou <strong style={{ color: '#c9a227' }}>{score}/{questions.length}</strong> perguntas
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 36, lineHeight: 1.7 }}>
                        Isso foi só uma amostra! O jogo completo tem <strong style={{ color: '#c9a227' }}>27+ perguntas</strong>, <strong style={{ color: '#c9a227' }}>3 cidades bíblicas</strong>, ranking global, conquistas e muito mais.
                    </p>

                    <Link href="/auth/register" style={{ display: 'block', width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 24px rgba(201,162,39,0.5)', marginBottom: 14 }}>
                        Criar Conta Grátis e Jogar
                    </Link>
                    <Link href="/" style={{ display: 'block', fontSize: 14, color: '#c9a227', textDecoration: 'none', fontWeight: 600 }}>
                        ← Voltar para Home
                    </Link>
                </div>
            </div>
        );
    }

    if (questions.length === 0) return (
        <div style={{ minHeight: '100vh', background: '#0d0b2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Nenhuma pergunta disponível</p>
        </div>
    );

    const q = questions[current];
    const block = blockColors[q.block] || blockColors[1];
    const isCorrect = selected === q.correctOption;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ background: 'rgba(13,11,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: goldBorder, padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CrossIcon size={14} color="#fff" />
                    </div>
                    <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 15 }}>Demo Gratuita</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{q.cityFlag} {q.cityName}</span>
                    <span style={{ background: 'rgba(201,162,39,0.15)', border: goldBorder, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#c9a227' }}>
                        {current + 1}/{questions.length}
                    </span>
                </div>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', background: 'rgba(0,0,0,0.15)' }}>
                {questions.map((_, i) => (
                    <div key={i} style={{ width: i === current ? 28 : 12, height: 12, borderRadius: 6, transition: 'all 0.3s', background: i === current ? '#c9a227' : i < current ? (score > i ? '#27ae60' : '#e74c3c') : 'rgba(255,255,255,0.15)' }} />
                ))}
            </div>

            {/* Question */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 32px', maxWidth: 520, margin: '0 auto', width: '100%' }}>

                <div style={{ ...glass, padding: '20px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ background: block.bg, border: '1px solid ' + block.border, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, color: block.color }}>{block.label}</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Dificuldade {q.difficulty}/3</span>
                    </div>

                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 20, lineHeight: 1.4 }}>
                        {q.questionText}
                    </h2>

                    <div className="demo-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {q.options.map((opt: { letter: string; text: string }) => {
                            const isSelected = selected === opt.letter;
                            const isCorrectAns = opt.letter === q.correctOption;
                            const showGreen = showFeedback && isCorrectAns;
                            const showRed = showFeedback && isSelected && !isCorrect;
                            let bg = 'rgba(255,255,255,0.05)';
                            let bdr = '1px solid rgba(255,255,255,0.12)';
                            let letterBg = 'rgba(255,255,255,0.1)';
                            if (showGreen) { bg = 'rgba(39,174,96,0.15)'; bdr = '1px solid rgba(39,174,96,0.6)'; letterBg = '#27ae60'; }
                            else if (showRed) { bg = 'rgba(231,76,60,0.15)'; bdr = '1px solid rgba(231,76,60,0.6)'; letterBg = '#e74c3c'; }
                            else if (isSelected) { bg = 'rgba(201,162,39,0.15)'; bdr = '1px solid rgba(201,162,39,0.6)'; letterBg = '#c9a227'; }
                            return (
                                <button key={opt.letter} onClick={() => handleAnswer(opt.letter)} disabled={showFeedback}
                                    style={{ background: bg, border: bdr, borderRadius: 14, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: showFeedback ? 'default' : 'pointer', textAlign: 'left', color: '#fff', transition: 'all 0.2s' }}>
                                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: letterBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                                        {showGreen ? '✓' : showRed ? '✕' : opt.letter}
                                    </div>
                                    <span style={{ fontSize: 13, lineHeight: 1.3 }}>{opt.text}</span>
                                </button>
                            );
                        })}
                    </div>

                    {showFeedback && (
                        <div style={{ background: isCorrect ? 'rgba(39,174,96,0.12)' : 'rgba(231,76,60,0.12)', border: '1px solid ' + (isCorrect ? 'rgba(39,174,96,0.4)' : 'rgba(231,76,60,0.4)'), borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: isCorrect ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
                                {isCorrect ? '✓' : '✕'}
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 14, color: isCorrect ? '#2ecc71' : '#e74c3c', marginBottom: 3 }}>
                                    {isCorrect ? 'Correto!' : 'Incorreto'}
                                </p>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{q.explanation}</p>
                            </div>
                        </div>
                    )}
                </div>

                {!showFeedback && (
                    <button onClick={confirmAnswer} disabled={!selected}
                        style={{ width: '100%', marginTop: 14, padding: '15px', borderRadius: 16, background: selected ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(255,255,255,0.06)', border: selected ? 'none' : '1px solid rgba(255,255,255,0.12)', color: selected ? '#1a0a4a' : '#fff', fontWeight: 700, fontSize: 15, cursor: selected ? 'pointer' : 'not-allowed', opacity: selected ? 1 : 0.5, boxShadow: selected ? '0 4px 20px rgba(201,162,39,0.4)' : 'none', transition: 'all 0.2s' }}>
                        Confirmar Resposta
                    </button>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                @media (max-width: 480px) {
                    .demo-options { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
