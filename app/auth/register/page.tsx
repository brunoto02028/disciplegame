'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        country: '',
        church: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    country: formData.country || null,
                    church: formData.church || null,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.error || 'Erro ao criar conta');
                setLoading(false);
                return;
            }

            // Success - automatically log in
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (loginResponse.ok) {
                router.push('/dashboard');
            } else {
                router.push('/auth/login?registered=true');
            }
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

                <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,162,39,0.12) 0%,transparent 65%)', pointerEvents: 'none' }} />
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', boxShadow: '0 0 32px rgba(201,162,39,0.4)', marginBottom: 16 }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="20" rx="1" fill="#fff" /><rect x="4" y="7" width="16" height="4" rx="1" fill="#fff" /></svg>
                    </Link>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Comece sua Jornada</h1>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>Crie sua conta gratuita</p>
                </div>

                {/* Card */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 20, padding: '36px 32px', backdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {error && (
                            <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, padding: '12px 16px', color: '#e74c3c', fontSize: 14 }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" style={labelStyle}>Nome Completo *</label>
                            <input id="name" name="name" type="text" required style={inputStyle} placeholder="João Silva" value={formData.name} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="email" style={labelStyle}>E-mail *</label>
                            <input id="email" name="email" type="email" required style={inputStyle} placeholder="seu@email.com" value={formData.email} onChange={handleChange} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label htmlFor="password" style={labelStyle}>Senha *</label>
                                <input id="password" name="password" type="password" required style={inputStyle} placeholder="Mín. 6 caracteres" value={formData.password} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" style={labelStyle}>Confirmar *</label>
                                <input id="confirmPassword" name="confirmPassword" type="password" required style={inputStyle} placeholder="Repita a senha" value={formData.confirmPassword} onChange={handleChange} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label htmlFor="country" style={labelStyle}>País</label>
                                <input id="country" name="country" type="text" style={inputStyle} placeholder="Brasil" value={formData.country} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="church" style={labelStyle}>Igreja (opcional)</label>
                                <input id="church" name="church" type="text" style={inputStyle} placeholder="Sua igreja" value={formData.church} onChange={handleChange} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 10, background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                            {loading ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1a0a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Criando conta...</> : 'Criar Conta'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
                        Já tem uma conta?{' '}
                        <Link href="/auth/login" style={{ color: '#c9a227', fontWeight: 600, textDecoration: 'none' }}>Fazer login</Link>
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
