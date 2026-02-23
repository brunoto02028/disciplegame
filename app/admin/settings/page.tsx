'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const TABS = [
    { id: 'hero', label: 'Hero', icon: '🏠' },
    { id: 'about', label: 'Sobre o Jogo', icon: '📖' },
    { id: 'cities_section', label: 'Seção Cidades', icon: '🏛️' },
    { id: 'map_section', label: 'Mapa', icon: '🗺️' },
    { id: 'how_it_works', label: 'Como Funciona', icon: '⚙️' },
    { id: 'testimonials', label: 'Depoimentos', icon: '💬' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
    { id: 'cta_section', label: 'CTA Final', icon: '🎯' },
    { id: 'footer', label: 'Footer', icon: '📋' },
];

interface ChatMsg { role: 'user' | 'assistant'; content: string; images?: any[] }

const btnGold: React.CSSProperties = { padding: '6px 12px', borderRadius: 6, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontSize: 11, fontWeight: 600, cursor: 'pointer' };
const btnRed: React.CSSProperties = { padding: '6px 10px', borderRadius: 6, background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#e74c3c', fontSize: 11, cursor: 'pointer' };
const btnAI: React.CSSProperties = { padding: '6px 14px', borderRadius: 6, background: 'linear-gradient(135deg,rgba(139,69,255,0.15),rgba(201,162,39,0.15))', border: '1px solid rgba(139,69,255,0.35)', color: '#b388ff', fontSize: 11, fontWeight: 600, cursor: 'pointer' };
const btnGreen: React.CSSProperties = { padding: '6px 12px', borderRadius: 6, background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', color: '#2ecc71', fontSize: 11, fontWeight: 600, cursor: 'pointer' };

export default function AdminSettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hero');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [msg, setMsg] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTarget, setUploadTarget] = useState('');

    // ── Chat AI states ──
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<Record<string, ChatMsg[]>>({});
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatApplying, setChatApplying] = useState(false);
    const [chatImageResults, setChatImageResults] = useState<any[]>([]);
    const [chatImageTarget, setChatImageTarget] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const currentChat = chatMessages[activeTab] || [];

    const fetchSettings = useCallback(async () => {
        const res = await fetch('/api/admin/settings');
        if (res.status === 401) { router.push('/admin/login'); return; }
        const data = await res.json();
        if (data.success) setSettings(data.data);
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);
    useEffect(() => {
        const el = chatEndRef.current?.parentElement;
        if (el) el.scrollTop = el.scrollHeight;
    }, [currentChat, chatImageResults]);

    const handleSave = async (section: string) => {
        setSaving(true); setSaveSuccess(false);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, data: settings[section] }),
            });
            const data = await res.json();
            if (data.success) {
                // Re-fetch to confirm persistence
                const verify = await fetch('/api/admin/settings');
                const verifyData = await verify.json();
                if (verifyData.success) {
                    setSettings(verifyData.data);
                    setSaveSuccess(true);
                    setMsg('✅ Salvo com sucesso! Dados confirmados no servidor.');
                    setTimeout(() => setSaveSuccess(false), 3000);
                } else {
                    setMsg('⚠️ Salvou mas não confirmou. Recarregue a página.');
                }
            } else { setMsg('Erro: ' + data.error); }
        } catch { setMsg('Erro: Falha de conexão ao salvar.'); }
        setSaving(false); setTimeout(() => setMsg(''), 4000);
    };

    const updateField = (section: string, field: string, value: any) => {
        setSettings(s => ({ ...s, [section]: { ...s[section], [field]: value } }));
    };

    const updateNestedField = (section: string, field: string, index: number, key: string, value: string) => {
        setSettings(s => {
            const arr = [...(s[section]?.[field] || [])];
            arr[index] = { ...arr[index], [key]: value };
            return { ...s, [section]: { ...s[section], [field]: arr } };
        });
    };

    const addArrayItem = (section: string, field: string, template: any) => {
        setSettings(s => {
            const arr = [...(s[section]?.[field] || []), template];
            return { ...s, [section]: { ...s[section], [field]: arr } };
        });
    };

    const removeArrayItem = (section: string, field: string, index: number) => {
        setSettings(s => {
            const arr = [...(s[section]?.[field] || [])];
            arr.splice(index, 1);
            return { ...s, [section]: { ...s[section], [field]: arr } };
        });
    };

    // ── Chat Functions ──
    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const userMsg: ChatMsg = { role: 'user', content: chatInput.trim() };
        const msgs = [...currentChat, userMsg];
        setChatMessages(c => ({ ...c, [activeTab]: msgs }));
        setChatInput('');
        setChatLoading(true);
        setChatImageResults([]);
        try {
            const res = await fetch('/api/admin/ai/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: msgs.map(m => ({ role: m.role, content: m.content })), section: activeTab, mode: 'chat', currentData: settings[activeTab] }),
            });
            const data = await res.json();
            if (data.success) {
                const aiMsg: ChatMsg = { role: 'assistant', content: data.data.message };
                setChatMessages(c => ({ ...c, [activeTab]: [...msgs, aiMsg] }));
            } else {
                setChatMessages(c => ({ ...c, [activeTab]: [...msgs, { role: 'assistant', content: '❌ ' + (data.error || 'Erro na IA') }] }));
            }
        } catch {
            setChatMessages(c => ({ ...c, [activeTab]: [...msgs, { role: 'assistant', content: '❌ Erro de conexão com a IA.' }] }));
        }
        setChatLoading(false);
    };

    const applyAITexts = async () => {
        setChatApplying(true);
        const msgs = currentChat;
        try {
            const res = await fetch('/api/admin/ai/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: msgs.map(m => ({ role: m.role, content: m.content })), section: activeTab, mode: 'generate_text', currentData: settings[activeTab] }),
            });
            const data = await res.json();
            if (data.success && data.data) {
                setSettings(s => ({ ...s, [activeTab]: { ...s[activeTab], ...data.data } }));
                const aiMsg: ChatMsg = { role: 'assistant', content: '✅ Textos aplicados com sucesso! Revise os campos e clique em Salvar.' };
                setChatMessages(c => ({ ...c, [activeTab]: [...msgs, aiMsg] }));
                setMsg('Textos gerados! Revise e salve.');
            } else {
                setChatMessages(c => ({ ...c, [activeTab]: [...msgs, { role: 'assistant', content: '❌ ' + (data.error || 'Erro ao gerar textos') }] }));
            }
        } catch {
            setChatMessages(c => ({ ...c, [activeTab]: [...msgs, { role: 'assistant', content: '❌ Erro de conexão.' }] }));
        }
        setChatApplying(false);
        setTimeout(() => setMsg(''), 4000);
    };

    const searchAIImages = async (target?: string) => {
        setChatApplying(true);
        setChatImageResults([]);
        if (target) setChatImageTarget(target);
        const msgs = currentChat;
        try {
            const res = await fetch('/api/admin/ai/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: msgs.map(m => ({ role: m.role, content: m.content })), section: activeTab, mode: 'generate_image', currentData: settings[activeTab] }),
            });
            const data = await res.json();
            if (data.success && data.data) {
                setChatImageResults(data.data);
                const aiMsg: ChatMsg = { role: 'assistant', content: `🎨 Gerei ${data.data.length} imagem(ns)! Clique na que preferir para aplicar.` };
                setChatMessages(c => ({ ...c, [activeTab]: [...msgs, aiMsg] }));
            } else {
                const errMsg = data.error || 'Não foi possível gerar a imagem.';
                setChatMessages(c => ({ ...c, [activeTab]: [...msgs, { role: 'assistant', content: `❌ ${errMsg}` }] }));
            }
        } catch {
            setChatMessages(c => ({ ...c, [activeTab]: [...msgs, { role: 'assistant', content: '❌ Erro de conexão ao gerar imagem. Tente novamente.' }] }));
        }
        setChatApplying(false);
    };

    const selectChatImage = (url: string) => {
        if (chatImageTarget) {
            const [section, field] = chatImageTarget.split('.');
            updateField(section, field, url);
        }
        setChatImageResults([]);
        const aiMsg: ChatMsg = { role: 'assistant', content: '✅ Imagem aplicada! Não esqueça de Salvar.' };
        setChatMessages(c => ({ ...c, [activeTab]: [...(c[activeTab] || []), aiMsg] }));
    };

    const clearChat = () => { setChatMessages(c => ({ ...c, [activeTab]: [] })); setChatImageResults([]); };

    // ── Image Upload ──
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', 'site');
        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success && uploadTarget) {
                const [section, field] = uploadTarget.split('.');
                updateField(section, field, data.data.url);
            }
        } catch { setMsg('Erro no upload.'); setTimeout(() => setMsg(''), 3000); }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const triggerUpload = (target: string) => { setUploadTarget(target); fileInputRef.current?.click(); };

    const openChatForImage = (target: string, hint: string) => {
        setChatImageTarget(target);
        setShowChat(true);
        if (currentChat.length === 0) {
            setChatInput(`Quero gerar uma imagem para: ${hint}`);
        }
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: 0.8 };
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px' };

    // ── Image Field ──
    const ImageField = ({ section, field, label, context }: { section: string; field: string; label: string; context: string }) => (
        <div>
            <label style={labelStyle}>{label}</label>
            <div className="img-field-row" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 140, height: 90, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1040', flexShrink: 0 }}>
                    {settings[section]?.[field] ? (
                        <img src={settings[section][field]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'rgba(255,255,255,0.1)' }}>📷</div>
                    )}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input value={settings[section]?.[field] || ''} onChange={e => updateField(section, field, e.target.value)} style={inputStyle} placeholder="URL da imagem" />
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => triggerUpload(`${section}.${field}`)} disabled={uploading} style={btnGold}>
                            {uploading ? '⏳...' : '📁 Upload'}
                        </button>
                        <button onClick={() => openChatForImage(`${section}.${field}`, context)} style={btnAI}>
                            🤖 Chat + Imagem IA
                        </button>
                        {settings[section]?.[field] && (
                            <button onClick={() => updateField(section, field, '')} style={btnRed}>🗑️ Remover</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Tab content ──
    const renderTab = () => {
        const s = settings[activeTab] || {};
        switch (activeTab) {
            case 'hero': return (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ImageField section="hero" field="image_url" label="Imagem de Fundo do Hero" context="Hero banner épico, cidade antiga, pôr do sol dramático" />
                <div><label style={labelStyle}>Título Principal</label><input value={s.title || ''} onChange={e => updateField('hero', 'title', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Subtítulo</label><input value={s.subtitle || ''} onChange={e => updateField('hero', 'subtitle', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Descrição</label><textarea value={s.description || ''} onChange={e => updateField('hero', 'description', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div><label style={labelStyle}>Texto do Badge</label><input value={s.badge_text || ''} onChange={e => updateField('hero', 'badge_text', e.target.value)} style={inputStyle} /></div>
                <div className="settings-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><label style={labelStyle}>Botão Principal</label><input value={s.cta_primary || ''} onChange={e => updateField('hero', 'cta_primary', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Botão Secundário</label><input value={s.cta_secondary || ''} onChange={e => updateField('hero', 'cta_secondary', e.target.value)} style={inputStyle} /></div>
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Estatísticas ({(s.stats || []).length})</label>
                        <button onClick={() => addArrayItem('hero', 'stats', { number: '', label: '' })} style={btnGreen}>➕ Novo</button>
                    </div>
                    {(s.stats || []).map((st: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                            <input value={st.number || ''} onChange={e => updateNestedField('hero', 'stats', i, 'number', e.target.value)} style={{ ...inputStyle, width: 100 }} placeholder="Número" />
                            <input value={st.label || ''} onChange={e => updateNestedField('hero', 'stats', i, 'label', e.target.value)} style={inputStyle} placeholder="Label" />
                            <button onClick={() => removeArrayItem('hero', 'stats', i)} style={{ ...btnRed, flexShrink: 0 }}>✕</button>
                        </div>
                    ))}
                </div>
            </div>);
            case 'cities_section': return (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)' }}>
                    <p style={{ fontSize: 12, color: '#c9a227' }}>💡 Fotos das cidades: <strong>Gerenciar Cidades</strong>. Aqui edite os textos da seção.</p>
                </div>
                <div><label style={labelStyle}>Label</label><input value={s.label || ''} onChange={e => updateField('cities_section', 'label', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Título</label><input value={s.title || ''} onChange={e => updateField('cities_section', 'title', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Subtítulo</label><textarea value={s.subtitle || ''} onChange={e => updateField('cities_section', 'subtitle', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            </div>);
            case 'map_section': return (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ImageField section="map_section" field="image_url" label="Imagem do Mapa" context="Mapa antigo viagens Paulo, Mediterrâneo, rotas antigas" />
                <div><label style={labelStyle}>Label</label><input value={s.label || ''} onChange={e => updateField('map_section', 'label', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Título</label><input value={s.title || ''} onChange={e => updateField('map_section', 'title', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Subtítulo</label><textarea value={s.subtitle || ''} onChange={e => updateField('map_section', 'subtitle', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Estatísticas ({(s.stats || []).length})</label>
                        <button onClick={() => addArrayItem('map_section', 'stats', { label: '', value: '' })} style={btnGreen}>➕ Nova</button>
                    </div>
                    {(s.stats || []).map((st: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                            <input value={st.label || ''} onChange={e => updateNestedField('map_section', 'stats', i, 'label', e.target.value)} style={{ ...inputStyle, width: 120 }} placeholder="Label" />
                            <input value={st.value || ''} onChange={e => updateNestedField('map_section', 'stats', i, 'value', e.target.value)} style={inputStyle} placeholder="Valor" />
                            <button onClick={() => removeArrayItem('map_section', 'stats', i)} style={{ ...btnRed, flexShrink: 0 }}>✕</button>
                        </div>
                    ))}
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Viagens ({(s.journeys || []).length})</label>
                        <button onClick={() => addArrayItem('map_section', 'journeys', { num: '', title: '', route: '', date: '' })} style={btnGreen}>➕ Nova</button>
                    </div>
                    {(s.journeys || []).map((j: any, i: number) => (
                        <div key={i} className="journey-row" style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                            <input value={j.num || ''} onChange={e => updateNestedField('map_section', 'journeys', i, 'num', e.target.value)} style={{ ...inputStyle, width: 50 }} placeholder="#" />
                            <input value={j.title || ''} onChange={e => updateNestedField('map_section', 'journeys', i, 'title', e.target.value)} style={inputStyle} placeholder="Título" />
                            <input value={j.route || ''} onChange={e => updateNestedField('map_section', 'journeys', i, 'route', e.target.value)} style={inputStyle} placeholder="Rota" />
                            <input value={j.date || ''} onChange={e => updateNestedField('map_section', 'journeys', i, 'date', e.target.value)} style={{ ...inputStyle, width: 100 }} placeholder="Data" />
                            <button onClick={() => removeArrayItem('map_section', 'journeys', i)} style={{ ...btnRed, flexShrink: 0 }}>✕</button>
                        </div>
                    ))}
                </div>
            </div>);
            case 'how_it_works': return (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={labelStyle}>Label</label><input value={s.label || ''} onChange={e => updateField('how_it_works', 'label', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Título</label><input value={s.title || ''} onChange={e => updateField('how_it_works', 'title', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Subtítulo</label><textarea value={s.subtitle || ''} onChange={e => updateField('how_it_works', 'subtitle', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Cards ({(s.items || []).length})</label>
                        <button onClick={() => addArrayItem('how_it_works', 'items', { icon: '🔍', title: '', desc: '' })} style={btnGreen}>➕ Novo Card</button>
                    </div>
                    {(s.items || []).map((item: any, i: number) => (
                        <div key={i} style={{ ...glass, padding: 14, position: 'relative', marginBottom: 10 }}>
                            <button onClick={() => removeArrayItem('how_it_works', 'items', i)} style={{ ...btnRed, position: 'absolute', top: 10, right: 10, padding: '4px 8px' }}>🗑️</button>
                            <div className="settings-grid-2" style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, marginBottom: 8 }}>
                                <div><label style={{ ...labelStyle, marginBottom: 3 }}>Ícone</label><input value={item.icon || ''} onChange={e => updateNestedField('how_it_works', 'items', i, 'icon', e.target.value)} style={inputStyle} /></div>
                                <div><label style={{ ...labelStyle, marginBottom: 3 }}>Título</label><input value={item.title || ''} onChange={e => updateNestedField('how_it_works', 'items', i, 'title', e.target.value)} style={inputStyle} /></div>
                            </div>
                            <div><label style={{ ...labelStyle, marginBottom: 3 }}>Descrição</label><textarea value={item.desc || ''} onChange={e => updateNestedField('how_it_works', 'items', i, 'desc', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                        </div>
                    ))}
                </div>
            </div>);
            case 'about': return (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={labelStyle}>Label</label><input value={s.label || ''} onChange={e => updateField('about', 'label', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Título</label><input value={s.title || ''} onChange={e => updateField('about', 'title', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Subtítulo</label><textarea value={s.subtitle || ''} onChange={e => updateField('about', 'subtitle', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Parágrafos ({(s.paragraphs || []).length})</label>
                        <button onClick={() => addArrayItem('about', 'paragraphs', '')} style={btnGreen}>➕ Novo</button>
                    </div>
                    {(s.paragraphs || []).map((p: string, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
                            <textarea value={p} onChange={e => {
                                const arr = [...(s.paragraphs || [])];
                                arr[i] = e.target.value;
                                updateField('about', 'paragraphs', arr);
                            }} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                            <button onClick={() => removeArrayItem('about', 'paragraphs', i)} style={{ ...btnRed, flexShrink: 0 }}>✕</button>
                        </div>
                    ))}
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Features ({(s.features || []).length})</label>
                        <button onClick={() => addArrayItem('about', 'features', { icon: '🔍', title: '', desc: '' })} style={btnGreen}>➕ Nova</button>
                    </div>
                    {(s.features || []).map((f: any, i: number) => (
                        <div key={i} style={{ ...glass, padding: 14, position: 'relative', marginBottom: 10 }}>
                            <button onClick={() => removeArrayItem('about', 'features', i)} style={{ ...btnRed, position: 'absolute', top: 10, right: 10, padding: '4px 8px' }}>🗑️</button>
                            <div className="settings-grid-2" style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, marginBottom: 8 }}>
                                <div><label style={{ ...labelStyle, marginBottom: 3 }}>Ícone</label><input value={f.icon || ''} onChange={e => updateNestedField('about', 'features', i, 'icon', e.target.value)} style={inputStyle} /></div>
                                <div><label style={{ ...labelStyle, marginBottom: 3 }}>Título</label><input value={f.title || ''} onChange={e => updateNestedField('about', 'features', i, 'title', e.target.value)} style={inputStyle} /></div>
                            </div>
                            <div><label style={{ ...labelStyle, marginBottom: 3 }}>Descrição</label><textarea value={f.desc || ''} onChange={e => updateNestedField('about', 'features', i, 'desc', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                        </div>
                    ))}
                </div>
            </div>);
            case 'testimonials': return (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={labelStyle}>Label</label><input value={s.label || ''} onChange={e => updateField('testimonials', 'label', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Título</label><input value={s.title || ''} onChange={e => updateField('testimonials', 'title', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Subtítulo</label><textarea value={s.subtitle || ''} onChange={e => updateField('testimonials', 'subtitle', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Estatísticas ({(s.stats || []).length})</label>
                        <button onClick={() => addArrayItem('testimonials', 'stats', { number: '', label: '' })} style={btnGreen}>➕ Nova</button>
                    </div>
                    {(s.stats || []).map((st: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                            <input value={st.number || ''} onChange={e => updateNestedField('testimonials', 'stats', i, 'number', e.target.value)} style={{ ...inputStyle, width: 100 }} placeholder="Número" />
                            <input value={st.label || ''} onChange={e => updateNestedField('testimonials', 'stats', i, 'label', e.target.value)} style={inputStyle} placeholder="Label" />
                            <button onClick={() => removeArrayItem('testimonials', 'stats', i)} style={{ ...btnRed, flexShrink: 0 }}>✕</button>
                        </div>
                    ))}
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Depoimentos ({(s.items || []).length})</label>
                        <button onClick={() => addArrayItem('testimonials', 'items', { name: '', role: '', text: '', avatar: '👤' })} style={btnGreen}>➕ Novo</button>
                    </div>
                    {(s.items || []).map((t: any, i: number) => (
                        <div key={i} style={{ ...glass, padding: 14, position: 'relative', marginBottom: 10 }}>
                            <button onClick={() => removeArrayItem('testimonials', 'items', i)} style={{ ...btnRed, position: 'absolute', top: 10, right: 10, padding: '4px 8px' }}>🗑️</button>
                            <div className="settings-grid-2" style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 8, marginBottom: 8 }}>
                                <div><label style={{ ...labelStyle, marginBottom: 3 }}>Avatar</label><input value={t.avatar || ''} onChange={e => updateNestedField('testimonials', 'items', i, 'avatar', e.target.value)} style={inputStyle} /></div>
                                <div><label style={{ ...labelStyle, marginBottom: 3 }}>Nome</label><input value={t.name || ''} onChange={e => updateNestedField('testimonials', 'items', i, 'name', e.target.value)} style={inputStyle} /></div>
                                <div><label style={{ ...labelStyle, marginBottom: 3 }}>Cargo/Função</label><input value={t.role || ''} onChange={e => updateNestedField('testimonials', 'items', i, 'role', e.target.value)} style={inputStyle} /></div>
                            </div>
                            <div><label style={{ ...labelStyle, marginBottom: 3 }}>Texto</label><textarea value={t.text || ''} onChange={e => updateNestedField('testimonials', 'items', i, 'text', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                        </div>
                    ))}
                </div>
            </div>);
            case 'faq': return (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={labelStyle}>Label</label><input value={s.label || ''} onChange={e => updateField('faq', 'label', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Título</label><input value={s.title || ''} onChange={e => updateField('faq', 'title', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Subtítulo</label><textarea value={s.subtitle || ''} onChange={e => updateField('faq', 'subtitle', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Perguntas ({(s.items || []).length})</label>
                        <button onClick={() => addArrayItem('faq', 'items', { question: '', answer: '' })} style={btnGreen}>➕ Nova</button>
                    </div>
                    {(s.items || []).map((item: any, i: number) => (
                        <div key={i} style={{ ...glass, padding: 14, position: 'relative', marginBottom: 10 }}>
                            <button onClick={() => removeArrayItem('faq', 'items', i)} style={{ ...btnRed, position: 'absolute', top: 10, right: 10, padding: '4px 8px' }}>🗑️</button>
                            <div style={{ marginBottom: 8 }}><label style={{ ...labelStyle, marginBottom: 3 }}>Pergunta</label><input value={item.question || ''} onChange={e => updateNestedField('faq', 'items', i, 'question', e.target.value)} style={inputStyle} /></div>
                            <div><label style={{ ...labelStyle, marginBottom: 3 }}>Resposta</label><textarea value={item.answer || ''} onChange={e => updateNestedField('faq', 'items', i, 'answer', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                        </div>
                    ))}
                </div>
            </div>);
            case 'cta_section': return (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={labelStyle}>Título</label><input value={s.title || ''} onChange={e => updateField('cta_section', 'title', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Subtítulo</label><textarea value={s.subtitle || ''} onChange={e => updateField('cta_section', 'subtitle', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div><label style={labelStyle}>Texto do Botão</label><input value={s.button_text || ''} onChange={e => updateField('cta_section', 'button_text', e.target.value)} style={inputStyle} /></div>
            </div>);
            case 'footer': return (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={labelStyle}>Texto do Copyright</label><textarea value={s.text || ''} onChange={e => updateField('footer', 'text', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            </div>);
            default: return null;
        }
    };

    // ── Chat Panel ──
    const renderChat = () => (
        <div style={{ background: 'linear-gradient(135deg,rgba(139,69,255,0.06),rgba(201,162,39,0.04))', border: '1px solid rgba(139,69,255,0.2)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            {/* Chat header */}
            <div style={{ padding: '12px 16px', background: 'rgba(139,69,255,0.08)', borderBottom: '1px solid rgba(139,69,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🤖</span>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#b388ff' }}>Assistente IA</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Converse antes de gerar — descreva o que deseja</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {currentChat.length > 0 && <button onClick={clearChat} style={{ ...btnRed, fontSize: 10 }}>🗑️ Limpar</button>}
                    <button onClick={() => setShowChat(false)} style={{ ...btnRed, fontSize: 10 }}>✕ Fechar</button>
                </div>
            </div>

            {/* Messages */}
            <div style={{ maxHeight: 350, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentChat.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <p style={{ fontSize: 28, marginBottom: 8 }}>💬</p>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Comece a conversa!</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', maxWidth: 300, margin: '0 auto' }}>Descreva o que você quer para os textos ou imagens desta seção. A IA vai alinhar com você antes de gerar.</p>
                    </div>
                )}
                {currentChat.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: '80%', padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                            background: m.role === 'user' ? 'rgba(201,162,39,0.15)' : 'rgba(139,69,255,0.1)',
                            border: `1px solid ${m.role === 'user' ? 'rgba(201,162,39,0.3)' : 'rgba(139,69,255,0.2)'}`,
                            color: m.role === 'user' ? '#e8d48b' : 'rgba(255,255,255,0.8)',
                            borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                            borderBottomLeftRadius: m.role === 'user' ? 12 : 4,
                        }}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {chatLoading && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 14px', background: 'rgba(139,69,255,0.08)', borderRadius: 12, width: 'fit-content' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#b388ff', animation: 'pulse 1s infinite' }} />
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#b388ff', animation: 'pulse 1s infinite 0.3s' }} />
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#b388ff', animation: 'pulse 1s infinite 0.6s' }} />
                    </div>
                )}

                {/* Image results grid */}
                {chatImageResults.length > 0 && (
                    <div style={{ background: 'rgba(139,69,255,0.06)', border: '1px solid rgba(139,69,255,0.15)', borderRadius: 12, padding: 12, marginTop: 4 }}>
                        <p style={{ fontSize: 11, color: '#b388ff', fontWeight: 600, marginBottom: 8 }}>Imagens geradas pela IA — clique para aplicar:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8 }}>
                            {chatImageResults.map((img: any, i: number) => (
                                <div key={i} onClick={() => selectChatImage(img.url)} style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget).style.borderColor = '#c9a227'; }} onMouseLeave={e => { (e.currentTarget).style.borderColor = 'transparent'; }}>
                                    <div style={{ height: 80, background: '#1a1040' }}>
                                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                    <p style={{ padding: '4px 6px', fontSize: 9, color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.3)' }}>{img.description || 'Imagem'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input + action buttons */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(139,69,255,0.15)', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                        placeholder="Descreva o que deseja... (Enter para enviar)" disabled={chatLoading || chatApplying}
                        style={{ ...inputStyle, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(139,69,255,0.25)' }} />
                    <button onClick={sendChatMessage} disabled={chatLoading || chatApplying || !chatInput.trim()}
                        style={{ padding: '8px 16px', borderRadius: 8, background: chatInput.trim() ? 'linear-gradient(135deg,#8b45ff,#6a1bff)' : 'rgba(255,255,255,0.05)', color: chatInput.trim() ? '#fff' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 12, border: 'none', cursor: chatInput.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
                        Enviar
                    </button>
                </div>
                {currentChat.length >= 2 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={applyAITexts} disabled={chatApplying}
                            style={{ padding: '7px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#8b45ff,#c9a227)', color: '#fff', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer', opacity: chatApplying ? 0.6 : 1 }}>
                            {chatApplying ? '⏳...' : '✨ Aplicar Textos'}
                        </button>
                        <button onClick={() => searchAIImages()} disabled={chatApplying}
                            style={{ padding: '7px 16px', borderRadius: 8, background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.4)', color: '#c9a227', fontWeight: 700, fontSize: 11, cursor: 'pointer', opacity: chatApplying ? 0.6 : 1 }}>
                            {chatApplying ? '⏳ Gerando...' : '🎨 Gerar Imagem IA'}
                        </button>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>Só aplica quando você clicar</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Configurações do Site</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Edite textos, imagens e conteúdo da homepage</p>
                </div>
            </div>

            {msg && <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: msg.startsWith('Erro') ? 'rgba(231,76,60,0.15)' : 'rgba(39,174,96,0.15)', border: '1px solid ' + (msg.startsWith('Erro') ? 'rgba(231,76,60,0.4)' : 'rgba(39,174,96,0.4)'), color: msg.startsWith('Erro') ? '#e74c3c' : '#2ecc71', fontSize: 13 }}>{msg}</div>}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : (
                <div className="settings-layout" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setChatImageResults([]); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, background: activeTab === tab.id ? 'rgba(201,162,39,0.15)' : 'transparent', color: activeTab === tab.id ? '#c9a227' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>
                                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                                {tab.label}
                                {(chatMessages[tab.id]?.length || 0) > 0 && <span style={{ fontSize: 8, color: '#b388ff', marginLeft: 'auto' }}>💬</span>}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={glass}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                            <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700 }}>
                                {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
                            </h2>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button onClick={() => setShowChat(!showChat)}
                                    style={{ ...btnAI, padding: '8px 16px', fontSize: 12, background: showChat ? 'rgba(139,69,255,0.25)' : btnAI.background }}>
                                    {showChat ? '💬 Fechar Chat IA' : '🤖 Chat com IA'}
                                </button>
                                <button onClick={() => handleSave(activeTab)} disabled={saving}
                                    style={{ padding: '8px 20px', borderRadius: 8, background: saveSuccess ? 'linear-gradient(135deg,#27ae60,#1e8449)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: saveSuccess ? '#fff' : '#1a0a4a', fontWeight: 700, fontSize: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.3s' }}>
                                    {saving ? '⏳ Salvando...' : saveSuccess ? '✅ Salvo!' : '💾 Salvar'}
                                </button>
                            </div>
                        </div>

                        {/* Chat panel (inline) */}
                        {showChat && renderChat()}

                        {renderTab()}
                    </div>
                </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />

            <style>{`
                @keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
                @media (max-width: 768px) {
                    .settings-layout { grid-template-columns: 1fr !important; }
                    .settings-grid-2 { grid-template-columns: 1fr !important; }
                    .img-field-row { flex-direction: column !important; }
                    .journey-row { flex-wrap: wrap; }
                }
            `}</style>
        </div>
    );
}
