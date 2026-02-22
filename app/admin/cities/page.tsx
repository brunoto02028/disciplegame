'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ChatMsg { role: 'user' | 'assistant'; content: string }

const emptyForm = { name: '', name_en: '', country: '', modern_name: '', description: '', biblical_context: '', latitude: '', longitude: '', flag: '', biblical_ref: '', image_url: '', active: true };

export default function AdminCitiesPage() {
    const router = useRouter();
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Chat IA states ──
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatApplying, setChatApplying] = useState(false);
    const [chatImageResults, setChatImageResults] = useState<any[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchCities = useCallback(async () => {
        const res = await fetch('/api/admin/cities');
        if (res.status === 401) { router.push('/admin/login'); return; }
        const data = await res.json();
        if (data.success) setCities(data.data);
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchCities(); }, [fetchCities]);
    useEffect(() => {
        const el = chatEndRef.current?.parentElement;
        if (el) el.scrollTop = el.scrollHeight;
    }, [chatMessages, chatImageResults]);

    const resetChat = () => { setChatMessages([]); setChatInput(''); setChatImageResults([]); setShowChat(false); };

    const openCreate = () => {
        setForm({ ...emptyForm });
        setEditingId(null);
        resetChat();
        setShowForm(true);
    };

    const openEdit = (city: any) => {
        setForm({
            name: city.name || '', name_en: city.name_en || '', country: city.country || '',
            modern_name: city.modern_name || '', description: city.description || '',
            biblical_context: city.biblical_context || '', latitude: String(city.latitude || ''),
            longitude: String(city.longitude || ''), flag: city.flag || '',
            biblical_ref: city.biblical_ref || '', image_url: city.image_url || '',
            active: city.active !== false,
        });
        setEditingId(city.id);
        resetChat();
        setShowForm(true);
    };

    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        if (!form.name || !form.country) {
            setMsg('Erro: Preencha nome e país.'); setTimeout(() => setMsg(''), 3000); return;
        }
        setSaving(true); setSaveSuccess(false);
        try {
            const url = editingId ? '/api/admin/cities/' + editingId : '/api/admin/cities';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) {
                // Re-fetch to confirm persistence
                await fetchCities();
                setSaveSuccess(true);
                setMsg(editingId ? '✅ Cidade atualizada e confirmada!' : '✅ Cidade criada com sucesso!');
                // Keep modal open briefly to show confirmation, then close
                setTimeout(() => { setShowForm(false); setSaveSuccess(false); }, 1200);
            } else { setMsg('Erro: ' + data.error); }
        } catch { setMsg('Erro: Falha de conexão ao salvar.'); }
        setSaving(false); setTimeout(() => setMsg(''), 4000);
    };

    const handleDelete = async (id: string) => {
        const res = await fetch('/api/admin/cities/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) { setMsg(`Cidade deletada (${data.deletedQuestions} perguntas removidas).`); fetchCities(); }
        setDeleteConfirm(null); setTimeout(() => setMsg(''), 4000);
    };

    const handleToggleActive = async (city: any) => {
        await fetch('/api/admin/cities/' + city.id, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !city.active }),
        });
        fetchCities();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', 'cities');
        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) { setForm(f => ({ ...f, image_url: data.data.url })); }
            else { setMsg('Erro: ' + data.error); setTimeout(() => setMsg(''), 3000); }
        } catch { setMsg('Erro no upload.'); setTimeout(() => setMsg(''), 3000); }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Chat IA Functions ──
    const sendChatMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const userMsg: ChatMsg = { role: 'user', content: chatInput.trim() };
        const msgs = [...chatMessages, userMsg];
        setChatMessages(msgs);
        setChatInput('');
        setChatLoading(true);
        setChatImageResults([]);
        try {
            const cityCtx = form.name ? `Cidade: ${form.name} (${form.country})${form.biblical_ref ? `, Ref: ${form.biblical_ref}` : ''}` : 'Nova cidade bíblica';
            const res = await fetch('/api/admin/ai/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: msgs.map(m => ({ role: m.role, content: m.content })),
                    section: 'city_image',
                    mode: 'chat',
                    currentData: { cityName: form.name, country: form.country, biblical_ref: form.biblical_ref, description: form.description, context: cityCtx },
                }),
            });
            const data = await res.json();
            if (data.success) {
                setChatMessages([...msgs, { role: 'assistant', content: data.data.message }]);
            } else {
                setChatMessages([...msgs, { role: 'assistant', content: '❌ ' + (data.error || 'Erro na IA') }]);
            }
        } catch {
            setChatMessages([...msgs, { role: 'assistant', content: '❌ Erro de conexão.' }]);
        }
        setChatLoading(false);
    };

    const generateCityImage = async () => {
        setChatApplying(true);
        setChatImageResults([]);
        const msgs = chatMessages;
        try {
            const cityCtx = form.name ? `Image for the biblical city of ${form.name}, ${form.country}` : 'Biblical city';
            const res = await fetch('/api/admin/ai/chat', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: msgs.length > 0
                        ? msgs.map(m => ({ role: m.role, content: m.content }))
                        : [{ role: 'user', content: `Quero uma imagem para a cidade bíblica de ${form.name || 'uma cidade antiga'}, ${form.country || 'região do Mediterrâneo'}. Estilo épico, cinematográfico.` }],
                    section: 'city_image',
                    mode: 'generate_image',
                    currentData: { cityName: form.name, country: form.country, context: cityCtx },
                }),
            });
            const data = await res.json();
            if (data.success && data.data) {
                setChatImageResults(data.data);
                setChatMessages(prev => [...prev, { role: 'assistant', content: `🎨 Gerei ${data.data.length} imagem(ns)! Clique para aplicar.` }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'assistant', content: `❌ ${data.error || 'Não foi possível gerar a imagem.'}` }]);
            }
        } catch {
            setChatMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro de conexão ao gerar imagem.' }]);
        }
        setChatApplying(false);
    };

    const selectChatImage = (url: string) => {
        setForm(f => ({ ...f, image_url: url }));
        setChatImageResults([]);
        setChatMessages(prev => [...prev, { role: 'assistant', content: '✅ Imagem aplicada! Salve para confirmar.' }]);
    };

    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: 0.8 };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Gerenciar Cidades</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{cities.length} cidades · {cities.filter(c => c.active).length} ativas</p>
                </div>
                <button onClick={openCreate} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                    ➕ Nova Cidade
                </button>
            </div>

            {msg && <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: msg.startsWith('Erro') ? 'rgba(231,76,60,0.15)' : 'rgba(39,174,96,0.15)', border: '1px solid ' + (msg.startsWith('Erro') ? 'rgba(231,76,60,0.4)' : 'rgba(39,174,96,0.4)'), color: msg.startsWith('Erro') ? '#e74c3c' : '#2ecc71', fontSize: 13 }}>{msg}</div>}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : (
                <div className="admin-cities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
                    {cities.map(city => (
                        <div key={city.id} style={{ ...glass, overflow: 'hidden', opacity: city.active ? 1 : 0.55, transition: 'opacity 0.3s' }}>
                            {/* City image */}
                            <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#1a1040' }}>
                                {city.image_url ? (
                                    <img src={city.image_url} alt={city.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'rgba(255,255,255,0.1)' }}>🏛️</div>
                                )}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(26,26,46,0.9) 0%,transparent 60%)' }} />
                                {/* Status badge */}
                                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: city.active ? 'rgba(39,174,96,0.25)' : 'rgba(231,76,60,0.25)', border: '1px solid ' + (city.active ? 'rgba(39,174,96,0.5)' : 'rgba(231,76,60,0.5)'), color: city.active ? '#2ecc71' : '#e74c3c' }}>
                                        {city.active ? 'ATIVA' : 'INATIVA'}
                                    </span>
                                </div>
                                {/* Flag + country badge */}
                                {city.flag && (
                                    <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(201,162,39,0.4)' }}>
                                        <span style={{ fontSize: 14 }}>{city.flag}</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: '#c9a227' }}>{city.country?.toUpperCase()}</span>
                                    </div>
                                )}
                                {/* Order index */}
                                <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#1a0a4a' }}>
                                        {city.order_index}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 16 }}>{city.name}</p>
                                    </div>
                                </div>
                            </div>
                            {/* City info */}
                            <div style={{ padding: '14px 16px' }}>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                                    {city.description || city.biblical_context || 'Sem descrição'}
                                </p>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(39,174,96,0.12)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 20, padding: '2px 8px', color: '#2ecc71' }}>
                                        ❓ {city.questionCount} perguntas
                                    </span>
                                    {city.biblical_ref && (
                                        <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: 20, padding: '2px 8px', color: '#c9a227' }}>
                                            📖 {city.biblical_ref}
                                        </span>
                                    )}
                                    {city.modern_name && city.modern_name !== city.name && (
                                        <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2px 8px', color: 'rgba(255,255,255,0.35)' }}>
                                            📍 {city.modern_name}
                                        </span>
                                    )}
                                </div>
                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => openEdit(city)} style={{ flex: 1, padding: '7px 12px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>✏️ Editar</button>
                                    <button onClick={() => handleToggleActive(city)} style={{ padding: '7px 12px', borderRadius: 8, background: city.active ? 'rgba(231,76,60,0.08)' : 'rgba(39,174,96,0.08)', border: '1px solid ' + (city.active ? 'rgba(231,76,60,0.25)' : 'rgba(39,174,96,0.25)'), color: city.active ? '#e74c3c' : '#2ecc71', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                        {city.active ? '⏸ Desativar' : '▶ Ativar'}
                                    </button>
                                    {deleteConfirm === city.id ? (
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button onClick={() => handleDelete(city.id)} style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', color: '#e74c3c', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Sim</button>
                                            <button onClick={() => setDeleteConfirm(null)} style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}>Não</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteConfirm(city.id)} style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#e74c3c', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>🗑️</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add city card */}
                    <button onClick={openCreate} style={{ ...glass, padding: '20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', background: 'rgba(201,162,39,0.05)', border: '2px dashed rgba(201,162,39,0.3)', minHeight: 280 }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,162,39,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>➕</div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: '#c9a227' }}>Adicionar Cidade</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Crie novas cidades para o jogo</p>
                    </button>
                </div>
            )}

            {/* ═══════ Modal Create/Edit Form ═══════ */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 20, fontWeight: 700 }}>{editingId ? 'Editar Cidade' : 'Nova Cidade'}</h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Image section */}
                            <div>
                                <label style={labelStyle}>Imagem da Cidade</label>
                                <div className="city-img-row" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{ width: 140, height: 100, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1040', flexShrink: 0 }}>
                                        {form.image_url ? (
                                            <img src={form.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'rgba(255,255,255,0.1)' }}>🏛️</div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} style={inputStyle} placeholder="URL da imagem" />
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                                style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                                {uploading ? '⏳...' : '📁 Upload'}
                                            </button>
                                            <button onClick={() => { setShowChat(!showChat); if (!showChat && chatMessages.length === 0) setChatInput(`Quero gerar uma imagem para a cidade de ${form.name || 'uma cidade bíblica antiga'}`); }}
                                                style={{ padding: '7px 12px', borderRadius: 8, background: showChat ? 'rgba(139,69,255,0.25)' : 'linear-gradient(135deg,rgba(139,69,255,0.15),rgba(201,162,39,0.15))', border: '1px solid rgba(139,69,255,0.35)', color: '#b388ff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                                {showChat ? '💬 Fechar Chat' : '🤖 Gerar com IA'}
                                            </button>
                                            {form.image_url && (
                                                <button onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                                                    style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#e74c3c', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                                    🗑️ Remover
                                                </button>
                                            )}
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                                    </div>
                                </div>
                            </div>

                            {/* ── Chat IA Panel ── */}
                            {showChat && (
                                <div style={{ background: 'linear-gradient(135deg,rgba(139,69,255,0.06),rgba(201,162,39,0.04))', border: '1px solid rgba(139,69,255,0.2)', borderRadius: 14, overflow: 'hidden' }}>
                                    <div style={{ padding: '10px 14px', background: 'rgba(139,69,255,0.08)', borderBottom: '1px solid rgba(139,69,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 16 }}>🤖</span>
                                            <div>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: '#b388ff' }}>Assistente IA — Imagem</p>
                                                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Descreva a imagem desejada antes de gerar</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {chatMessages.length > 0 && <button onClick={() => { setChatMessages([]); setChatImageResults([]); }} style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#e74c3c', fontSize: 9, cursor: 'pointer' }}>🗑️</button>}
                                            <button onClick={() => setShowChat(false)} style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#e74c3c', fontSize: 9, cursor: 'pointer' }}>✕</button>
                                        </div>
                                    </div>
                                    {/* Messages */}
                                    <div style={{ maxHeight: 220, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {chatMessages.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Descreva a imagem que quer para esta cidade.</p>
                                            </div>
                                        )}
                                        {chatMessages.map((m, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                                <div style={{
                                                    maxWidth: '85%', padding: '8px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                                                    background: m.role === 'user' ? 'rgba(201,162,39,0.15)' : 'rgba(139,69,255,0.1)',
                                                    border: `1px solid ${m.role === 'user' ? 'rgba(201,162,39,0.3)' : 'rgba(139,69,255,0.2)'}`,
                                                    color: m.role === 'user' ? '#e8d48b' : 'rgba(255,255,255,0.8)',
                                                    borderBottomRightRadius: m.role === 'user' ? 3 : 10,
                                                    borderBottomLeftRadius: m.role === 'user' ? 10 : 3,
                                                }}>{m.content}</div>
                                            </div>
                                        ))}
                                        {chatLoading && (
                                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 12px', background: 'rgba(139,69,255,0.08)', borderRadius: 10, width: 'fit-content' }}>
                                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#b388ff', animation: 'pulse 1s infinite' }} />
                                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#b388ff', animation: 'pulse 1s infinite 0.3s' }} />
                                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#b388ff', animation: 'pulse 1s infinite 0.6s' }} />
                                            </div>
                                        )}
                                        {/* Image results */}
                                        {chatImageResults.length > 0 && (
                                            <div style={{ background: 'rgba(139,69,255,0.06)', border: '1px solid rgba(139,69,255,0.15)', borderRadius: 10, padding: 10 }}>
                                                <p style={{ fontSize: 10, color: '#b388ff', fontWeight: 600, marginBottom: 6 }}>Clique para aplicar:</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 6 }}>
                                                    {chatImageResults.map((img: any, i: number) => (
                                                        <div key={i} onClick={() => selectChatImage(img.url)} style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
                                                            onMouseEnter={e => { (e.currentTarget).style.borderColor = '#c9a227'; }} onMouseLeave={e => { (e.currentTarget).style.borderColor = 'transparent'; }}>
                                                            <div style={{ height: 70, background: '#1a1040' }}>
                                                                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                    {/* Input + actions */}
                                    <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(139,69,255,0.15)', background: 'rgba(0,0,0,0.15)' }}>
                                        <div style={{ display: 'flex', gap: 6, marginBottom: chatMessages.length >= 2 ? 6 : 0 }}>
                                            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                                                placeholder="Descreva a imagem..." disabled={chatLoading || chatApplying}
                                                style={{ ...inputStyle, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(139,69,255,0.25)', fontSize: 12 }} />
                                            <button onClick={sendChatMessage} disabled={chatLoading || chatApplying || !chatInput.trim()}
                                                style={{ padding: '7px 14px', borderRadius: 8, background: chatInput.trim() ? 'linear-gradient(135deg,#8b45ff,#6a1bff)' : 'rgba(255,255,255,0.05)', color: chatInput.trim() ? '#fff' : 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 11, border: 'none', cursor: chatInput.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
                                                Enviar
                                            </button>
                                        </div>
                                        {chatMessages.length >= 2 && (
                                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                <button onClick={generateCityImage} disabled={chatApplying}
                                                    style={{ padding: '6px 14px', borderRadius: 8, background: 'linear-gradient(135deg,#8b45ff,#c9a227)', color: '#fff', fontWeight: 700, fontSize: 10, border: 'none', cursor: 'pointer', opacity: chatApplying ? 0.6 : 1 }}>
                                                    {chatApplying ? '⏳ Gerando...' : '🎨 Gerar Imagem IA'}
                                                </button>
                                                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Só gera quando clicar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="admin-city-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Nome (PT) *</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Ex: Corinto" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Nome (EN)</label>
                                    <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} style={inputStyle} placeholder="Ex: Corinth" />
                                </div>
                            </div>
                            <div className="admin-city-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>País *</label>
                                    <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} style={inputStyle} placeholder="Ex: Grécia" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Nome Moderno</label>
                                    <input value={form.modern_name} onChange={e => setForm(f => ({ ...f, modern_name: e.target.value }))} style={inputStyle} placeholder="Ex: Korinthos" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Bandeira</label>
                                    <input value={form.flag} onChange={e => setForm(f => ({ ...f, flag: e.target.value }))} style={inputStyle} placeholder="🇬🇷" />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Referência Bíblica</label>
                                <input value={form.biblical_ref} onChange={e => setForm(f => ({ ...f, biblical_ref: e.target.value }))} style={inputStyle} placeholder="Ex: Atos 18, 1 Coríntios" />
                            </div>
                            <div>
                                <label style={labelStyle}>Descrição</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} placeholder="Breve descrição da cidade..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Contexto Bíblico</label>
                                <textarea value={form.biblical_context} onChange={e => setForm(f => ({ ...f, biblical_context: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} placeholder="Contexto bíblico exibido durante o jogo..." />
                            </div>
                            <div className="admin-city-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Latitude</label>
                                    <input value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} style={inputStyle} placeholder="Ex: 37.9395" type="number" step="any" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Longitude</label>
                                    <input value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} style={inputStyle} placeholder="Ex: 27.3417" type="number" step="any" />
                                </div>
                            </div>
                            {/* Active toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <button onClick={() => setForm(f => ({ ...f, active: !f.active }))} style={{ width: 44, height: 24, borderRadius: 12, background: form.active ? '#2ecc71' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.active ? 23 : 3, transition: 'left 0.2s' }} />
                                </button>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: form.active ? '#2ecc71' : 'rgba(255,255,255,0.4)' }}>{form.active ? 'Cidade Ativa' : 'Cidade Inativa'}</p>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{form.active ? 'Visível no jogo e na homepage' : 'Oculta do jogo e da homepage'}</p>
                                </div>
                            </div>

                            {/* Save confirmation banner */}
                            {saveSuccess && (
                                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)', color: '#2ecc71', fontSize: 13, fontWeight: 600, textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                                    ✅ {editingId ? 'Cidade atualizada' : 'Cidade criada'} — dados confirmados no servidor!
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button onClick={handleSave} disabled={saving || saveSuccess} style={{ flex: 1, padding: '12px', borderRadius: 10, background: saveSuccess ? 'linear-gradient(135deg,#27ae60,#1e8449)' : 'linear-gradient(135deg,#c9a227,#8b6914)', color: saveSuccess ? '#fff' : '#1a0a4a', fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.3s' }}>
                                    {saving ? '⏳ Salvando...' : saveSuccess ? '✅ Salvo!' : editingId ? '💾 Salvar Alterações' : '➕ Criar Cidade'}
                                </button>
                                <button onClick={() => setShowForm(false)} style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 640px) {
                    .admin-city-form-grid { grid-template-columns: 1fr !important; }
                    .admin-cities-grid { grid-template-columns: 1fr !important; }
                    .city-img-row { flex-direction: column !important; }
                }
            `}</style>
        </div>
    );
}
