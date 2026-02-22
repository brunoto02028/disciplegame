'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [step, setStep] = useState<'password' | 'totp'>('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [remaining, setRemaining] = useState<number | null>(null);
    const totpRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (step === 'totp') totpRef.current?.focus();
    }, [step]);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, step: 'password' }),
            });
            const data = await res.json();
            if (res.status === 429) {
                setError(data.error);
            } else if (data.success && data.step === 'totp') {
                setStep('totp');
                setError('');
            } else if (data.success) {
                router.push('/admin');
            } else {
                setError(data.error || 'Credenciais inválidas');
                if (data.remaining !== undefined) setRemaining(data.remaining);
            }
        } catch {
            setError('Erro de conexão');
        }
        setLoading(false);
    };

    const handleTotpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, totp_code: totpCode }),
            });
            const data = await res.json();
            if (res.status === 429) {
                setError(data.error);
            } else if (data.success) {
                router.push('/admin');
            } else {
                setError(data.error || 'Código inválido');
                setTotpCode('');
                if (data.remaining !== undefined) setRemaining(data.remaining);
            }
        } catch {
            setError('Erro de conexão');
        }
        setLoading(false);
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid rgba(201,162,39,0.3)', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', textAlign: step === 'totp' ? 'center' : 'left', letterSpacing: step === 'totp' ? 8 : 0 };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',system-ui,sans-serif" }}>
            <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 32px rgba(201,162,39,0.4)' }}>
                        {step === 'password' ? (
                            <svg width={28} height={28} viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" fill="#fff"/><path d="M8 11V7a4 4 0 118 0v4" stroke="#fff" strokeWidth="2" fill="none"/></svg>
                        ) : (
                            <svg width={28} height={28} viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="16" rx="2" fill="#fff"/><circle cx="12" cy="14" r="2" fill="#c9a227"/><rect x="11" y="8" width="2" height="4" rx="1" fill="#c9a227"/></svg>
                        )}
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                        {step === 'password' ? 'Acesso Admin' : 'Verificação 2FA'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                        {step === 'password' ? 'O Discípulo — Área Restrita' : 'Insira o código do seu autenticador'}
                    </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(20px)' }}>
                    {error && (
                        <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 10, padding: '10px 14px', color: '#e74c3c', fontSize: 13, marginBottom: 16 }}>
                            {error}
                            {remaining !== null && remaining <= 2 && (
                                <p style={{ marginTop: 4, fontSize: 11, opacity: 0.8 }}>⚠️ {remaining} tentativa(s) restante(s) antes do bloqueio.</p>
                            )}
                        </div>
                    )}

                    {step === 'password' ? (
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Senha de Administrador</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoFocus style={inputStyle} />
                            </div>
                            <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 12, background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                {loading ? (<><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1a0a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Verificando...</>) : '🔐 Entrar'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleTotpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: 10, padding: '10px 14px', color: '#2ecc71', fontSize: 12, textAlign: 'center' }}>
                                ✅ Senha verificada
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Código 2FA (6 dígitos)</label>
                                <input
                                    ref={totpRef}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    value={totpCode}
                                    onChange={e => { const v = e.target.value.replace(/\D/g, ''); setTotpCode(v); }}
                                    placeholder="000000"
                                    required
                                    style={inputStyle}
                                    autoComplete="one-time-code"
                                />
                                <p style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Abra o Google Authenticator</p>
                            </div>
                            <button type="submit" disabled={loading || totpCode.length !== 6} style={{ padding: '13px', borderRadius: 12, background: (loading || totpCode.length !== 6) ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, border: 'none', cursor: (loading || totpCode.length !== 6) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                {loading ? (<><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1a0a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Verificando...</>) : '🛡️ Confirmar Acesso'}
                            </button>
                            <button type="button" onClick={() => { setStep('password'); setPassword(''); setTotpCode(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                                ← Voltar
                            </button>
                        </form>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
                    Acesso protegido com autenticação em dois fatores
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
