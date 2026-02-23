'use client';

import { useState } from 'react';

const goldBorder = '1px solid rgba(201,162,39,0.3)';
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 14 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 13, border: goldBorder, borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    stripePriceId: string;
    active: boolean;
    subscribers: number;
}

const DEFAULT_PLANS: Plan[] = [
    { id: 'free', name: 'Grátis', price: 0, currency: 'BRL', interval: 'month', features: ['3 cidades iniciais', '9 perguntas por cidade', 'Ranking global', 'Conquistas básicas'], stripePriceId: '', active: true, subscribers: 142 },
    { id: 'premium', name: 'Premium', price: 19.90, currency: 'BRL', interval: 'month', features: ['Todas as cidades', '27+ perguntas por cidade', 'Desafios exclusivos', 'Sem anúncios', 'Conteúdo histórico extra', 'Certificado de conclusão', 'Suporte prioritário'], stripePriceId: 'price_xxxx', active: true, subscribers: 23 },
    { id: 'premium_annual', name: 'Premium Anual', price: 149.90, currency: 'BRL', interval: 'year', features: ['Tudo do Premium', '2 meses grátis', 'Acesso antecipado a novos circuitos', 'Badge exclusivo no perfil'], stripePriceId: 'price_yyyy', active: true, subscribers: 8 },
    { id: 'church', name: 'Igreja / Grupo', price: 49.90, currency: 'BRL', interval: 'month', features: ['Até 50 membros', 'Dashboard do grupo', 'Ranking interno', 'Relatórios de progresso', 'Desafios personalizados', 'Suporte dedicado'], stripePriceId: 'price_zzzz', active: false, subscribers: 0 },
];

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Plan | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newPlan, setNewPlan] = useState<Partial<Plan>>({ name: '', price: 0, currency: 'BRL', interval: 'month', features: [], stripePriceId: '', active: false });
    const [newFeature, setNewFeature] = useState('');
    const [editFeature, setEditFeature] = useState('');
    const [saved, setSaved] = useState('');

    const totalRevenue = plans.reduce((sum, p) => sum + (p.price * p.subscribers * (p.interval === 'year' ? 1 : 1)), 0);
    const totalSubscribers = plans.reduce((sum, p) => sum + p.subscribers, 0);
    const paidSubscribers = plans.filter(p => p.price > 0).reduce((sum, p) => sum + p.subscribers, 0);

    const startEdit = (p: Plan) => { setEditingId(p.id); setEditData({ ...p }); };
    const cancelEdit = () => { setEditingId(null); setEditData(null); };

    const saveEdit = () => {
        if (!editData) return;
        setPlans(prev => prev.map(p => p.id === editData.id ? editData : p));
        setEditingId(null); setEditData(null);
        setSaved('Plano atualizado!'); setTimeout(() => setSaved(''), 2000);
    };

    const toggleActive = (id: string) => {
        if (id === 'free') return;
        setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    const addNewPlan = () => {
        if (!newPlan.name) return;
        const id = newPlan.name!.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        setPlans(prev => [...prev, { ...newPlan, id, subscribers: 0 } as Plan]);
        setNewPlan({ name: '', price: 0, currency: 'BRL', interval: 'month', features: [], stripePriceId: '', active: false });
        setShowCreate(false);
        setSaved('Plano criado!'); setTimeout(() => setSaved(''), 2000);
    };

    const addFeatureToNew = () => {
        if (!newFeature) return;
        setNewPlan(prev => ({ ...prev, features: [...(prev.features || []), newFeature] }));
        setNewFeature('');
    };

    const addFeatureToEdit = () => {
        if (!editFeature || !editData) return;
        setEditData({ ...editData, features: [...editData.features, editFeature] });
        setEditFeature('');
    };

    const removeFeatureFromEdit = (i: number) => {
        if (!editData) return;
        setEditData({ ...editData, features: editData.features.filter((_, idx) => idx !== i) });
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Planos & Assinaturas</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Gerencie planos de membros e integre com Stripe para pagamentos.</p>
            </div>

            {saved && <div style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', color: '#27ae60', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{saved}</div>}

            {/* Revenue overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'RECEITA MENSAL', value: `R$ ${totalRevenue.toFixed(2)}`, icon: '💰', color: '#c9a227' },
                    { label: 'TOTAL ASSINANTES', value: String(totalSubscribers), icon: '👥', color: '#c9a227' },
                    { label: 'ASSINANTES PAGOS', value: String(paidSubscribers), icon: '💎', color: '#27ae60' },
                    { label: 'PLANOS ATIVOS', value: String(plans.filter(p => p.active).length), icon: '📋', color: '#d4b84a' },
                ].map(s => (
                    <div key={s.label} style={{ ...glass, padding: '16px 18px' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: s.color, marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 24, fontWeight: 800 }}>{s.value}</p>
                            <span style={{ fontSize: 22, opacity: 0.5 }}>{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add plan button */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => setShowCreate(!showCreate)} style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: goldBorder, color: '#c9a227', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    + Criar Novo Plano
                </button>
            </div>

            {/* Create new plan */}
            {showCreate && (
                <div style={{ ...glass, padding: 24, marginBottom: 20, maxWidth: 600 }}>
                    <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Novo Plano</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-plans-new-grid">
                            <div>
                                <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Nome</label>
                                <input value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="Ex: Premium Plus" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Preco (R$)</label>
                                <input type="number" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Periodo</label>
                                <select value={newPlan.interval} onChange={e => setNewPlan({ ...newPlan, interval: e.target.value as any })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="month" style={{ background: '#1a0a4a' }}>Mensal</option>
                                    <option value="year" style={{ background: '#1a0a4a' }}>Anual</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Stripe Price ID</label>
                                <input value={newPlan.stripePriceId} onChange={e => setNewPlan({ ...newPlan, stripePriceId: e.target.value })} placeholder="price_xxx" style={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Features</label>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeatureToNew()} placeholder="Adicionar feature..." style={{ ...inputStyle, flex: 1 }} />
                                <button onClick={addFeatureToNew} style={{ padding: '0 14px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: goldBorder, color: '#c9a227', fontSize: 16, cursor: 'pointer' }}>+</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {(newPlan.features || []).map((f, i) => (
                                    <span key={i} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                                        {f} <button onClick={() => setNewPlan({ ...newPlan, features: newPlan.features!.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}>x</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={addNewPlan} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Criar Plano</button>
                            <button onClick={() => setShowCreate(false)} style={{ padding: '9px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Plans grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                {plans.map(plan => (
                    <div key={plan.id} style={{ ...glass, padding: 20, opacity: plan.active ? 1 : 0.6, position: 'relative' }}>
                        {editingId === plan.id && editData ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} style={inputStyle} />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })} style={{ ...inputStyle, flex: 1 }} />
                                    <select value={editData.interval} onChange={e => setEditData({ ...editData, interval: e.target.value as any })} style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}>
                                        <option value="month" style={{ background: '#1a0a4a' }}>Mensal</option>
                                        <option value="year" style={{ background: '#1a0a4a' }}>Anual</option>
                                    </select>
                                </div>
                                <input value={editData.stripePriceId} onChange={e => setEditData({ ...editData, stripePriceId: e.target.value })} placeholder="Stripe Price ID" style={inputStyle} />
                                <div>
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                                        <input value={editFeature} onChange={e => setEditFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeatureToEdit()} placeholder="+ feature" style={{ ...inputStyle, flex: 1 }} />
                                        <button onClick={addFeatureToEdit} style={{ padding: '0 10px', borderRadius: 6, background: 'rgba(201,162,39,0.1)', border: goldBorder, color: '#c9a227', cursor: 'pointer' }}>+</button>
                                    </div>
                                    {editData.features.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>• {f}</span>
                                            <button onClick={() => removeFeatureFromEdit(i)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 11 }}>x</button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={saveEdit} style={{ padding: '7px 14px', borderRadius: 6, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}>Salvar</button>
                                    <button onClick={cancelEdit} style={{ padding: '7px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}>Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700 }}>{plan.name}</h3>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {plan.id !== 'free' && (
                                            <button onClick={() => toggleActive(plan.id)} style={{ width: 36, height: 20, borderRadius: 10, background: plan.active ? '#27ae60' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative' }}>
                                                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: plan.active ? 19 : 3, transition: 'left 0.2s' }} />
                                            </button>
                                        )}
                                        <button onClick={() => startEdit(plan)} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 10, cursor: 'pointer' }}>Editar</button>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, color: plan.price === 0 ? '#27ae60' : '#c9a227' }}>
                                        {plan.price === 0 ? 'Gratis' : `R$ ${plan.price.toFixed(2)}`}
                                    </span>
                                    {plan.price > 0 && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/{plan.interval === 'month' ? 'mes' : 'ano'}</span>}
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    {plan.features.map((f, i) => (
                                        <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ color: '#c9a227', fontSize: 10 }}>✓</span> {f}
                                        </p>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{plan.subscribers} assinantes</span>
                                    {plan.stripePriceId && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{plan.stripePriceId}</span>}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .admin-plans-new-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
