'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function DailyChallengePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState<any>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        fetch('/api/daily-challenge', { credentials: 'include' })
            .then(r => { if (!r.ok) { router.push('/auth/login'); return null; } return r.json(); })
            .then(d => {
                if (d?.success) {
                    if (d.data.alreadyDone) {
                        setResult({ alreadyDone: true });
                    } else {
                        setChallenge(d.data);
                    }
                }
                setLoading(false);
            }).catch(() => router.push('/auth/login'));
    }, [router]);

    const handleAnswer = (letter: string) => { if (!showFeedback) setSelected(letter); };

    const confirmAnswer = async () => {
        if (!selected || !challenge?.question) return;
        const res = await fetch('/api/daily-challenge', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ questionId: challenge.question.id, selectedOption: selected }),
        });
        const data = await res.json();
        if (data.success) {
            setResult(data.data);
            setShowFeedback(true);
        }
    };

    const goldBorder = '1px solid rgba(201,162,39,0.35)';
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: goldBorder, borderRadius: 20, backdropFilter: 'blur(16px)' };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    // Already done today
    if (result?.alreadyDone || (result && showFeedback === false && !challenge)) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Desafio Completo!</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 28 }}>Você já completou o desafio diário de hoje. Volte amanhã!</p>
                    <Link href="/dashboard" style={{ display: 'inline-block', padding: '14px 36px', borderRadius: 12, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Show result after answering
    if (showFeedback && result) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: result.correct ? 'rgba(39,174,96,0.2)' : 'rgba(231,76,60,0.2)', border: `2px solid ${result.correct ? 'rgba(39,174,96,0.5)' : 'rgba(231,76,60,0.5)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>
                        {result.correct ? '✓' : '✕'}
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, marginBottom: 8, color: result.correct ? '#2ecc71' : '#e74c3c' }}>
                        {result.correct ? 'Correto!' : 'Incorreto'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>{result.explanation}</p>

                    <div style={{ background: 'rgba(201,162,39,0.1)', border: goldBorder, borderRadius: 14, padding: '16px', marginBottom: 28, marginTop: 20 }}>
                        <p style={{ fontSize: 13, color: '#c9a227', fontWeight: 700 }}>+{result.xpEarned} XP ganhos!</p>
                    </div>

                    <Link href="/dashboard" style={{ display: 'inline-block', padding: '14px 36px', borderRadius: 12, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (!challenge?.question) return null;

    const q = challenge.question;
    const block = blockColors[q.block] || blockColors[1];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ background: 'rgba(13,11,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: goldBorder, padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#c9a227', fontSize: 13, fontWeight: 600 }}>
                    ← Dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CrossIcon size={14} color="#c9a227" />
                    <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 15 }}>Desafio Diário</span>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{challenge.cityFlag} {challenge.cityName}</span>
            </div>

            {/* Challenge badge */}
            <div style={{ textAlign: 'center', padding: '24px 16px 8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 20, padding: '6px 16px' }}>
                    <span style={{ fontSize: 14 }}>📝</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2ecc71' }}>Acerte e ganhe 200 XP</span>
                </div>
            </div>

            {/* Question */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 32px', maxWidth: 520, margin: '0 auto', width: '100%' }}>
                <div style={{ ...glass, padding: '20px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <span style={{ background: block.bg, border: '1px solid ' + block.border, borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 700, color: block.color }}>{block.label}</span>
                    </div>

                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 19, fontWeight: 700, textAlign: 'center', marginBottom: 22, lineHeight: 1.4 }}>
                        {q.questionText}
                    </h2>

                    <div className="daily-options" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 14 }}>
                        {q.options.map((opt: { letter: string; text: string }) => {
                            const isSelected = selected === opt.letter;
                            let bg = 'rgba(255,255,255,0.05)';
                            let bdr = '1px solid rgba(255,255,255,0.12)';
                            let letterBg = 'rgba(255,255,255,0.1)';
                            if (isSelected) { bg = 'rgba(201,162,39,0.15)'; bdr = '1px solid rgba(201,162,39,0.6)'; letterBg = '#c9a227'; }
                            return (
                                <button key={opt.letter} onClick={() => handleAnswer(opt.letter)}
                                    style={{ background: bg, border: bdr, borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', color: '#fff', transition: 'all 0.2s' }}>
                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: letterBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                        {opt.letter}
                                    </div>
                                    <span style={{ fontSize: 14, lineHeight: 1.4 }}>{opt.text}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button onClick={confirmAnswer} disabled={!selected}
                    style={{ width: '100%', marginTop: 14, padding: '16px', borderRadius: 16, background: selected ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(255,255,255,0.06)', border: selected ? 'none' : '1px solid rgba(255,255,255,0.12)', color: selected ? '#1a0a4a' : '#fff', fontWeight: 700, fontSize: 15, cursor: selected ? 'pointer' : 'not-allowed', opacity: selected ? 1 : 0.5, boxShadow: selected ? '0 4px 20px rgba(201,162,39,0.4)' : 'none', transition: 'all 0.2s' }}>
                    Confirmar Resposta
                </button>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
}
