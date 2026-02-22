'use client';

import { useState, useRef, useEffect } from 'react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [codeId, setCodeId] = useState('');
    const [emailHint, setEmailHint] = useState('');
    const [step, setStep] = useState<'credentials' | 'verify_email'>('credentials');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [remaining, setRemaining] = useState<number | null>(null);
    const codeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (step === 'verify_email') codeRef.current?.focus();
    }, [step]);

    // Load saved email from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('admin_email');
        if (saved) setEmail(saved);
    }, []);

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, step: 'credentials', remember }),
            });
            const data = await res.json();
            if (res.status === 429) {
                setError(data.error);
            } else if (data.success && data.step === 'verify_email') {
                setStep('verify_email');
                setCodeId(data.code_id);
                setEmailHint(data.message);
                setError('');
                if (remember) localStorage.setItem('admin_email', email);
            } else if (data.success) {
                if (remember) localStorage.setItem('admin_email', email);
                window.location.href = '/admin';
            } else {
                setError(data.error || 'Credenciais inválidas');
                if (data.remaining !== undefined) setRemaining(data.remaining);
            }
        } catch {
            setError('Erro de conexão com o servidor');
        }
        setLoading(false);
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: 'verify_code', code_id: codeId, verification_code: verifyCode, remember }),
            });
            const data = await res.json();
            if (res.status === 429) {
                setError(data.error);
            } else if (data.success) {
                window.location.href = '/admin';
            } else {
                setError(data.error || 'Código inválido');
                setVerifyCode('');
                if (data.remaining !== undefined) setRemaining(data.remaining);
            }
        } catch {
            setError('Erro de conexão com o servidor');
        }
        setLoading(false);
    };

    const resendCode = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, step: 'credentials', remember }),
            });
            const data = await res.json();
            if (data.success && data.step === 'verify_email') {
                setCodeId(data.code_id);
                setEmailHint(data.message);
                setError('');
                setVerifyCode('');
            }
        } catch { /* ignore */ }
        setLoading(false);
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', fontSize: 15, border: '1px solid rgba(201,162,39,0.3)', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',system-ui,sans-serif" }}>
            <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 32px rgba(201,162,39,0.4)' }}>
                        {step === 'credentials' ? (
                            <svg width={28} height={28} viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" fill="#fff"/><path d="M8 11V7a4 4 0 118 0v4" stroke="#fff" strokeWidth="2" fill="none"/></svg>
                        ) : (
                            <svg width={28} height={28} viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#fff" strokeWidth="2" fill="none"/><polyline points="22,6 12,13 2,6" stroke="#fff" strokeWidth="2" fill="none"/></svg>
                        )}
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                        {step === 'credentials' ? 'Acesso Admin' : 'Verificação por Email'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                        {step === 'credentials' ? 'O Discípulo — Área Restrita' : emailHint}
                    </p>
                </div>

                {/* Card */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(20px)' }}>
                    {error && (
                        <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 10, padding: '10px 14px', color: '#e74c3c', fontSize: 13, marginBottom: 16 }}>
                            {error}
                            {remaining !== null && remaining <= 2 && (
                                <p style={{ marginTop: 4, fontSize: 11, opacity: 0.8 }}>⚠️ {remaining} tentativa(s) restante(s) antes do bloqueio.</p>
                            )}
                        </div>
                    )}

                    {step === 'credentials' ? (
                        <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Email */}
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@disciplegame.com" required autoFocus autoComplete="email" style={inputStyle} />
                            </div>

                            {/* Password with show/hide */}
                            <div>
                                <label style={labelStyle}>Senha</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        style={{ ...inputStyle, paddingRight: 44 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, padding: '4px 6px' }}
                                        tabIndex={-1}
                                        title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={e => setRemember(e.target.checked)}
                                    style={{ width: 16, height: 16, accentColor: '#c9a227', cursor: 'pointer' }}
                                />
                                Lembrar-me por 30 dias
                            </label>

                            {/* Submit */}
                            <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 12, background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                                {loading ? (<><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1a0a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Verificando...</>) : '🔐 Entrar'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 10, padding: '10px 14px', color: '#2ecc71', fontSize: 12, textAlign: 'center' }}>
                                ✅ Credenciais verificadas — código enviado por email
                            </div>

                            {/* Code input */}
                            <div>
                                <label style={labelStyle}>Código de Verificação (6 dígitos)</label>
                                <input
                                    ref={codeRef}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    value={verifyCode}
                                    onChange={e => { const v = e.target.value.replace(/\D/g, ''); setVerifyCode(v); }}
                                    placeholder="000000"
                                    required
                                    autoComplete="one-time-code"
                                    style={{ ...inputStyle, textAlign: 'center', letterSpacing: 10, fontSize: 22, fontWeight: 700 }}
                                />
                                <p style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                                    Verifique sua caixa de entrada e spam
                                </p>
                            </div>

                            <button type="submit" disabled={loading || verifyCode.length !== 6} style={{ padding: '13px', borderRadius: 12, background: (loading || verifyCode.length !== 6) ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, border: 'none', cursor: (loading || verifyCode.length !== 6) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                {loading ? (<><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1a0a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Verificando...</>) : '🛡️ Confirmar Acesso'}
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button type="button" onClick={() => { setStep('credentials'); setVerifyCode(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                                    ← Voltar
                                </button>
                                <button type="button" onClick={resendCode} disabled={loading} style={{ background: 'none', border: 'none', color: '#c9a227', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', opacity: loading ? 0.5 : 1 }}>
                                    Reenviar código
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
                    Acesso protegido com verificação por email
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
