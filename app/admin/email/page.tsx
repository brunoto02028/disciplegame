'use client';

import { useState } from 'react';

const goldBorder = '1px solid rgba(201,162,39,0.3)';
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 14 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 13, border: goldBorder, borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };

const SAMPLE_CAMPAIGNS = [
    { id: '1', name: 'Boas-vindas', status: 'active', sent: 142, opened: 89, clicked: 34, date: '2026-02-01' },
    { id: '2', name: 'Desafio Semanal #12', status: 'sent', sent: 89, opened: 52, clicked: 21, date: '2026-02-15' },
    { id: '3', name: 'Novo Circuito disponível', status: 'draft', sent: 0, opened: 0, clicked: 0, date: '2026-02-18' },
];

export default function EmailPage() {
    const [tab, setTab] = useState<'campaigns' | 'compose' | 'settings'>('campaigns');
    const [campaigns] = useState(SAMPLE_CAMPAIGNS);
    const [composeData, setComposeData] = useState({ subject: '', body: '', segment: 'all' });
    const [settings, setSettings] = useState({ provider: 'resend', apiKey: '', fromEmail: 'noreply@odiscipulo.app', fromName: 'O Discípulo' });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState('');

    const handleSend = () => {
        if (!composeData.subject || !composeData.body) return;
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaved('Email agendado para envio!');
            setComposeData({ subject: '', body: '', segment: 'all' });
            setTimeout(() => setSaved(''), 3000);
        }, 500);
    };

    const handleSaveSettings = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaved('Configuracoes salvas!');
            setTimeout(() => setSaved(''), 3000);
        }, 400);
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Email Marketing</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Crie campanhas, envie emails e acompanhe metricas.</p>
            </div>

            {saved && <div style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', color: '#27ae60', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{saved}</div>}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {(['campaigns', 'compose', 'settings'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 8, background: tab === t ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)', border: tab === t ? goldBorder : '1px solid rgba(255,255,255,0.08)', color: tab === t ? '#c9a227' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
                        {t === 'campaigns' ? '📊 Campanhas' : t === 'compose' ? '✏️ Compor' : '⚙️ Config'}
                    </button>
                ))}
            </div>

            {/* Campaigns tab */}
            {tab === 'campaigns' && (
                <div style={{ ...glass, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px 100px', gap: 8, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' as const }} className="admin-email-header">
                        <span>Campanha</span><span>Status</span><span style={{ textAlign: 'right' }}>Enviados</span><span style={{ textAlign: 'right' }}>Abertos</span><span style={{ textAlign: 'right' }}>Cliques</span><span style={{ textAlign: 'right' }}>Data</span>
                    </div>
                    {campaigns.map(c => (
                        <div key={c.id} style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px 100px', gap: 8, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="admin-email-row">
                            <p style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</p>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: c.status === 'active' ? 'rgba(39,174,96,0.15)' : c.status === 'sent' ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.05)', color: c.status === 'active' ? '#27ae60' : c.status === 'sent' ? '#c9a227' : 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                                {c.status === 'active' ? 'Ativo' : c.status === 'sent' ? 'Enviado' : 'Rascunho'}
                            </span>
                            <p style={{ textAlign: 'right', fontSize: 13, color: '#fff' }}>{c.sent}</p>
                            <p style={{ textAlign: 'right', fontSize: 13, color: '#c9a227' }}>{c.opened} <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{c.sent > 0 ? `(${Math.round(c.opened / c.sent * 100)}%)` : ''}</span></p>
                            <p style={{ textAlign: 'right', fontSize: 13, color: '#27ae60' }}>{c.clicked}</p>
                            <p style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.date}</p>
                        </div>
                    ))}
                    {campaigns.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Nenhuma campanha ainda.</div>
                    )}
                </div>
            )}

            {/* Compose tab */}
            {tab === 'compose' && (
                <div style={{ ...glass, padding: 24, maxWidth: 700 }}>
                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nova Campanha</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Segmento</label>
                            <select value={composeData.segment} onChange={e => setComposeData({ ...composeData, segment: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="all" style={{ background: '#1a0a4a' }}>Todos os usuarios</option>
                                <option value="active" style={{ background: '#1a0a4a' }}>Usuarios ativos (30 dias)</option>
                                <option value="inactive" style={{ background: '#1a0a4a' }}>Usuarios inativos</option>
                                <option value="premium" style={{ background: '#1a0a4a' }}>Membros Premium</option>
                                <option value="new" style={{ background: '#1a0a4a' }}>Novos usuarios (7 dias)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Assunto</label>
                            <input value={composeData.subject} onChange={e => setComposeData({ ...composeData, subject: e.target.value })} placeholder="Ex: Novo desafio semanal disponível!" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Corpo do Email</label>
                            <textarea value={composeData.body} onChange={e => setComposeData({ ...composeData, body: e.target.value })} rows={8} placeholder="Escreva o conteúdo do email... Use {name} para nome do usuário, {points} para pontos." style={{ ...inputStyle, resize: 'vertical' }} />
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Variaveis: {'{name}'}, {'{email}'}, {'{points}'}, {'{rank}'}, {'{city}'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button onClick={handleSend} disabled={saving} style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                                {saving ? 'Enviando...' : '📧 Enviar Agora'}
                            </button>
                            <button style={{ padding: '10px 24px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: goldBorder, color: '#c9a227', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                                💾 Salvar Rascunho
                            </button>
                            <button style={{ padding: '10px 24px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                                👁️ Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings tab */}
            {tab === 'settings' && (
                <div style={{ ...glass, padding: 24, maxWidth: 600 }}>
                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Configuracoes de Email</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Provedor</label>
                            <select value={settings.provider} onChange={e => setSettings({ ...settings, provider: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="resend" style={{ background: '#1a0a4a' }}>Resend</option>
                                <option value="sendgrid" style={{ background: '#1a0a4a' }}>SendGrid</option>
                                <option value="ses" style={{ background: '#1a0a4a' }}>Amazon SES</option>
                                <option value="smtp" style={{ background: '#1a0a4a' }}>SMTP Custom</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>API Key</label>
                            <input type="password" value={settings.apiKey} onChange={e => setSettings({ ...settings, apiKey: e.target.value })} placeholder="re_xxxxxxxxxxxxx" style={inputStyle} />
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Nunca compartilhe sua API key. Armazene em .env.local</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Email Remetente</label>
                                <input value={settings.fromEmail} onChange={e => setSettings({ ...settings, fromEmail: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Nome Remetente</label>
                                <input value={settings.fromName} onChange={e => setSettings({ ...settings, fromName: e.target.value })} style={inputStyle} />
                            </div>
                        </div>
                        <button onClick={handleSaveSettings} style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
                            Salvar Configuracoes
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .admin-email-header, .admin-email-row { grid-template-columns: 1fr 70px !important; }
                    .admin-email-header span:nth-child(n+3), .admin-email-row p:nth-child(n+3), .admin-email-row span:nth-child(n+3) { display: none; }
                }
            `}</style>
        </div>
    );
}
