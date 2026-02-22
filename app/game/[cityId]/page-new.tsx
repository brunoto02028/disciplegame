'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

const MVP_CIRCUIT_ID = '00000000-0000-0000-0000-000000000001';

const blockColors: Record<number, { bg: string; border: string; label: string }> = {
    1: { bg: 'rgba(201,162,39,0.2)', border: 'rgba(201,162,39,0.5)', label: 'Contexto Bíblico' },
    2: { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.3)', label: 'Geografia Atual' },
    3: { bg: 'rgba(201,162,39,0.2)', border: 'rgba(201,162,39,0.5)', label: 'Turismo & Economia' },
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
    const [timer, setTimer] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());

    useEffect(() => {
        const initGame = async () => {
            try {
                const sessionRes = await fetch('/api/sessions/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ circuitId: MVP_CIRCUIT_ID }),
                });
                if (!sessionRes.ok) { router.push('/auth/login'); return; }
                const sessionData = await sessionRes.json();
                if (!sessionData.success) { router.push('/auth/login'); return; }
                setSessionId(sessionData.data.sessionId);

                const [questionsRes, citiesRes] = await Promise.all([
                    fetch(`/api/questions/${resolvedParams.cityId}?sessionId=${sessionData.data.sessionId}`, { credentials: 'include' }),
                    fetch(`/api/cities?circuitId=${MVP_CIRCUIT_ID}`),
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
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const handleAnswer = (letter: string) => { if (!showFeedback) setSelectedAnswer(letter); };

    const confirmAnswer = async () => {
        if (!selectedAnswer || !sessionId) return;
        const question = questions[currentQuestion];
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
        try {
            const response = await fetch(`/api/sessions/${sessionId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ questionId: question.id, selectedOption: selectedAnswer, timeTaken }),
            });
            const data = await response.json();
            if (!data.success) return;
            setIsCorrect(data.data.isCorrect);
            setCorrectOption(data.data.correctOption);
            setShowFeedback(true);
            setTimeout(() => {
                if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion(prev => prev + 1);
                    setSelectedAnswer(null);
                    setShowFeedback(false);
                    setQuestionStartTime(Date.now());
                } else {
                    router.push(`/results?sessionId=${sessionId}&time=${timer}`);
                }
            }, 3000);
        } catch { console.error('Error submitting answer'); }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    if (!city || questions.length === 0) {
        return <div style={{ minHeight: '100vh', background: '#0d0b2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cidade não encontrada</div>;
    }

    const question = questions[currentQuestion];
    const options = question.options || [
        { letter: 'A', text: question.option_a },
        { letter: 'B', text: question.option_b },
        { letter: 'C', text: question.option_c },
        { letter: 'D', text: question.option_d },
    ];
    const block = blockColors[question.block] || blockColors[1];
    const progressPct = ((currentQuestion + 1) / questions.length) * 100;

    const glass: React.CSSProperties = {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 20,
        backdropFilter: 'blur(16px)',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>

            {/* TOP BAR */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,215,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {city.country === 'Israel' ? '🇮🇱' : city.country === 'Turkey' ? '🇹🇷' : city.country === 'Malta' ? '🇲🇹' : '🌍'}
                    </div>
                    <div>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 1 }}>{city.country}</p>
                        <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700 }}>{city.name}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,162,39,0.5)', borderRadius: 10, padding: '6px 14px', fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#c9a227', letterSpacing: 2 }}>
                        {formatTime(timer)}
                    </div>
                    <button onClick={() => router.push('/dashboard')} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        ✕
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px', maxWidth: 520, margin: '0 auto', width: '100%' }}>

                {/* Biblical Context */}
                <div style={{ ...glass, padding: '14px 16px', marginBottom: 16, width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>📖</div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                        <strong style={{ color: '#fff' }}>Contexto Bíblico:</strong> {city.biblicalContext || city.biblical_context}
                    </p>
                </div>

                {/* Question Card */}
                <div style={{ ...glass, padding: '22px 20px', width: '100%' }}>
                    {/* Progress header */}
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 10 }}>
                        Pergunta {currentQuestion + 1} de {questions.length}
                    </p>

                    {/* Block badge */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                        <span style={{ background: block.bg, border: `1px solid ${block.border}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                            {block.label}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.1)', marginBottom: 20, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#c9a227,#8b6914)', borderRadius: 4, transition: 'width 0.4s' }} />
                    </div>

                    {/* Question text */}
                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 20, lineHeight: 1.4 }}>
                        {question.questionText || question.question_text}
                    </h2>

                    {/* Options 2x2 grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                        {options.map((opt: { letter: string; text: string }) => {
                            const isSelected = selectedAnswer === opt.letter;
                            const isCorrectAns = opt.letter === correctOption;
                            const showGreen = showFeedback && isCorrectAns;
                            const showRed = showFeedback && isSelected && !isCorrect;

                            let bg = 'rgba(255,255,255,0.06)';
                            let border = '1px solid rgba(255,255,255,0.15)';
                            let letterBg = 'rgba(255,255,255,0.12)';

                            if (showGreen) { bg = 'rgba(39,174,96,0.15)'; border = '1px solid rgba(39,174,96,0.6)'; letterBg = '#27ae60'; }
                            else if (showRed) { bg = 'rgba(231,76,60,0.15)'; border = '1px solid rgba(231,76,60,0.6)'; letterBg = '#e74c3c'; }
                            else if (isSelected) { bg = 'rgba(201,162,39,0.15)'; border = '1px solid rgba(201,162,39,0.6)'; letterBg = '#c9a227'; }

                            return (
                                <button key={opt.letter} onClick={() => handleAnswer(opt.letter)} disabled={showFeedback}
                                    style={{ background: bg, border, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: showFeedback ? 'default' : 'pointer', textAlign: 'left', color: '#fff', transition: 'all 0.2s' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: letterBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                        {showGreen ? '✓' : showRed ? '✕' : opt.letter}
                                    </div>
                                    <span style={{ fontSize: 14, lineHeight: 1.3 }}>{opt.text}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback */}
                    {showFeedback && (
                        <div style={{ background: isCorrect ? 'rgba(39,174,96,0.12)' : 'rgba(231,76,60,0.12)', border: `1px solid ${isCorrect ? 'rgba(39,174,96,0.4)' : 'rgba(231,76,60,0.4)'}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: isCorrect ? '#27ae60' : '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                                {isCorrect ? '✓' : '✕'}
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 15, color: isCorrect ? '#2ecc71' : '#e74c3c', marginBottom: 4 }}>{isCorrect ? 'Correto!' : 'Incorreto'}</p>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{question.explanation}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm button */}
                {!showFeedback && (
                    <button onClick={confirmAnswer} disabled={!selectedAnswer}
                        style={{ width: '100%', marginTop: 16, padding: '16px', borderRadius: 16, background: selectedAnswer ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(255,255,255,0.08)', border: selectedAnswer ? 'none' : '1px solid rgba(255,255,255,0.15)', color: selectedAnswer ? '#1a0a4a' : '#fff', fontWeight: 700, fontSize: 16, cursor: selectedAnswer ? 'pointer' : 'not-allowed', opacity: selectedAnswer ? 1 : 0.5, boxShadow: selectedAnswer ? '0 4px 20px rgba(201,162,39,0.4)' : 'none', transition: 'all 0.2s' }}>
                        Confirmar Resposta
                    </button>
                )}
            </div>
        </div>
    );
}
