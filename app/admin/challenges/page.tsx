'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ChatMessage { role: 'user' | 'assistant'; content: string; challenge?: any; }

const emptyForm = { title: '', description: '', cityId: '', targetAccuracy: '100', bonusPoints: '500', endDate: '' };

export default function AdminChallengesPage() {
    const router = useRouter();
    const [challenges, setChallenges] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    // AI Chat state
    const [showAIChat, setShowAIChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatSending, setChatSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    const fetchData = async () => {
        const [chRes, cRes] = await Promise.all([
            fetch('/api/admin/challenges'),
            fetch('/api/admin/cities'),
        ]);
        if (chRes.status === 401) { router.push('/admin/login'); return; }
        const chData = await chRes.json();
        const cData = await cRes.json();
        if (chData.success) setChallenges(chData.data);
        if (cData.success) { setCities(cData.data); setForm(f => ({ ...f, cityId: cData.data[0]?.id || '' })); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch('/api/admin/challenges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
            setMsg('Desafio criado com sucesso!');
            setShowForm(false);
            setForm({ ...emptyForm, cityId: cities[0]?.id || '' });
            fetchData();
        } else {
            setMsg('Erro: ' + data.error);
        }
        setSaving(false);
        setTimeout(() => setMsg(''), 3000);
    };

    const toggleActive = async (id: string, active: boolean) => {
        await fetch('/api/admin/challenges', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, active: !active }),
        });
        fetchData();
    };

    // Scroll chat to bottom
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

    const sendChatMessage = async () => {
        const text = chatInput.trim();
        if (!text || chatSending) return;
        setChatInput('');
        const userMsg: ChatMessage = { role: 'user', content: text };
        setChatMessages(prev => [...prev, userMsg]);
        setChatSending(true);
        try {
            const allMessages = [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content }));
            const res = await fetch('/api/admin/ai/generate-challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ messages: allMessages, cities }),
            });
            const data = await res.json();
            if (data.success) {
                const assistantMsg: ChatMessage = { role: 'assistant', content: data.data.message, challenge: data.data.challenge };
                setChatMessages(prev => [...prev, assistantMsg]);
            } else {
                setChatMessages(prev => [...prev, { role: 'assistant', content: `❌ Erro: ${data.error}` }]);
            }
        } catch {
            setChatMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro de conexão. Tente novamente.' }]);
        }
        setChatSending(false);
        setTimeout(() => chatInputRef.current?.focus(), 100);
    };

    const useAIChallenge = (challenge: any) => {
        const city = cities.find(c => c.name.toLowerCase().includes(challenge.cityId?.toLowerCase())) || cities.find(c => c.id === challenge.cityId) || cities[0];
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (challenge.daysUntilEnd || 7));
        setForm({
            title: challenge.title || '',
            description: challenge.description || '',
            cityId: city?.id || cities[0]?.id || '',
            targetAccuracy: String(challenge.targetAccuracy || 80),
            bonusPoints: String(challenge.bonusPoints || 500),
            endDate: endDate.toISOString().split('T')[0],
        });
        setShowAIChat(false);
        setShowForm(true);
    };

    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: 0.8 };
    const optStyle: React.CSSProperties = { background: '#1a1045', color: '#fff' };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    const isExpired = (d: string) => new Date(d) < new Date();

    // Default end date = next Monday
    const getNextMonday = () => {
        const d = new Date();
        d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
        return d.toISOString().split('T')[0];
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Desafios Semanais</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{challenges.filter(c => c.active).length} ativos · {challenges.length} total</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setChatMessages([]); setShowAIChat(true); }}
                        style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                        🤖 Gerar com IA
                    </button>
                    <button onClick={() => { setForm({ ...emptyForm, cityId: cities[0]?.id || '', endDate: getNextMonday() }); setShowForm(true); }}
                        style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#f5c518,#d4a800)', color: '#1a1f2e', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                        ⚡ Novo Desafio
                    </button>
                </div>
            </div>

            {msg && <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: msg.startsWith('Erro') ? 'rgba(231,76,60,0.15)' : 'rgba(39,174,96,0.15)', border: '1px solid ' + (msg.startsWith('Erro') ? 'rgba(231,76,60,0.4)' : 'rgba(39,174,96,0.4)'), color: msg.startsWith('Erro') ? '#e74c3c' : '#2ecc71', fontSize: 13 }}>{msg}</div>}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#f5c518', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : challenges.length === 0 ? (
                <div style={{ ...glass, padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                    <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Nenhum desafio criado</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>Crie desafios semanais para engajar os jogadores.</p>
                    <button onClick={() => { setForm({ ...emptyForm, cityId: cities[0]?.id || '', endDate: getNextMonday() }); setShowForm(true); }}
                        style={{ padding: '11px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#f5c518,#d4a800)', color: '#1a1f2e', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                        ⚡ Criar Primeiro Desafio
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {challenges.map(ch => {
                        const city = cities.find(c => c.id === ch.cityId);
                        const expired = isExpired(ch.endDate);
                        return (
                            <div key={ch.id} style={{ ...glass, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, borderColor: ch.active && !expired ? 'rgba(245,197,24,0.3)' : 'rgba(255,255,255,0.08)', background: ch.active && !expired ? 'rgba(245,197,24,0.05)' : 'rgba(255,255,255,0.03)' }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: ch.active && !expired ? 'linear-gradient(135deg,#f5c518,#d4a800)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                                    {expired ? '⏰' : ch.active ? '⚡' : '⏸️'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <p style={{ fontWeight: 700, fontSize: 16 }}>{ch.title}</p>
                                        {ch.active && !expired && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(39,174,96,0.2)', border: '1px solid rgba(39,174,96,0.4)', borderRadius: 20, padding: '2px 8px', color: '#2ecc71' }}>ATIVO</span>}
                                        {expired && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: 20, padding: '2px 8px', color: '#e74c3c' }}>EXPIRADO</span>}
                                        {!ch.active && !expired && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '2px 8px', color: 'rgba(255,255,255,0.4)' }}>PAUSADO</span>}
                                    </div>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>{ch.description}</p>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>🗺️ {city?.name || '?'}</span>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>🎯 {ch.targetAccuracy}% precisão</span>
                                        <span style={{ fontSize: 11, color: '#f5c518', fontWeight: 600 }}>⭐ +{ch.bonusPoints} pts bônus</span>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>📅 Até {formatDate(ch.endDate)}</span>
                                    </div>
                                </div>
                                {!expired && (
                                    <button onClick={() => toggleActive(ch.id, ch.active)}
                                        style={{ padding: '8px 16px', borderRadius: 8, background: ch.active ? 'rgba(231,76,60,0.15)' : 'rgba(39,174,96,0.15)', border: '1px solid ' + (ch.active ? 'rgba(231,76,60,0.3)' : 'rgba(39,174,96,0.3)'), color: ch.active ? '#e74c3c' : '#2ecc71', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                                        {ch.active ? '⏸️ Pausar' : '▶️ Ativar'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 520 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 700 }}>⚡ Novo Desafio Semanal</h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Título *</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="Ex: Desafio da Semana Santa" />
                            </div>
                            <div>
                                <label style={labelStyle}>Descrição</label>
                                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} placeholder="Ex: Complete Jerusalém com perfeição!" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Cidade *</label>
                                    <select value={form.cityId} onChange={e => setForm(f => ({ ...f, cityId: e.target.value }))} style={inputStyle}>
                                        {cities.map(c => <option key={c.id} value={c.id} style={optStyle}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Precisão Mínima (%)</label>
                                    <input value={form.targetAccuracy} onChange={e => setForm(f => ({ ...f, targetAccuracy: e.target.value }))} style={inputStyle} type="number" min="1" max="100" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Pontos Bônus *</label>
                                    <input value={form.bonusPoints} onChange={e => setForm(f => ({ ...f, bonusPoints: e.target.value }))} style={inputStyle} type="number" min="1" placeholder="500" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Data de Término *</label>
                                    <input value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inputStyle} type="date" />
                                </div>
                            </div>
                            <div style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'rgba(255,215,0,0.7)' }}>
                                ⚡ O desafio será exibido no dashboard dos jogadores com countdown em tempo real.
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#f5c518,#d4a800)', color: '#1a1f2e', fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                                    {saving ? 'Criando...' : '⚡ Criar Desafio'}
                                </button>
                                <button onClick={() => setShowForm(false)} style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Chat Modal */}
            {showAIChat && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
                    <div style={{ background: '#12102e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, width: '100%', maxWidth: 640, height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Chat Header */}
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(124,58,237,0.06)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 15 }}>Assistente de Desafios</p>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Converse para criar desafios personalizados</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAIChat(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer', padding: 4 }}>✕</button>
                        </div>

                        {/* Chat Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {chatMessages.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>
                                    <p style={{ fontSize: 36, marginBottom: 12 }}>🤖</p>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Como posso ajudar?</p>
                                    <p style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
                                        Descreva o tipo de desafio que deseja criar. Eu posso sugerir títulos, descrições, pontuações e mais.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                                        {[
                                            'Crie um desafio para a Semana Santa focado em Jerusalém',
                                            'Sugira um desafio de precisão 100% com recompensa alta',
                                            'Quero um desafio temático sobre o naufrágio de Paulo em Malta',
                                        ].map((suggestion, i) => (
                                            <button key={i} onClick={() => { setChatInput(suggestion); }}
                                                style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer', textAlign: 'left', maxWidth: 300 }}>
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {chatMessages.map((msg, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
                                    <div style={{
                                        maxWidth: '85%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
                                        border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                                    }}>
                                        {msg.content}
                                    </div>
                                    {msg.challenge && (
                                        <div style={{ maxWidth: '85%', background: 'rgba(245,197,24,0.06)', border: '1px solid rgba(245,197,24,0.25)', borderRadius: 14, padding: 16, marginTop: 4 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: '#f5c518', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>⚡ Desafio Gerado</p>
                                            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{msg.challenge.title}</p>
                                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>{msg.challenge.description}</p>
                                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>🎯 {msg.challenge.targetAccuracy}% precisão</span>
                                                <span style={{ fontSize: 11, color: '#f5c518', fontWeight: 600 }}>⭐ +{msg.challenge.bonusPoints} pts</span>
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>📅 {msg.challenge.daysUntilEnd} dias</span>
                                            </div>
                                            <button onClick={() => useAIChallenge(msg.challenge)}
                                                style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#f5c518,#d4a800)', color: '#1a1f2e', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                                                ⚡ Usar Este Desafio
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {chatSending && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
                                    <div style={{ width: 24, height: 24, border: '2px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Pensando...</span>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(124,58,237,0.2)', background: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                                <textarea
                                    ref={chatInputRef}
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                                    placeholder="Descreva o desafio que quer criar..."
                                    rows={1}
                                    style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(124,58,237,0.2)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'none', maxHeight: 100 }}
                                />
                                <button onClick={sendChatMessage} disabled={chatSending || !chatInput.trim()}
                                    style={{ padding: '10px 18px', borderRadius: 12, background: chatInput.trim() ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)', border: 'none', color: chatInput.trim() ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 13, cursor: chatInput.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
                                    Enviar
                                </button>
                            </div>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>Enter para enviar · Shift+Enter para nova linha</p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
}
