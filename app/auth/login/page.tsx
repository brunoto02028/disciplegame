'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.error || 'Credenciais inválidas');
                setLoading(false);
                return;
            }

            // Success - redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            setError('Erro ao conectar com o servidor');
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 15, border: '1px solid rgba(201,162,39,0.3)', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '100%', maxWidth: 440 }}>

                <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,162,39,0.12) 0%,transparent 65%)', pointerEvents: 'none' }} />
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', boxShadow: '0 0 32px rgba(201,162,39,0.4)', marginBottom: 16 }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="20" rx="1" fill="#fff" /><rect x="4" y="7" width="16" height="4" rx="1" fill="#fff" /></svg>
                    </Link>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Bem-vindo de volta</h1>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>Entre para continuar sua jornada</p>
                </div>

                {/* Card */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 20, padding: '36px 32px', backdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {error && (
                            <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, padding: '12px 16px', color: '#e74c3c', fontSize: 14 }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" style={labelStyle}>E-mail</label>
                            <input id="email" type="email" required style={inputStyle} placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div>
                            <label htmlFor="password" style={labelStyle}>Senha</label>
                            <input id="password" type="password" required style={inputStyle} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
                                <input type="checkbox" />
                                Lembrar-me
                            </label>
                            <Link href="/auth/forgot-password" style={{ fontSize: 13, color: '#c9a227', fontWeight: 600, textDecoration: 'none' }}>Esqueceu a senha?</Link>
                        </div>

                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 10, background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {loading ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1a0a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Entrando...</> : 'Entrar'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
                        Não tem uma conta?{' '}
                        <Link href="/auth/register" style={{ color: '#c9a227', fontWeight: 600, textDecoration: 'none' }}>Criar conta gratuita</Link>
                    </p>
                </div>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Voltar para home
                    </Link>
                </div>
            </div>
        </div>
    );
}
