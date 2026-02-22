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

function CrossIcon({ size = 24, color = '#c9a227' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="10" y="2" width="4" height="20" rx="1" fill={color} />
            <rect x="4" y="7" width="16" height="4" rx="1" fill={color} />
        </svg>
    );
}

const blockColors: Record<number, { bg: string; border: string; label: string; color: string }> = {
    1: { bg: 'rgba(201,162,39,0.2)', border: 'rgba(201,162,39,0.5)', label: 'Contexto Biblico', color: '#d4b84a' },
    2: { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.3)', label: 'Geografia Atual', color: 'rgba(255,255,255,0.7)' },
    3: { bg: 'rgba(201,162,39,0.2)', border: 'rgba(201,162,39,0.5)', label: 'Turismo e Economia', color: '#c9a227' },
};

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
            setTimeout(() => {
                setPointsEarned(null);
                if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion(prev => prev + 1);
                    setSelectedAnswer(null);
                    setShowFeedback(false);
                    setQuestionStartTime(Date.now());
                } else {
                    router.push('/results?sessionId=' + sessionId + '&time=' + timer);
                }
            }, 2500);
        } catch { console.error('Error submitting answer'); }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    if (!city || questions.length === 0) return (
        <div style={{ minHeight: '100vh', background: '#0d0b2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cidade nao encontrada</div>
    );

    const question = questions[currentQuestion];
    const options = question.options || [
        { letter: 'A', text: question.option_a },
        { letter: 'B', text: question.option_b },
        { letter: 'C', text: question.option_c },
        { letter: 'D', text: question.option_d },
    ];
    const block = blockColors[question.block] || blockColors[1];
    const progressPct = ((currentQuestion + 1) / questions.length) * 100;
    const correctCount = answers.filter(a => a.correct).length;
    const goldBorder = '1px solid rgba(201,162,39,0.35)';
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: goldBorder, borderRadius: 20, backdropFilter: 'blur(16px)' };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>

            {/* City photo banner */}
            <div style={{ position: 'relative', height: 100, overflow: 'hidden' }}>
                <img src={getCityImage(city.name)} alt={city.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#0d0b2e 10%,rgba(26,10,74,0.7) 50%,rgba(26,10,74,0.5) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: goldBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {CITY_FLAGS[city.country?.toLowerCase()] || '🌍'}
                    </div>
                    <div>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 1 }}>{city.country}</p>
                        <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700 }}>{city.name}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {streak >= 2 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(201,162,39,0.2)', border: goldBorder, borderRadius: 20, padding: '4px 12px', backdropFilter: 'blur(8px)' }}>
                            <span style={{ fontSize: 14 }}>🔥</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#c9a227' }}>{streak}x</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.4)', border: goldBorder, borderRadius: 20, padding: '4px 12px', backdropFilter: 'blur(8px)' }}>
                        <span style={{ fontSize: 13 }}>⭐</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#c9a227' }}>{totalPoints}</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: goldBorder, borderRadius: 10, padding: '4px 12px', fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#c9a227', letterSpacing: 2, backdropFilter: 'blur(8px)' }}>
                        {formatTime(timer)}
                    </div>
                    <button onClick={() => router.push('/dashboard')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: goldBorder, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, backdropFilter: 'blur(8px)' }}>✕</button>
                </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: 'rgba(0,0,0,0.15)' }}>
                {questions.map((_, i) => {
                    const answered = i < answers.length;
                    const correct = answered ? answers[i].correct : null;
                    const isCurrent = i === currentQuestion;
                    return (
                        <div key={i} style={{ width: isCurrent ? 24 : 10, height: 10, borderRadius: 5, transition: 'all 0.3s', background: !answered && !isCurrent ? 'rgba(255,255,255,0.15)' : isCurrent ? '#c9a227' : correct ? '#27ae60' : '#e74c3c' }} />
                    );
                })}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 24px', maxWidth: 520, margin: '0 auto', width: '100%' }}>

                <div style={{ ...glass, padding: '12px 16px', marginBottom: 14, width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CrossIcon size={18} color="#fff" /></div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                        <strong style={{ color: '#fff' }}>Contexto:</strong> {city.biblicalContext || city.biblical_context}
                    </p>
                </div>

                <div style={{ ...glass, padding: '20px 20px', width: '100%', position: 'relative' }}>
                    {pointsEarned !== null && pointsEarned > 0 && (
                        <div style={{ position: 'absolute', top: -18, right: 20, background: 'linear-gradient(135deg,#27ae60,#2ecc71)', borderRadius: 20, padding: '4px 14px', fontSize: 14, fontWeight: 800, color: '#fff', zIndex: 10 }}>
                            +{pointsEarned} pts {streak >= 3 ? '🔥' : ''}
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{currentQuestion + 1} / {questions.length}</p>
                        <span style={{ background: block.bg, border: '1px solid ' + block.border, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, color: block.color }}>{block.label}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 14, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: progressPct + '%', background: 'linear-gradient(90deg,#c9a227,#8b6914)', borderRadius: 4, transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        <span>✓ {correctCount} corretas</span>
                        <span>✕ {answers.length - correctCount} erros</span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 18, lineHeight: 1.4 }}>
                        {question.questionText || question.question_text}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {options.map((opt: { letter: string; text: string }) => {
                            const isSelected = selectedAnswer === opt.letter;
                            const isCorrectAns = opt.letter === correctOption;
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
                                    {isCorrect ? ('Correto! ' + (streak >= 3 ? streak + 'x seguidas! 🔥' : '')) : 'Incorreto'}
                                </p>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{question.explanation}</p>
                            </div>
                        </div>
                    )}
                </div>

                {!showFeedback && (
                    <button onClick={confirmAnswer} disabled={!selectedAnswer}
                        style={{ width: '100%', marginTop: 14, padding: '15px', borderRadius: 16, background: selectedAnswer ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(255,255,255,0.06)', border: selectedAnswer ? 'none' : '1px solid rgba(255,255,255,0.12)', color: selectedAnswer ? '#1a0a4a' : '#fff', fontWeight: 700, fontSize: 15, cursor: selectedAnswer ? 'pointer' : 'not-allowed', opacity: selectedAnswer ? 1 : 0.5, boxShadow: selectedAnswer ? '0 4px 20px rgba(201,162,39,0.4)' : 'none', transition: 'all 0.2s' }}>
                        Confirmar Resposta
                    </button>
                )}
            </div>
        </div>
    );
}