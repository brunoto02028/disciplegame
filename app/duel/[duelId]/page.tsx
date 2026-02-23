'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function CrossIcon({ size = 24, color = '#c9a227' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="10" y="2" width="4" height="20" rx="1" fill={color} />
            <rect x="4" y="7" width="16" height="4" rx="1" fill={color} />
        </svg>
    );
}

export default function DuelPage({ params }: { params: Promise<{ duelId: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [duel, setDuel] = useState<any>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
    const [qStartTime, setQStartTime] = useState(Date.now());
    const [shareMsg, setShareMsg] = useState('');

    const fetchDuel = async () => {
        const res = await fetch(`/api/duels/${resolvedParams.duelId}`, { credentials: 'include' });
        if (!res.ok) { router.push('/dashboard'); return; }
        const data = await res.json();
        if (data.success) setDuel(data.data);
        setLoading(false);
    };

    useEffect(() => { fetchDuel(); }, [resolvedParams.duelId]);

    const handleJoin = async () => {
        const res = await fetch(`/api/duels/${resolvedParams.duelId}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ action: 'join' }),
        });
        const data = await res.json();
        if (data.success) fetchDuel();
    };

    const handleAnswer = (letter: string) => { if (!showFeedback) setSelected(letter); };

    const confirmAnswer = async () => {
        if (!selected || !duel?.questions?.[currentQ]) return;
        const q = duel.questions[currentQ];
        const timeTaken = Math.floor((Date.now() - qStartTime) / 1000);
        const res = await fetch(`/api/duels/${resolvedParams.duelId}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ action: 'answer', questionId: q.id, selectedOption: selected, timeTaken }),
        });
        const data = await res.json();
        if (data.success) {
            setFeedback(data.data);
            setAnswers(prev => [...prev, { correct: data.data.correct }]);
            setShowFeedback(true);
            setTimeout(() => {
                if (currentQ < duel.questions.length - 1) {
                    setCurrentQ(prev => prev + 1);
                    setSelected(null);
                    setShowFeedback(false);
                    setFeedback(null);
                    setQStartTime(Date.now());
                } else {
                    fetchDuel(); // Refresh to show final state
                }
            }, 2200);
        }
    };

    const goldBorder = '1px solid rgba(201,162,39,0.35)';
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: goldBorder, borderRadius: 16, backdropFilter: 'blur(16px)' };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    if (!duel) return null;

    // Completed duel — show results
    if (duel.status === 'completed' || (duel.isParticipant && !duel.questions)) {
        const winner = duel.winnerId === null ? 'Empate!' : (duel.challenger.points > (duel.opponent?.points || 0)) ? duel.challenger.name + ' venceu!' : (duel.opponent?.name || '') + ' venceu!';
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", padding: '32px 16px' }}>
                <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
                    <Link href="/dashboard" style={{ color: '#c9a227', textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 20 }}>← Dashboard</Link>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Duelo {duel.status === 'completed' ? 'Finalizado' : 'Em Andamento'}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>{duel.cityName}</p>

                    {duel.status === 'completed' && (
                        <div style={{ background: 'rgba(201,162,39,0.1)', border: '2px solid rgba(201,162,39,0.4)', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
                            <p style={{ fontSize: 20, fontWeight: 800, color: '#c9a227', fontFamily: "'Playfair Display','Georgia',serif" }}>{winner}</p>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                        <div style={{ ...glass, padding: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#1a0a4a', margin: '0 auto 8px' }}>{duel.challenger.name.charAt(0)}</div>
                            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{duel.challenger.name}</p>
                            <p style={{ fontSize: 24, fontWeight: 800, color: '#c9a227', fontFamily: "'Playfair Display','Georgia',serif" }}>{duel.challenger.points}</p>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{duel.challenger.accuracy}% precisão</p>
                            <p style={{ fontSize: 10, color: duel.challenger.completed ? '#2ecc71' : 'rgba(255,255,255,0.3)', marginTop: 4 }}>{duel.challenger.completed ? '✓ Completo' : '⏳ Jogando...'}</p>
                        </div>
                        <div style={{ ...glass, padding: 16 }}>
                            {duel.opponent ? (
                                <>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, margin: '0 auto 8px' }}>{duel.opponent.name.charAt(0)}</div>
                                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{duel.opponent.name}</p>
                                    <p style={{ fontSize: 24, fontWeight: 800, color: '#c9a227', fontFamily: "'Playfair Display','Georgia',serif" }}>{duel.opponent.points}</p>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{duel.opponent.accuracy}% precisão</p>
                                    <p style={{ fontSize: 10, color: duel.opponent.completed ? '#2ecc71' : 'rgba(255,255,255,0.3)', marginTop: 4 }}>{duel.opponent.completed ? '✓ Completo' : '⏳ Jogando...'}</p>
                                </>
                            ) : (
                                <div style={{ padding: '20px 0' }}>
                                    <p style={{ fontSize: 32, marginBottom: 8 }}>❓</p>
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Aguardando oponente...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!duel.opponent && duel.isChallenger && (
                        <div style={{ ...glass, padding: 16, marginBottom: 20 }}>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Compartilhe este link para desafiar alguém:</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input readOnly value={`disciplegame.com/duel/${resolvedParams.duelId}`} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: goldBorder, color: '#fff', fontSize: 13 }} />
                                <button onClick={() => { navigator.clipboard.writeText(`https://disciplegame.com/duel/${resolvedParams.duelId}`); setShareMsg('Copiado!'); setTimeout(() => setShareMsg(''), 2000); }} style={{ padding: '10px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                                    {shareMsg || '📋 Copiar'}
                                </button>
                            </div>
                        </div>
                    )}

                    <Link href="/dashboard" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Pending duel — not joined yet
    if (duel.status === 'pending' && !duel.isParticipant) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Desafio de Duelo!</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 8 }}>
                        <strong style={{ color: '#c9a227' }}>{duel.challenger.name}</strong> te desafiou para um duelo!
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 28 }}>
                        {duel.questionCount} perguntas sobre <strong style={{ color: '#fff' }}>{duel.cityName}</strong>
                    </p>
                    <button onClick={handleJoin} style={{ display: 'inline-block', padding: '16px 40px', borderRadius: 14, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(201,162,39,0.4)' }}>
                        ⚔️ Aceitar Duelo
                    </button>
                    <br />
                    <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, display: 'inline-block', marginTop: 16 }}>Voltar ao Dashboard</Link>
                </div>
            </div>
        );
    }

    // Playing — show questions
    if (duel.questions && duel.questions.length > 0 && currentQ < duel.questions.length) {
        const q = duel.questions[currentQ];
        const progressPct = ((currentQ + 1) / duel.questions.length) * 100;
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ background: 'rgba(13,11,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: goldBorder, padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>⚔️</span>
                        <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 15 }}>Duelo</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{duel.cityName}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#c9a227' }}>{currentQ + 1}/{duel.questions.length}</span>
                </div>

                {/* Progress */}
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#c9a227,#8b6914)', transition: 'width 0.4s' }} />
                </div>

                {/* Question */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 32px', maxWidth: 520, margin: '0 auto', width: '100%' }}>
                    <div style={{ ...glass, padding: 20, width: '100%' }}>
                        <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 20, lineHeight: 1.4 }}>
                            {q.questionText}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                            {q.options.map((opt: { letter: string; text: string }) => {
                                const isSelected = selected === opt.letter;
                                const isCorrectAns = showFeedback && feedback?.correctOption === opt.letter;
                                const isWrong = showFeedback && isSelected && !feedback?.correct;
                                let bg = 'rgba(255,255,255,0.05)';
                                let bdr = '1px solid rgba(255,255,255,0.12)';
                                let lbg = 'rgba(255,255,255,0.1)';
                                if (isCorrectAns) { bg = 'rgba(39,174,96,0.15)'; bdr = '1px solid rgba(39,174,96,0.6)'; lbg = '#27ae60'; }
                                else if (isWrong) { bg = 'rgba(231,76,60,0.15)'; bdr = '1px solid rgba(231,76,60,0.6)'; lbg = '#e74c3c'; }
                                else if (isSelected) { bg = 'rgba(201,162,39,0.15)'; bdr = '1px solid rgba(201,162,39,0.6)'; lbg = '#c9a227'; }
                                return (
                                    <button key={opt.letter} onClick={() => handleAnswer(opt.letter)} disabled={showFeedback}
                                        style={{ background: bg, border: bdr, borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: showFeedback ? 'default' : 'pointer', textAlign: 'left', color: '#fff', transition: 'all 0.2s' }}>
                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: lbg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                            {isCorrectAns ? '✓' : isWrong ? '✕' : opt.letter}
                                        </div>
                                        <span style={{ fontSize: 14, lineHeight: 1.4 }}>{opt.text}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {showFeedback && feedback?.explanation && (
                            <div style={{ marginTop: 12, background: feedback.correct ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)', border: `1px solid ${feedback.correct ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}`, borderRadius: 12, padding: '10px 14px' }}>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{feedback.explanation}</p>
                            </div>
                        )}
                    </div>

                    {!showFeedback && (
                        <button onClick={confirmAnswer} disabled={!selected}
                            style={{ width: '100%', marginTop: 14, padding: '16px', borderRadius: 16, background: selected ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(255,255,255,0.06)', border: selected ? 'none' : '1px solid rgba(255,255,255,0.12)', color: selected ? '#1a0a4a' : '#fff', fontWeight: 700, fontSize: 15, cursor: selected ? 'pointer' : 'not-allowed', opacity: selected ? 1 : 0.5 }}>
                            Confirmar Resposta
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Fallback
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>Carregando duelo...</p>
                <Link href="/dashboard" style={{ color: '#c9a227', textDecoration: 'none', fontSize: 13, display: 'inline-block', marginTop: 12 }}>← Dashboard</Link>
            </div>
        </div>
    );
}
