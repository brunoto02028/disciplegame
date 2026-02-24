'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
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
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.error || t('auth.err_credentials'));
                setLoading(false);
                return;
            }

            router.push('/dashboard');
        } catch (err) {
            setError(t('auth.err_server'));
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
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{t('auth.welcome_back')}</h1>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>{t('auth.welcome_subtitle')}</p>
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
                            <label htmlFor="email" style={labelStyle}>{t('auth.email')}</label>
                            <input id="email" type="email" required style={inputStyle} placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div>
                            <label htmlFor="password" style={labelStyle}>{t('auth.password')}</label>
                            <input id="password" type="password" required style={inputStyle} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
                                <input type="checkbox" />
                                {t('auth.remember')}
                            </label>
                            <Link href="/auth/forgot-password" style={{ fontSize: 13, color: '#c9a227', fontWeight: 600, textDecoration: 'none' }}>{t('auth.forgot')}</Link>
                        </div>

                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 10, background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {loading ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1a0a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{t('auth.logging_in')}</> : t('auth.login_btn')}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{t('auth.or')}</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    {/* Google Sign-In */}
                    <button onClick={async () => {
                        setError('');
                        setLoading(true);
                        try {
                            // Use Google Identity Services popup
                            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                            if (!clientId) {
                                setError('Google Login não configurado. Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
                                setLoading(false);
                                return;
                            }
                            // Load Google Identity Services
                            const script = document.createElement('script');
                            script.src = 'https://accounts.google.com/gsi/client';
                            script.onload = () => {
                                (window as any).google.accounts.id.initialize({
                                    client_id: clientId,
                                    callback: async (response: any) => {
                                        const res = await fetch('/api/auth/google', {
                                            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                                            body: JSON.stringify({ credential: response.credential, clientId }),
                                        });
                                        const data = await res.json();
                                        if (data.success) router.push('/dashboard');
                                        else { setError(data.error || 'Erro no login Google'); setLoading(false); }
                                    },
                                });
                                (window as any).google.accounts.id.prompt();
                            };
                            document.head.appendChild(script);
                        } catch { setError('Erro ao iniciar login Google'); setLoading(false); }
                    }} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                        {t('auth.google_login')}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
                        {t('auth.no_account')}{' '}
                        <Link href="/auth/register" style={{ color: '#c9a227', fontWeight: 600, textDecoration: 'none' }}>{t('auth.register_link')}</Link>
                    </p>
                </div>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        {t('auth.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
