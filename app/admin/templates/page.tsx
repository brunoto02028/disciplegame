'use client';

import { useState } from 'react';

const goldBorder = '1px solid rgba(201,162,39,0.3)';
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 14 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 13, border: goldBorder, borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const };

interface Template {
    id: string;
    name: string;
    trigger: string;
    subject: string;
    body: string;
    channel: 'email' | 'whatsapp' | 'both';
    enabled: boolean;
}

const DEFAULT_TEMPLATES: Template[] = [
    { id: '1', name: 'Boas-vindas', trigger: 'user_register', subject: 'Bem-vindo ao O Discípulo, {name}!', body: 'Olá {name}!\n\nSeja bem-vindo ao O Discípulo! Sua jornada pelas cidades bíblicas começa agora.\n\nComece jogando em Jerusalém e descubra o contexto histórico das escrituras.\n\nBoa jornada!\nEquipe O Discípulo', channel: 'both', enabled: true },
    { id: '2', name: 'Cidade Completa', trigger: 'city_complete', subject: 'Parabéns! Você completou {city}!', body: 'Olá {name}!\n\nVocê completou {city} com {accuracy}% de precisão e {points} pontos!\n\nSua posição no ranking: #{rank}\n\nContinue sua peregrinação!', channel: 'email', enabled: true },
    { id: '3', name: 'Conquista Desbloqueada', trigger: 'achievement_unlock', subject: 'Nova conquista desbloqueada!', body: 'Olá {name}!\n\nVocê desbloqueou uma nova conquista: {achievement_name}!\n\n{achievement_description}\n\nContinue jogando para desbloquear mais!', channel: 'email', enabled: true },
    { id: '4', name: 'Desafio Semanal', trigger: 'weekly_challenge', subject: 'Novo desafio semanal disponível!', body: 'Olá {name}!\n\nUm novo desafio semanal está disponível: {challenge_name}\n\n{challenge_description}\n\nRecompensa: {reward} pontos bônus\n\nAceite o desafio agora!', channel: 'both', enabled: true },
    { id: '5', name: 'Usuário Inativo', trigger: 'user_inactive_7d', subject: 'Sentimos sua falta, {name}!', body: 'Olá {name}!\n\nFaz uma semana que você não joga. Suas cidades bíblicas estão esperando!\n\nVocê tem {points} pontos e está na posição #{rank}.\n\nVolte e continue sua jornada!', channel: 'both', enabled: false },
    { id: '6', name: 'Assinatura Confirmada', trigger: 'subscription_created', subject: 'Assinatura Premium confirmada!', body: 'Olá {name}!\n\nSua assinatura Premium foi confirmada com sucesso!\n\nAgora você tem acesso a:\n- Todas as cidades\n- Conteúdo exclusivo\n- Sem anúncios\n\nAproveite!', channel: 'email', enabled: true },
    { id: '7', name: 'Pagamento Falhou', trigger: 'payment_failed', subject: 'Problema com seu pagamento', body: 'Olá {name}!\n\nHouve um problema ao processar seu pagamento.\n\nPor favor, atualize seus dados de pagamento para continuar com o plano Premium.\n\nSe precisar de ajuda, entre em contato.', channel: 'both', enabled: true },
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Template | null>(null);
    const [saved, setSaved] = useState('');

    const startEdit = (t: Template) => {
        setEditingId(t.id);
        setEditData({ ...t });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData(null);
    };

    const saveEdit = () => {
        if (!editData) return;
        setTemplates(prev => prev.map(t => t.id === editData.id ? editData : t));
        setEditingId(null);
        setEditData(null);
        setSaved('Template salvo!');
        setTimeout(() => setSaved(''), 2000);
    };

    const toggleEnabled = (id: string) => {
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    };

    const triggerLabels: Record<string, string> = {
        user_register: 'Cadastro',
        city_complete: 'Cidade Completa',
        achievement_unlock: 'Conquista',
        weekly_challenge: 'Desafio Semanal',
        user_inactive_7d: 'Inativo 7 dias',
        subscription_created: 'Assinatura',
        payment_failed: 'Pagamento Falhou',
    };

    const channelIcons: Record<string, string> = { email: '📧', whatsapp: '💬', both: '📧💬' };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Templates de Comunicacao</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Configure mensagens automaticas para cada acao do usuario. Use variaveis como {'{name}'}, {'{points}'}, {'{city}'}.</p>
            </div>

            {saved && <div style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', color: '#27ae60', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{saved}</div>}

            {/* Templates list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {templates.map(t => (
                    <div key={t.id} style={{ ...glass, padding: editingId === t.id ? 24 : '16px 20px', opacity: t.enabled ? 1 : 0.6 }}>
                        {editingId === t.id && editData ? (
                            /* Edit mode */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                    <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 16, fontWeight: 700 }}>Editando: {t.name}</h3>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={saveEdit} style={{ padding: '7px 16px', borderRadius: 6, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Salvar</button>
                                        <button onClick={cancelEdit} style={{ padding: '7px 16px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="admin-template-edit-grid">
                                    <div>
                                        <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Nome</label>
                                        <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Canal</label>
                                        <select value={editData.channel} onChange={e => setEditData({ ...editData, channel: e.target.value as any })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                            <option value="email" style={{ background: '#1a0a4a' }}>Email</option>
                                            <option value="whatsapp" style={{ background: '#1a0a4a' }}>WhatsApp</option>
                                            <option value="both" style={{ background: '#1a0a4a' }}>Ambos</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Assunto (email)</label>
                                    <input value={editData.subject} onChange={e => setEditData({ ...editData, subject: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Corpo da Mensagem</label>
                                    <textarea value={editData.body} onChange={e => setEditData({ ...editData, body: e.target.value })} rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
                                </div>
                            </div>
                        ) : (
                            /* View mode */
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }} className="admin-template-row">
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(201,162,39,0.1)', border: goldBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                    {channelIcons[t.channel]}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(201,162,39,0.1)', border: goldBorder, color: '#c9a227' }}>{triggerLabels[t.trigger] || t.trigger}</span>
                                    </div>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => toggleEnabled(t.id)} style={{ width: 40, height: 22, borderRadius: 11, background: t.enabled ? '#27ae60' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: t.enabled ? 21 : 3, transition: 'left 0.2s' }} />
                                    </button>
                                    <button onClick={() => startEdit(t)} style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}>Editar</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .admin-template-row { flex-wrap: wrap !important; }
                    .admin-template-edit-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
