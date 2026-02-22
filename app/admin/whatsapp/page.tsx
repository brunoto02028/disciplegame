'use client';

import { useState } from 'react';

const goldBorder = '1px solid rgba(201,162,39,0.3)';
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 14 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 13, border: goldBorder, borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };

const SAMPLE_MESSAGES = [
    { id: '1', phone: '+5511999001234', name: 'Maria Silva', message: 'Parabens! Voce completou Jerusalem!', status: 'delivered', date: '2026-02-18 14:30' },
    { id: '2', phone: '+5511998005678', name: 'Joao Santos', message: 'Novo desafio semanal disponivel!', status: 'sent', date: '2026-02-18 10:00' },
    { id: '3', phone: '+5511997009012', name: 'Ana Costa', message: 'Bem-vindo ao O Discipulo!', status: 'read', date: '2026-02-17 09:15' },
];

export default function WhatsAppPage() {
    const [tab, setTab] = useState<'messages' | 'send' | 'settings'>('messages');
    const [messages] = useState(SAMPLE_MESSAGES);
    const [sendData, setSendData] = useState({ phone: '', message: '', segment: 'individual' });
    const [settings, setSettings] = useState({ provider: 'twilio', accountSid: '', authToken: '', phoneNumber: '', enabled: false });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState('');

    const handleSend = () => {
        if (!sendData.message) return;
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaved('Mensagem enviada!');
            setSendData({ phone: '', message: '', segment: 'individual' });
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

    const statusColor = (s: string) => s === 'delivered' ? '#27ae60' : s === 'read' ? '#c9a227' : s === 'sent' ? '#d4b84a' : '#e74c3c';
    const statusLabel = (s: string) => s === 'delivered' ? 'Entregue' : s === 'read' ? 'Lido' : s === 'sent' ? 'Enviado' : 'Erro';

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>WhatsApp</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Envie notificacoes e mensagens para usuarios via WhatsApp.</p>
            </div>

            {saved && <div style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', color: '#27ae60', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{saved}</div>}

            {/* Status banner */}
            <div style={{ ...glass, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: settings.enabled ? '#27ae60' : '#e74c3c', boxShadow: `0 0 8px ${settings.enabled ? '#27ae60' : '#e74c3c'}` }} />
                    <span style={{ fontSize: 13, color: settings.enabled ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>{settings.enabled ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    <span>Mensagens hoje: <strong style={{ color: '#fff' }}>12</strong></span>
                    <span>Entregues: <strong style={{ color: '#27ae60' }}>10</strong></span>
                    <span>Lidos: <strong style={{ color: '#c9a227' }}>7</strong></span>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {(['messages', 'send', 'settings'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 8, background: tab === t ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)', border: tab === t ? goldBorder : '1px solid rgba(255,255,255,0.08)', color: tab === t ? '#c9a227' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
                        {t === 'messages' ? '💬 Historico' : t === 'send' ? '📤 Enviar' : '⚙️ Config'}
                    </button>
                ))}
            </div>

            {/* Messages history */}
            {tab === 'messages' && (
                <div style={{ ...glass, overflow: 'hidden' }}>
                    {messages.map(m => (
                        <div key={m.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💬</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                    <p style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</p>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{m.phone}</span>
                                </div>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</p>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(m.status) }}>{statusLabel(m.status)}</span>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{m.date}</p>
                            </div>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Nenhuma mensagem enviada.</div>
                    )}
                </div>
            )}

            {/* Send tab */}
            {tab === 'send' && (
                <div style={{ ...glass, padding: 24, maxWidth: 600 }}>
                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Enviar Mensagem</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Tipo de Envio</label>
                            <select value={sendData.segment} onChange={e => setSendData({ ...sendData, segment: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="individual" style={{ background: '#1a0a4a' }}>Individual</option>
                                <option value="all" style={{ background: '#1a0a4a' }}>Todos os usuarios</option>
                                <option value="active" style={{ background: '#1a0a4a' }}>Usuarios ativos</option>
                                <option value="inactive" style={{ background: '#1a0a4a' }}>Usuarios inativos</option>
                                <option value="premium" style={{ background: '#1a0a4a' }}>Membros Premium</option>
                            </select>
                        </div>
                        {sendData.segment === 'individual' && (
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Telefone</label>
                                <input value={sendData.phone} onChange={e => setSendData({ ...sendData, phone: e.target.value })} placeholder="+5511999001234" style={inputStyle} />
                            </div>
                        )}
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Mensagem</label>
                            <textarea value={sendData.message} onChange={e => setSendData({ ...sendData, message: e.target.value })} rows={4} placeholder="Ola {name}! Novo desafio disponivel..." style={{ ...inputStyle, resize: 'vertical' }} />
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Variaveis: {'{name}'}, {'{points}'}, {'{rank}'}, {'{city}'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleSend} disabled={saving} style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                                {saving ? 'Enviando...' : '💬 Enviar WhatsApp'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings tab */}
            {tab === 'settings' && (
                <div style={{ ...glass, padding: 24, maxWidth: 600 }}>
                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Configuracoes WhatsApp</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Provedor</label>
                            <select value={settings.provider} onChange={e => setSettings({ ...settings, provider: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="twilio" style={{ background: '#1a0a4a' }}>Twilio (WhatsApp Business API)</option>
                                <option value="zapi" style={{ background: '#1a0a4a' }}>Z-API</option>
                                <option value="wapi" style={{ background: '#1a0a4a' }}>WAPI.js</option>
                                <option value="meta" style={{ background: '#1a0a4a' }}>Meta Cloud API (Oficial)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Account SID / Instance ID</label>
                            <input type="password" value={settings.accountSid} onChange={e => setSettings({ ...settings, accountSid: e.target.value })} placeholder="ACxxxxxxx" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Auth Token / API Key</label>
                            <input type="password" value={settings.authToken} onChange={e => setSettings({ ...settings, authToken: e.target.value })} placeholder="xxxxxxxxxx" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, textTransform: 'uppercase' }}>Numero WhatsApp</label>
                            <input value={settings.phoneNumber} onChange={e => setSettings({ ...settings, phoneNumber: e.target.value })} placeholder="+5511999000000" style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <button onClick={() => setSettings({ ...settings, enabled: !settings.enabled })} style={{ width: 44, height: 24, borderRadius: 12, background: settings.enabled ? '#25D366' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings.enabled ? 23 : 3, transition: 'left 0.2s' }} />
                            </button>
                            <span style={{ fontSize: 13, fontWeight: 600, color: settings.enabled ? '#25D366' : 'rgba(255,255,255,0.4)' }}>{settings.enabled ? 'WhatsApp Ativado' : 'WhatsApp Desativado'}</span>
                        </div>
                        <button onClick={handleSaveSettings} style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
                            Salvar Configuracoes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
