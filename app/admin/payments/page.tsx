'use client';

import { useState } from 'react';

const goldBorder = '1px solid rgba(201,162,39,0.3)';
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 14 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 13, border: goldBorder, borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };

const SAMPLE_TRANSACTIONS = [
    { id: 'pi_1', user: 'Maria Silva', email: 'maria@email.com', amount: 19.90, plan: 'Premium', status: 'succeeded', date: '2026-02-18', stripeId: 'pi_3Abc123' },
    { id: 'pi_2', user: 'Joao Santos', email: 'joao@email.com', amount: 149.90, plan: 'Premium Anual', status: 'succeeded', date: '2026-02-17', stripeId: 'pi_3Def456' },
    { id: 'pi_3', user: 'Ana Costa', email: 'ana@email.com', amount: 19.90, plan: 'Premium', status: 'failed', date: '2026-02-16', stripeId: 'pi_3Ghi789' },
    { id: 'pi_4', user: 'Pedro Lima', email: 'pedro@email.com', amount: 19.90, plan: 'Premium', status: 'refunded', date: '2026-02-15', stripeId: 'pi_3Jkl012' },
    { id: 'pi_5', user: 'Lucas Rocha', email: 'lucas@email.com', amount: 49.90, plan: 'Igreja / Grupo', status: 'succeeded', date: '2026-02-14', stripeId: 'pi_3Mno345' },
];

export default function PaymentsPage() {
    const [tab, setTab] = useState<'transactions' | 'settings'>('transactions');
    const [transactions] = useState(SAMPLE_TRANSACTIONS);
    const [settings, setSettings] = useState({ publishableKey: '', secretKey: '', webhookSecret: '', testMode: true });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState('');

    const totalRevenue = transactions.filter(t => t.status === 'succeeded').reduce((s, t) => s + t.amount, 0);
    const totalRefunded = transactions.filter(t => t.status === 'refunded').reduce((s, t) => s + t.amount, 0);

    const handleSaveSettings = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaved('Configuracoes Stripe salvas!');
            setTimeout(() => setSaved(''), 3000);
        }, 400);
    };

    const statusStyle = (s: string): React.CSSProperties => ({
        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, textAlign: 'center',
        background: s === 'succeeded' ? 'rgba(39,174,96,0.15)' : s === 'failed' ? 'rgba(231,76,60,0.15)' : 'rgba(201,162,39,0.15)',
        color: s === 'succeeded' ? '#27ae60' : s === 'failed' ? '#e74c3c' : '#c9a227',
    });

    const statusLabel = (s: string) => s === 'succeeded' ? 'Aprovado' : s === 'failed' ? 'Falhou' : 'Reembolso';

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Pagamentos</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Visualize transacoes, configure Stripe e gerencie reembolsos.</p>
            </div>

            {saved && <div style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', color: '#27ae60', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{saved}</div>}

            {/* Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'RECEITA TOTAL', value: `R$ ${totalRevenue.toFixed(2)}`, icon: '💰', color: '#27ae60' },
                    { label: 'TRANSACOES', value: String(transactions.length), icon: '📊', color: '#c9a227' },
                    { label: 'REEMBOLSOS', value: `R$ ${totalRefunded.toFixed(2)}`, icon: '↩️', color: '#c9a227' },
                    { label: 'MODO', value: settings.testMode ? 'Teste' : 'Producao', icon: settings.testMode ? '🧪' : '🟢', color: settings.testMode ? '#c9a227' : '#27ae60' },
                ].map(s => (
                    <div key={s.label} style={{ ...glass, padding: '16px 18px' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: s.color, marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 22, fontWeight: 800 }}>{s.value}</p>
                            <span style={{ fontSize: 20, opacity: 0.5 }}>{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {(['transactions', 'settings'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 8, background: tab === t ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)', border: tab === t ? goldBorder : '1px solid rgba(255,255,255,0.08)', color: tab === t ? '#c9a227' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
                        {t === 'transactions' ? '📋 Transacoes' : '⚙️ Stripe Config'}
                    </button>
                ))}
            </div>

            {/* Transactions */}
            {tab === 'transactions' && (
                <div style={{ ...glass, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 120px 90px 90px 80px 110px', gap: 8, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' as const }} className="admin-pay-header">
                        <span>Usuario</span><span>Plano</span><span style={{ textAlign: 'right' }}>Valor</span><span>Status</span><span>Data</span><span style={{ fontSize: 9 }}>Stripe ID</span>
                    </div>
                    {transactions.map(t => (
                        <div key={t.id} style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 120px 90px 90px 80px 110px', gap: 8, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="admin-pay-row">
                            <div>
                                <p style={{ fontWeight: 600, fontSize: 13 }}>{t.user}</p>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{t.email}</p>
                            </div>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{t.plan}</p>
                            <p style={{ textAlign: 'right', fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 14, color: '#fff' }}>R$ {t.amount.toFixed(2)}</p>
                            <span style={statusStyle(t.status)}>{statusLabel(t.status)}</span>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{t.date}</p>
                            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.stripeId}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Settings */}
            {tab === 'settings' && (
                <div style={{ ...glass, padding: 24, maxWidth: 600 }}>
                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Configuracoes Stripe</h2>

                    {/* Test mode toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 10, background: settings.testMode ? 'rgba(201,162,39,0.08)' : 'rgba(39,174,96,0.08)', border: settings.testMode ? goldBorder : '1px solid rgba(39,174,96,0.3)', marginBottom: 20 }}>
                        <button onClick={() => setSettings({ ...settings, testMode: !settings.testMode })} style={{ width: 44, height: 24, borderRadius: 12, background: settings.testMode ? '#c9a227' : '#27ae60', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings.testMode ? 3 : 23, transition: 'left 0.2s' }} />
                        </button>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: settings.testMode ? '#c9a227' : '#27ae60' }}>{settings.testMode ? '🧪 Modo Teste' : '🟢 Modo Producao'}</p>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{settings.testMode ? 'Usando chaves de teste do Stripe' : 'ATENCAO: Transacoes reais!'}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Publishable Key</label>
                            <input value={settings.publishableKey} onChange={e => setSettings({ ...settings, publishableKey: e.target.value })} placeholder={settings.testMode ? 'pk_test_xxxxx' : 'pk_live_xxxxx'} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Secret Key</label>
                            <input type="password" value={settings.secretKey} onChange={e => setSettings({ ...settings, secretKey: e.target.value })} placeholder={settings.testMode ? 'sk_test_xxxxx' : 'sk_live_xxxxx'} style={inputStyle} />
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>⚠️ Armazene em .env.local como STRIPE_SECRET_KEY</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Webhook Secret</label>
                            <input type="password" value={settings.webhookSecret} onChange={e => setSettings({ ...settings, webhookSecret: e.target.value })} placeholder="whsec_xxxxx" style={inputStyle} />
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Endpoint: <code style={{ color: 'rgba(255,255,255,0.5)' }}>/api/webhooks/stripe</code></p>
                        </div>
                        <button onClick={handleSaveSettings} style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
                            Salvar Configuracoes
                        </button>
                    </div>

                    {/* Integration checklist */}
                    <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Checklist de Integracao</p>
                        {[
                            { label: 'Criar conta no Stripe', done: false },
                            { label: 'Configurar chaves de API', done: !!settings.publishableKey },
                            { label: 'Criar produtos e precos no Stripe', done: false },
                            { label: 'Configurar webhook endpoint', done: !!settings.webhookSecret },
                            { label: 'Testar checkout com cartao de teste', done: false },
                            { label: 'Ativar modo producao', done: !settings.testMode },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                                <div style={{ width: 16, height: 16, borderRadius: 4, background: item.done ? 'rgba(39,174,96,0.2)' : 'rgba(255,255,255,0.05)', border: item.done ? '1px solid rgba(39,174,96,0.4)' : '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#27ae60' }}>
                                    {item.done ? '✓' : ''}
                                </div>
                                <span style={{ fontSize: 12, color: item.done ? '#27ae60' : 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .admin-pay-header, .admin-pay-row { grid-template-columns: 1fr 80px 80px !important; }
                    .admin-pay-header span:nth-child(n+4), .admin-pay-row > *:nth-child(n+4) { display: none; }
                }
            `}</style>
        </div>
    );
}
