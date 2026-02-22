'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (data.success) {
                router.push('/admin');
            } else {
                setError('Senha incorreta');
            }
        } catch {
            setError('Erro ao conectar');
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',system-ui,sans-serif" }}>
            <div style={{ width: '100%', maxWidth: 380, padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 32px rgba(201,162,39,0.4)' }}>
                        <svg width={28} height={28} viewBox="0 0 24 24" fill="none"><rect x="10" y="2" width="4" height="20" rx="1" fill="#fff" /><rect x="4" y="7" width="16" height="4" rx="1" fill="#fff" /></svg>
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Painel Admin</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>O Discipulo — Area Restrita</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(20px)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {error && (
                            <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 10, padding: '10px 14px', color: '#e74c3c', fontSize: 13 }}>
                                {error}
                            </div>
                        )}
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>SENHA DE ADMINISTRADOR</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoFocus
                                style={{ width: '100%', padding: '11px 14px', fontSize: 15, border: '1px solid rgba(201,162,39,0.3)', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 12, background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {loading ? (
                                <><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#1a0a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Entrando...</>
                            ) : 'Entrar no Admin'}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                        Senha padrão: <code style={{ color: 'rgba(255,255,255,0.4)' }}>admin2026</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
