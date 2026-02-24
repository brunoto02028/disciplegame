'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_BLOCKS: Record<number, string> = { 1: 'Contexto Bíblico', 2: 'Geografia Atual', 3: 'Turismo & Economia' };
const DIFFICULTIES: Record<number, string> = { 1: 'Fácil', 2: 'Médio', 3: 'Difícil' };
const DIFF_COLORS: Record<number, string> = { 1: '#27ae60', 2: '#f5c518', 3: '#e74c3c' };
const QUANTITIES = [5, 10, 15, 20, 30, 50];

const emptyForm = { city_id: '', block: '1', difficulty: '1', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '' };

interface AIQuestion {
    question_text: string; option_a: string; option_b: string; option_c: string; option_d: string;
    correct_option: string; explanation: string; selected: boolean;
}

export default function AdminQuestionsPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCity, setFilterCity] = useState('');
    const [filterBlock, setFilterBlock] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // AI States
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiConfig, setAiConfig] = useState({ city_id: '', block: '1', difficulty: '1', quantity: '10', theme: '' });
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiError, setAiError] = useState('');
    const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
    const [showAIPreview, setShowAIPreview] = useState(false);
    const [aiSaving, setAiSaving] = useState(false);
    const [aiSaveProgress, setAiSaveProgress] = useState({ saved: 0, total: 0 });
    const [improvingId, setImprovingId] = useState<string | null>(null);
    const [gameBlocks, setGameBlocks] = useState<Array<{id: number; name: string; description?: string}>>([]);

    // Dynamic blocks from game rules, fallback to defaults
    const BLOCKS: Record<number, string> = gameBlocks.length > 0
        ? Object.fromEntries(gameBlocks.map(b => [b.id, b.name]))
        : DEFAULT_BLOCKS;

    const fetchData = useCallback(async () => {
        const [qRes, cRes, grRes] = await Promise.all([
            fetch('/api/admin/questions'),
            fetch('/api/admin/cities'),
            fetch('/api/admin/game-rules'),
        ]);
        if (qRes.status === 401) { router.push('/admin/login'); return; }
        const qData = await qRes.json();
        const cData = await cRes.json();
        const grData = await grRes.json();
        if (qData.success) setQuestions(qData.data);
        if (cData.success) setCities(cData.data);
        if (grData.success && grData.data?.blocks) setGameBlocks(grData.data.blocks);
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = questions.filter(q =>
        (!filterCity || q.city_id === filterCity) &&
        (!filterBlock || String(q.block) === filterBlock)
    );

    const openCreate = () => { setForm({ ...emptyForm, city_id: cities[0]?.id || '' }); setEditingId(null); setShowForm(true); };
    const openEdit = (q: any) => {
        setForm({ city_id: q.city_id, block: String(q.block), difficulty: String(q.difficulty), question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option, explanation: q.explanation || '' });
        setEditingId(q.id);
        setShowForm(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const url = editingId ? '/api/admin/questions/' + editingId : '/api/admin/questions';
        const method = editingId ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const data = await res.json();
        if (data.success) {
            setMsg(editingId ? 'Pergunta atualizada!' : 'Pergunta criada!');
            setShowForm(false);
            fetchData();
        } else {
            setMsg('Erro: ' + data.error);
        }
        setSaving(false);
        setTimeout(() => setMsg(''), 3000);
    };

    const handleDelete = async (id: string) => {
        const res = await fetch('/api/admin/questions/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) { setMsg('Pergunta deletada.'); fetchData(); }
        setDeleteConfirm(null);
        setTimeout(() => setMsg(''), 3000);
    };

    // ─── AI: Open generation modal ───
    const openAIModal = () => {
        setAiConfig({ city_id: cities[0]?.id || '', block: '1', difficulty: '1', quantity: '10', theme: '' });
        setAiError('');
        setAiQuestions([]);
        setShowAIPreview(false);
        setShowAIModal(true);
    };

    // ─── AI: Generate questions ───
    const handleAIGenerate = async () => {
        setAiGenerating(true);
        setAiError('');
        try {
            const city = cities.find(c => c.id === aiConfig.city_id);
            const res = await fetch('/api/admin/ai/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cityName: city?.name || 'Cidade',
                    cityContext: city?.description || '',
                    block: aiConfig.block,
                    difficulty: aiConfig.difficulty,
                    quantity: Number(aiConfig.quantity),
                    theme: aiConfig.theme || undefined,
                }),
            });
            const data = await res.json();
            if (data.success && data.data?.length > 0) {
                setAiQuestions(data.data.map((q: any) => ({ ...q, selected: true })));
                setShowAIPreview(true);
            } else {
                setAiError(data.error || 'Nenhuma pergunta gerada. Tente novamente.');
            }
        } catch (e: any) {
            setAiError('Erro de conexão: ' + (e.message || 'Falha na rede'));
        }
        setAiGenerating(false);
    };

    // ─── AI: Save selected generated questions ───
    const handleAISaveSelected = async () => {
        const selected = aiQuestions.filter(q => q.selected);
        if (selected.length === 0) return;
        setAiSaving(true);
        setAiSaveProgress({ saved: 0, total: selected.length });
        let savedCount = 0;
        for (const q of selected) {
            try {
                await fetch('/api/admin/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        city_id: aiConfig.city_id,
                        block: Number(aiConfig.block),
                        difficulty: Number(aiConfig.difficulty),
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_option: q.correct_option,
                        explanation: q.explanation,
                    }),
                });
                savedCount++;
                setAiSaveProgress({ saved: savedCount, total: selected.length });
            } catch { /* skip failed */ }
        }
        setAiSaving(false);
        setShowAIPreview(false);
        setShowAIModal(false);
        setMsg(`${savedCount} perguntas geradas por IA salvas com sucesso!`);
        fetchData();
        setTimeout(() => setMsg(''), 4000);
    };

    // ─── AI: Toggle select question ───
    const toggleAIQuestion = (index: number) => {
        setAiQuestions(prev => prev.map((q, i) => i === index ? { ...q, selected: !q.selected } : q));
    };
    const toggleAllAI = () => {
        const allSelected = aiQuestions.every(q => q.selected);
        setAiQuestions(prev => prev.map(q => ({ ...q, selected: !allSelected })));
    };

    // ─── AI: Improve existing question ───
    const handleImprove = async (q: any, action: string) => {
        setImprovingId(q.id);
        try {
            const res = await fetch('/api/admin/ai/improve-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_text: q.question_text,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    correct_option: q.correct_option,
                    explanation: q.explanation,
                    action,
                }),
            });
            const data = await res.json();
            if (data.success && data.data) {
                // Open edit form with improved data
                setForm({
                    city_id: q.city_id,
                    block: String(q.block),
                    difficulty: String(q.difficulty),
                    question_text: data.data.question_text,
                    option_a: data.data.option_a,
                    option_b: data.data.option_b,
                    option_c: data.data.option_c,
                    option_d: data.data.option_d,
                    correct_option: data.data.correct_option,
                    explanation: data.data.explanation,
                });
                setEditingId(q.id);
                setShowForm(true);
                setMsg('IA melhorou a pergunta. Revise e salve.');
                setTimeout(() => setMsg(''), 4000);
            } else {
                setMsg('Erro: ' + (data.error || 'Falha ao melhorar'));
                setTimeout(() => setMsg(''), 3000);
            }
        } catch {
            setMsg('Erro de conexão com a IA.');
            setTimeout(() => setMsg(''), 3000);
        }
        setImprovingId(null);
    };

    // ─── AI: Edit a preview question inline ───
    const updateAIQuestion = (index: number, field: string, value: string) => {
        setAiQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
    };

    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' as const, WebkitAppearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23c9a227' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28, cursor: 'pointer' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.8 };
    const optStyle: React.CSSProperties = { background: '#1a1045', color: '#fff' };
    const aiBtn: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(124,58,237,0.3)' };

    const selectedCount = aiQuestions.filter(q => q.selected).length;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Gerenciar Perguntas</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{questions.length} perguntas no total</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={openAIModal} style={aiBtn}>
                        🤖 Gerar com IA
                    </button>
                    <button onClick={openCreate} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        ➕ Nova Pergunta
                    </button>
                </div>
            </div>

            {msg && <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: msg.startsWith('Erro') ? 'rgba(231,76,60,0.15)' : 'rgba(39,174,96,0.15)', border: '1px solid ' + (msg.startsWith('Erro') ? 'rgba(231,76,60,0.4)' : 'rgba(39,174,96,0.4)'), color: msg.startsWith('Erro') ? '#e74c3c' : '#2ecc71', fontSize: 13 }}>{msg}</div>}

            {/* Filters */}
            <div style={{ ...glass, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' as const }}>
                <select value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{ ...selectStyle, width: 'auto', minWidth: 160 }}>
                    <option value="" style={optStyle}>Todas as cidades</option>
                    {cities.map(c => <option key={c.id} value={c.id} style={optStyle}>{c.name}</option>)}
                </select>
                <select value={filterBlock} onChange={e => setFilterBlock(e.target.value)} style={{ ...selectStyle, width: 'auto', minWidth: 160 }}>
                    <option value="" style={optStyle}>Todos os blocos</option>
                    {Object.entries(BLOCKS).map(([k, v]) => <option key={k} value={k} style={optStyle}>{v}</option>)}
                </select>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 'auto' }}>{filtered.length} resultado(s)</span>
            </div>

            {/* Questions list */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(q => {
                        const city = cities.find((c: any) => c.id === q.city_id);
                        const isImproving = improvingId === q.id;
                        return (
                            <div key={q.id} style={{ ...glass, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16, opacity: isImproving ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' as const }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.4)', borderRadius: 20, padding: '2px 10px', color: '#c9a227' }}>{city?.name || '?'}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '2px 10px', color: 'rgba(255,255,255,0.6)' }}>{BLOCKS[q.block as keyof typeof BLOCKS]}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: DIFF_COLORS[q.difficulty as keyof typeof DIFF_COLORS], background: `${DIFF_COLORS[q.difficulty as keyof typeof DIFF_COLORS]}20`, border: `1px solid ${DIFF_COLORS[q.difficulty as keyof typeof DIFF_COLORS]}40`, borderRadius: 20, padding: '2px 10px' }}>{DIFFICULTIES[q.difficulty as keyof typeof DIFFICULTIES]}</span>
                                    </div>
                                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{q.question_text}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                        {['A', 'B', 'C', 'D'].map(l => (
                                            <p key={l} style={{ fontSize: 12, color: q.correct_option === l ? '#2ecc71' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ width: 18, height: 18, borderRadius: '50%', background: q.correct_option === l ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{l}</span>
                                                {q['option_' + l.toLowerCase()]}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => openEdit(q)} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✏️ Editar</button>
                                        {deleteConfirm === q.id ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => handleDelete(q.id)} style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(231,76,60,0.2)', border: '1px solid rgba(231,76,60,0.4)', color: '#e74c3c', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Confirmar</button>
                                                <button onClick={() => setDeleteConfirm(null)} style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setDeleteConfirm(q.id)} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)', color: '#e74c3c', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🗑️</button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleImprove(q, 'improve_all')}
                                        disabled={isImproving}
                                        style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', fontSize: 11, fontWeight: 600, cursor: isImproving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}
                                    >
                                        {isImproving ? (
                                            <><div style={{ width: 12, height: 12, border: '2px solid rgba(167,139,250,0.3)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Melhorando...</>
                                        ) : '🤖 Melhorar com IA'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.3)' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>❓</div>
                            <p>Nenhuma pergunta encontrada.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════ MODAL: Manual Create/Edit Form ═══════════ */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '28px 28px', width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 20, fontWeight: 700 }}>{editingId ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="admin-q-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Cidade *</label>
                                    <select value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} style={selectStyle}>
                                        {cities.map(c => <option key={c.id} value={c.id} style={optStyle}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Bloco *</label>
                                    <select value={form.block} onChange={e => setForm(f => ({ ...f, block: e.target.value }))} style={selectStyle}>
                                        {Object.entries(BLOCKS).map(([k, v]) => <option key={k} value={k} style={optStyle}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Dificuldade *</label>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {Object.entries(DIFFICULTIES).map(([k, v]) => (
                                            <button key={k} type="button" onClick={() => setForm(f => ({ ...f, difficulty: k }))}
                                                style={{ flex: 1, padding: '9px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: form.difficulty === k ? `2px solid ${DIFF_COLORS[Number(k) as keyof typeof DIFF_COLORS]}` : '1px solid rgba(255,255,255,0.12)', background: form.difficulty === k ? `${DIFF_COLORS[Number(k) as keyof typeof DIFF_COLORS]}20` : 'rgba(255,255,255,0.06)', color: form.difficulty === k ? DIFF_COLORS[Number(k) as keyof typeof DIFF_COLORS] : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}>
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Pergunta *</label>
                                <textarea value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} placeholder="Digite a pergunta..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {(['A', 'B', 'C', 'D'] as const).map(l => (
                                    <div key={l}>
                                        <label style={{ ...labelStyle, color: form.correct_option === l ? '#2ecc71' : 'rgba(255,255,255,0.5)' }}>Opção {l} {form.correct_option === l ? '✓ CORRETA' : ''}</label>
                                        <input value={form['option_' + l.toLowerCase() as keyof typeof form]} onChange={e => setForm(f => ({ ...f, ['option_' + l.toLowerCase()]: e.target.value }))} style={{ ...inputStyle, borderColor: form.correct_option === l ? 'rgba(39,174,96,0.5)' : 'rgba(255,255,255,0.15)' }} placeholder={'Opção ' + l} />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label style={labelStyle}>Resposta Correta *</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {(['A', 'B', 'C', 'D'] as const).map(l => (
                                        <button key={l} type="button" onClick={() => setForm(f => ({ ...f, correct_option: l }))}
                                            style={{ flex: 1, padding: '10px', borderRadius: 8, background: form.correct_option === l ? 'rgba(39,174,96,0.25)' : 'rgba(255,255,255,0.06)', border: '1.5px solid ' + (form.correct_option === l ? 'rgba(39,174,96,0.6)' : 'rgba(255,255,255,0.12)'), color: form.correct_option === l ? '#2ecc71' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Explicação</label>
                                <textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} placeholder="Explicação exibida após a resposta..." />
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                                    {saving ? 'Salvando...' : editingId ? '✓ Salvar Alterações' : '➕ Criar Pergunta'}
                                </button>
                                <button onClick={() => setShowForm(false)} style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ MODAL: AI Generation ═══════════ */}
            {showAIModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
                    <div style={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: showAIPreview ? 900 : 560, maxHeight: '92vh', overflowY: 'auto', transition: 'max-width 0.3s' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                                <div>
                                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 20, fontWeight: 700 }}>
                                        {showAIPreview ? 'Revisar Perguntas Geradas' : 'Gerar Perguntas com IA'}
                                    </h2>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                        {showAIPreview ? `${aiQuestions.length} perguntas geradas · ${selectedCount} selecionadas` : 'Google Gemini · Geração inteligente'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { setShowAIModal(false); setShowAIPreview(false); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                        </div>

                        {/* ── Step 1: Configuration ── */}
                        {!showAIPreview && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="admin-q-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={labelStyle}>Cidade *</label>
                                        <select value={aiConfig.city_id} onChange={e => setAiConfig(f => ({ ...f, city_id: e.target.value }))} style={selectStyle}>
                                            {cities.map(c => <option key={c.id} value={c.id} style={optStyle}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Bloco Temático *</label>
                                        <select value={aiConfig.block} onChange={e => setAiConfig(f => ({ ...f, block: e.target.value }))} style={selectStyle}>
                                            {Object.entries(BLOCKS).map(([k, v]) => <option key={k} value={k} style={optStyle}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Dificuldade *</label>
                                        <select value={aiConfig.difficulty} onChange={e => setAiConfig(f => ({ ...f, difficulty: e.target.value }))} style={selectStyle}>
                                            {Object.entries(DIFFICULTIES).map(([k, v]) => <option key={k} value={k} style={optStyle}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Quantidade *</label>
                                        <select value={aiConfig.quantity} onChange={e => setAiConfig(f => ({ ...f, quantity: e.target.value }))} style={selectStyle}>
                                            {QUANTITIES.map(n => <option key={n} value={String(n)} style={optStyle}>{n} perguntas</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Tema Específico (opcional)</label>
                                    <input
                                        value={aiConfig.theme}
                                        onChange={e => setAiConfig(f => ({ ...f, theme: e.target.value }))}
                                        style={inputStyle}
                                        placeholder='Ex: "milagres de Paulo", "gastronomia local", "arqueologia moderna"...'
                                    />
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Deixe vazio para tema geral do bloco selecionado</p>
                                </div>

                                {aiError && (
                                    <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', fontSize: 13 }}>{aiError}</div>
                                )}

                                <button onClick={handleAIGenerate} disabled={aiGenerating} style={{ ...aiBtn, width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, opacity: aiGenerating ? 0.7 : 1, cursor: aiGenerating ? 'wait' : 'pointer' }}>
                                    {aiGenerating ? (
                                        <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Gerando {aiConfig.quantity} perguntas com Gemini...</>
                                    ) : (
                                        <>🤖 Gerar {aiConfig.quantity} Perguntas</>
                                    )}
                                </button>

                                <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '14px 16px' }}>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginBottom: 6 }}>💡 Dicas para melhores resultados:</p>
                                    <ul style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0, paddingLeft: 16 }}>
                                        <li>Use o campo &quot;Tema Específico&quot; para perguntas mais focadas</li>
                                        <li>Gere em lotes de 10-20 para melhor qualidade</li>
                                        <li>Sempre revise as perguntas antes de salvar</li>
                                        <li>Combine diferentes blocos e dificuldades para variedade</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Preview & Review ── */}
                        {showAIPreview && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {/* Toolbar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                                    <button onClick={toggleAllAI} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                        {aiQuestions.every(q => q.selected) ? '☐ Desmarcar Todas' : '☑ Selecionar Todas'}
                                    </button>
                                    <button onClick={() => { setShowAIPreview(false); setAiQuestions([]); }} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                        🔄 Gerar Novamente
                                    </button>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 'auto' }}>
                                        Cidade: <strong style={{ color: '#c9a227' }}>{cities.find(c => c.id === aiConfig.city_id)?.name}</strong> · {BLOCKS[Number(aiConfig.block)]} · {DIFFICULTIES[Number(aiConfig.difficulty)]}
                                    </span>
                                </div>

                                {/* Questions preview list */}
                                {aiQuestions.map((q, idx) => (
                                    <div key={idx} style={{ ...glass, padding: '14px 16px', opacity: q.selected ? 1 : 0.45, transition: 'opacity 0.2s', border: q.selected ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                            {/* Checkbox */}
                                            <button onClick={() => toggleAIQuestion(idx)} style={{ width: 28, height: 28, borderRadius: 8, background: q.selected ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)', border: '1.5px solid ' + (q.selected ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.15)'), color: q.selected ? '#a78bfa' : 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {q.selected ? '✓' : ''}
                                            </button>
                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', background: 'rgba(124,58,237,0.15)', padding: '1px 8px', borderRadius: 10 }}>#{idx + 1}</span>
                                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Resposta: <strong style={{ color: '#2ecc71' }}>{q.correct_option}</strong></span>
                                                </div>
                                                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{q.question_text}</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                                    {['A', 'B', 'C', 'D'].map(l => (
                                                        <p key={l} style={{ fontSize: 11, color: q.correct_option === l ? '#2ecc71' : 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <span style={{ width: 16, height: 16, borderRadius: '50%', background: q.correct_option === l ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{l}</span>
                                                            {q[('option_' + l.toLowerCase()) as keyof AIQuestion] as string}
                                                        </p>
                                                    ))}
                                                </div>
                                                {q.explanation && (
                                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, fontStyle: 'italic' }}>💡 {q.explanation}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Save bar */}
                                <div style={{ display: 'flex', gap: 10, marginTop: 8, position: 'sticky', bottom: 0, background: '#1a1a2e', padding: '12px 0 4px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                    {aiSaving ? (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                                <div style={{ width: `${(aiSaveProgress.saved / aiSaveProgress.total) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', borderRadius: 4, transition: 'width 0.3s' }} />
                                            </div>
                                            <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, whiteSpace: 'nowrap' }}>{aiSaveProgress.saved}/{aiSaveProgress.total}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <button onClick={handleAISaveSelected} disabled={selectedCount === 0} style={{ ...aiBtn, flex: 1, justifyContent: 'center', padding: '14px', fontSize: 14, opacity: selectedCount === 0 ? 0.4 : 1, cursor: selectedCount === 0 ? 'not-allowed' : 'pointer' }}>
                                                💾 Salvar {selectedCount} Pergunta{selectedCount !== 1 ? 's' : ''} Selecionada{selectedCount !== 1 ? 's' : ''}
                                            </button>
                                            <button onClick={() => { setShowAIModal(false); setShowAIPreview(false); }} style={{ padding: '14px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 640px) {
                    .admin-q-form-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
