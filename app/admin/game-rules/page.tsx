'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGameRulesPage() {
    const router = useRouter();
    const [rules, setRules] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchRules = useCallback(async () => {
        const res = await fetch('/api/admin/game-rules');
        if (res.status === 401) { router.push('/admin/login'); return; }
        const data = await res.json();
        if (data.success) setRules(data.data);
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchRules(); }, [fetchRules]);

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch('/api/admin/game-rules', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rules),
        });
        const data = await res.json();
        if (data.success) { setMsg('Regras salvas!'); setRules(data.data); }
        else { setMsg('Erro: ' + data.error); }
        setSaving(false); setTimeout(() => setMsg(''), 3000);
    };

    const updateBlock = (index: number, key: string, value: string) => {
        setRules(r => {
            const blocks = [...(r.blocks || [])];
            blocks[index] = { ...blocks[index], [key]: value };
            return { ...r, blocks };
        });
    };

    const addBlock = () => {
        setRules(r => {
            const blocks = [...(r.blocks || [])];
            const maxId = Math.max(0, ...blocks.map((b: any) => b.id));
            blocks.push({ id: maxId + 1, name: '', description: '' });
            return { ...r, blocks };
        });
    };

    const removeBlock = (index: number) => {
        setRules(r => {
            const blocks = [...(r.blocks || [])];
            blocks.splice(index, 1);
            return { ...r, blocks };
        });
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: 0.8 };
    const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px' };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Regras do Jogo</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Configure tempo, pontuação, blocos e dificuldade</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Salvando...' : '💾 Salvar Regras'}
                </button>
            </div>

            {msg && <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: msg.startsWith('Erro') ? 'rgba(231,76,60,0.15)' : 'rgba(39,174,96,0.15)', border: '1px solid ' + (msg.startsWith('Erro') ? 'rgba(231,76,60,0.4)' : 'rgba(39,174,96,0.4)'), color: msg.startsWith('Erro') ? '#e74c3c' : '#2ecc71', fontSize: 13 }}>{msg}</div>}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : (
                <div className="rules-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Tempo e Perguntas */}
                    <div style={glass}>
                        <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#c9a227' }}>⏱️ Tempo e Estrutura</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Tempo por Pergunta (segundos)</label>
                                <input type="number" value={rules.time_per_question || 30} onChange={e => setRules(r => ({ ...r, time_per_question: parseInt(e.target.value) || 30 }))} style={inputStyle} min={10} max={120} />
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Quanto tempo o jogador tem para responder</p>
                            </div>
                            <div>
                                <label style={labelStyle}>Perguntas por Partida</label>
                                <input type="number" value={rules.questions_per_game || 9} onChange={e => setRules(r => ({ ...r, questions_per_game: parseInt(e.target.value) || 9 }))} style={inputStyle} min={3} max={30} />
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Total de perguntas por sessão de jogo</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <button onClick={() => setRules(r => ({ ...r, progressive_difficulty: !r.progressive_difficulty }))} style={{ width: 44, height: 24, borderRadius: 12, background: rules.progressive_difficulty ? '#2ecc71' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: rules.progressive_difficulty ? 23 : 3, transition: 'left 0.2s' }} />
                                </button>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: rules.progressive_difficulty ? '#2ecc71' : 'rgba(255,255,255,0.4)' }}>Dificuldade Progressiva</p>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Perguntas ficam mais difíceis ao longo da partida</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pontuação */}
                    <div style={glass}>
                        <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#c9a227' }}>🏆 Pontuação</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Pontos - Pergunta Fácil</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>🟢</span>
                                    <input type="number" value={rules.points_easy || 100} onChange={e => setRules(r => ({ ...r, points_easy: parseInt(e.target.value) || 100 }))} style={inputStyle} min={0} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Pontos - Pergunta Média</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>🟡</span>
                                    <input type="number" value={rules.points_medium || 200} onChange={e => setRules(r => ({ ...r, points_medium: parseInt(e.target.value) || 200 }))} style={inputStyle} min={0} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Pontos - Pergunta Difícil</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>🔴</span>
                                    <input type="number" value={rules.points_hard || 300} onChange={e => setRules(r => ({ ...r, points_hard: parseInt(e.target.value) || 300 }))} style={inputStyle} min={0} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Penalidade por Erro</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>❌</span>
                                    <input type="number" value={rules.penalty_wrong || 0} onChange={e => setRules(r => ({ ...r, penalty_wrong: parseInt(e.target.value) || 0 }))} style={inputStyle} min={0} />
                                </div>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Pontos perdidos ao errar (0 = sem penalidade)</p>
                            </div>
                        </div>
                    </div>

                    {/* Blocos Temáticos - full width */}
                    <div style={{ ...glass, gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 16, fontWeight: 700, color: '#c9a227' }}>📚 Blocos Temáticos ({(rules.blocks || []).length})</h3>
                            <button onClick={addBlock} style={{ padding: '7px 16px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                ➕ Novo Bloco
                            </button>
                        </div>
                        <div className="blocks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
                            {(rules.blocks || []).map((block: any, i: number) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#1a0a4a' }}>{block.id}</div>
                                        {(rules.blocks || []).length > 1 && (
                                            <button onClick={() => removeBlock(i)} style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#e74c3c', fontSize: 10, cursor: 'pointer' }}>🗑️</button>
                                        )}
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label style={{ ...labelStyle, marginBottom: 3 }}>Nome</label>
                                        <input value={block.name || ''} onChange={e => updateBlock(i, 'name', e.target.value)} style={inputStyle} placeholder="Ex: Arqueologia" />
                                    </div>
                                    <div>
                                        <label style={{ ...labelStyle, marginBottom: 3 }}>Descrição</label>
                                        <input value={block.description || ''} onChange={e => updateBlock(i, 'description', e.target.value)} style={inputStyle} placeholder="Breve descrição do bloco" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .rules-grid { grid-template-columns: 1fr !important; }
                    .blocks-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
