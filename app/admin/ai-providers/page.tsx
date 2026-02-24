'use client';

import { useState, useEffect } from 'react';

interface Provider {
    id: string;
    name: string;
    type: string;
    apiKey: string;
    envVar: string;
    enabled: boolean;
    priority: number;
    status: 'connected' | 'disconnected' | 'error';
    lastChecked?: string;
    lastError?: string;
    models: string[];
    defaultModel?: string;
    capabilities: string[];
    hasKey: boolean;
}

interface Config {
    providers: Provider[];
    defaultImageProvider: string;
    defaultTextProvider: string;
}

const STATUS_ICONS: Record<string, string> = {
    connected: '✅',
    disconnected: '⚪',
    error: '❌',
};

const STATUS_COLORS: Record<string, string> = {
    connected: '#2ecc71',
    disconnected: 'rgba(255,255,255,0.3)',
    error: '#e74c3c',
};

const PROVIDER_ICONS: Record<string, string> = {
    gemini: '🔮',
    abacus: '🧮',
    openai: '🤖',
    stability: '🎨',
};

export default function AIProvidersPage() {
    const [config, setConfig] = useState<Config | null>(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [testing, setTesting] = useState<string | null>(null);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [newKey, setNewKey] = useState('');

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/ai-providers');
            const data = await res.json();
            if (data.success) setConfig(data.data);
        } catch { setMsg('Erro ao carregar'); }
        setLoading(false);
    };

    useEffect(() => { fetchConfig(); }, []);

    const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 4000); };

    const testConnection = async (id: string) => {
        setTesting(id);
        try {
            const res = await fetch('/api/admin/ai-providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'test', providerId: id }),
            });
            const data = await res.json();
            if (data.success) {
                showMsg(data.data.ok ? `✅ ${data.data.message}` : `❌ ${data.data.message}`);
                fetchConfig();
            }
        } catch { showMsg('Erro de conexão'); }
        setTesting(null);
    };

    const toggleProvider = async (id: string, enabled: boolean) => {
        try {
            await fetch('/api/admin/ai-providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle', providerId: id, enabled }),
            });
            fetchConfig();
        } catch { showMsg('Erro'); }
    };

    const saveApiKey = async (id: string, envVar: string) => {
        if (!newKey.trim()) return;
        try {
            const res = await fetch('/api/admin/ai-providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_provider', providerId: id, updates: { apiKey: newKey, envVar } }),
            });
            const data = await res.json();
            if (data.success) {
                showMsg('✅ API Key salva!');
                setEditingKey(null);
                setNewKey('');
                fetchConfig();
            } else {
                showMsg(`❌ ${data.error}`);
            }
        } catch { showMsg('Erro ao salvar'); }
    };

    const setDefault = async (type: 'image' | 'text', providerId: string) => {
        try {
            await fetch('/api/admin/ai-providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'set_defaults',
                    defaultImageProvider: type === 'image' ? providerId : config?.defaultImageProvider,
                    defaultTextProvider: type === 'text' ? providerId : config?.defaultTextProvider,
                }),
            });
            showMsg('✅ Padrão atualizado!');
            fetchConfig();
        } catch { showMsg('Erro'); }
    };

    const setModel = async (id: string, model: string) => {
        try {
            await fetch('/api/admin/ai-providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_provider', providerId: id, updates: { defaultModel: model } }),
            });
            showMsg('✅ Modelo atualizado!');
            fetchConfig();
        } catch { showMsg('Erro'); }
    };

    if (loading) return <div style={{ padding: 40, color: '#fff', textAlign: 'center' }}>Carregando...</div>;

    return (
        <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>🤖 Provedores de IA</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Gerencie as IAs conectadas ao sistema</p>
                </div>
                {msg && (
                    <div style={{ padding: '8px 16px', borderRadius: 8, background: msg.startsWith('✅') ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)', color: msg.startsWith('✅') ? '#2ecc71' : '#e74c3c', fontSize: 13, fontWeight: 600 }}>
                        {msg}
                    </div>
                )}
            </div>

            {/* Provider Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {config?.providers.map(p => (
                    <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${p.enabled ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 16, padding: '24px 28px', transition: 'all 0.3s' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                    {PROVIDER_ICONS[p.id] || '🔌'}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{p.name}</h3>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status], fontWeight: 600 }}>
                                            {STATUS_ICONS[p.status]} {p.status === 'connected' ? 'Conectado' : p.status === 'error' ? 'Erro' : 'Desconectado'}
                                        </span>
                                        {config.defaultImageProvider === p.id && (
                                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(201,162,39,0.15)', color: '#c9a227', fontWeight: 700 }}>📷 PADRÃO IMAGEM</span>
                                        )}
                                        {config.defaultTextProvider === p.id && (
                                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(46,204,113,0.15)', color: '#2ecc71', fontWeight: 700 }}>📝 PADRÃO TEXTO</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                                        {p.capabilities.map(c => c === 'image_generation' ? '🖼️ Imagem' : c === 'text_generation' ? '📝 Texto' : '💬 Chat').join(' · ')}
                                        {p.lastChecked && ` · Último teste: ${new Date(p.lastChecked).toLocaleString('pt-BR')}`}
                                    </p>
                                </div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{p.enabled ? 'Ativo' : 'Inativo'}</span>
                                <div onClick={() => toggleProvider(p.id, !p.enabled)} style={{ width: 44, height: 24, borderRadius: 12, background: p.enabled ? '#c9a227' : 'rgba(255,255,255,0.15)', padding: 2, cursor: 'pointer', transition: 'all 0.3s' }}>
                                    <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', transform: p.enabled ? 'translateX(20px)' : 'translateX(0)', transition: 'all 0.3s' }} />
                                </div>
                            </label>
                        </div>

                        {/* API Key */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>API KEY ({p.envVar})</label>
                                {editingKey === p.id ? (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input type="password" value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Cole a API key aqui..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,162,39,0.3)', color: '#fff', fontSize: 13, outline: 'none' }} />
                                        <button onClick={() => saveApiKey(p.id, p.envVar)} style={{ padding: '8px 16px', borderRadius: 8, background: '#c9a227', color: '#1a0a4a', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Salvar</button>
                                        <button onClick={() => { setEditingKey(null); setNewKey(''); }} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, border: 'none', cursor: 'pointer' }}>✕</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <code style={{ fontSize: 13, color: p.hasKey ? '#2ecc71' : '#e74c3c', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 6, flex: 1 }}>
                                            {p.hasKey ? p.apiKey : '⚠️ Não configurada'}
                                        </code>
                                        <button onClick={() => { setEditingKey(p.id); setNewKey(''); }} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                                            ✏️ {p.hasKey ? 'Alterar' : 'Configurar'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Model selection */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 6, display: 'block' }}>MODELO PADRÃO</label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {p.models.map(m => (
                                        <button key={m} onClick={() => setModel(p.id, m)} style={{ padding: '5px 12px', borderRadius: 8, background: p.defaultModel === m ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${p.defaultModel === m ? 'rgba(201,162,39,0.5)' : 'rgba(255,255,255,0.1)'}`, color: p.defaultModel === m ? '#c9a227' : 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button onClick={() => testConnection(p.id)} disabled={testing === p.id || !p.hasKey} style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', color: '#2ecc71', fontWeight: 600, fontSize: 12, cursor: testing === p.id || !p.hasKey ? 'not-allowed' : 'pointer', opacity: !p.hasKey ? 0.4 : 1 }}>
                                {testing === p.id ? '⏳ Testando...' : '🔗 Testar Conexão'}
                            </button>
                            {p.capabilities.includes('image_generation') && config.defaultImageProvider !== p.id && (
                                <button onClick={() => setDefault('image', p.id)} style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                                    📷 Usar como Padrão (Imagem)
                                </button>
                            )}
                            {p.capabilities.includes('text_generation') && config.defaultTextProvider !== p.id && (
                                <button onClick={() => setDefault('text', p.id)} style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', color: '#2ecc71', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                                    📝 Usar como Padrão (Texto)
                                </button>
                            )}
                        </div>

                        {/* Error display */}
                        {p.lastError && (
                            <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', fontSize: 12, color: '#e74c3c' }}>
                                ⚠️ {p.lastError}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Info card */}
            <div style={{ marginTop: 32, padding: '20px 24px', borderRadius: 14, background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.2)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#c9a227', marginBottom: 10 }}>💡 Como funciona</h3>
                <ul style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 2, paddingLeft: 20 }}>
                    <li>Configure a <strong style={{ color: '#fff' }}>API Key</strong> de cada provedor para ativá-lo</li>
                    <li>Use <strong style={{ color: '#fff' }}>Testar Conexão</strong> para verificar se a key está funcionando</li>
                    <li>Defina qual provedor é <strong style={{ color: '#c9a227' }}>Padrão para Imagens</strong> e <strong style={{ color: '#2ecc71' }}>Padrão para Texto</strong></li>
                    <li>Se o provedor padrão falhar, o sistema tenta automaticamente o próximo (<strong style={{ color: '#fff' }}>fallback</strong>)</li>
                    <li>Ative/desative provedores com o <strong style={{ color: '#fff' }}>toggle</strong> no canto</li>
                </ul>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    div[style*="padding: 24px 32px"] { padding: 16px !important; }
                }
            `}</style>
        </div>
    );
}
