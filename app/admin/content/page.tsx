'use client';

import { useState, useEffect } from 'react';

const goldBorder = '1px solid rgba(201,162,39,0.3)';
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 14 };

const EDITABLE_SECTIONS = [
    {
        id: 'homepage_hero',
        label: 'Homepage — Hero',
        fields: [
            { key: 'title', label: 'Título Principal', type: 'text', default: 'O Discípulo' },
            { key: 'subtitle', label: 'Subtítulo', type: 'textarea', default: 'Uma jornada interativa pelas cidades bíblicas.' },
            { key: 'cta_text', label: 'Texto do Botão', type: 'text', default: 'Começar Jornada' },
            { key: 'hero_image', label: 'Imagem Hero (URL)', type: 'text', default: '' },
        ],
    },
    {
        id: 'homepage_cities',
        label: 'Homepage — Seção Cidades',
        fields: [
            { key: 'section_title', label: 'Título da Seção', type: 'text', default: 'Cidades Bíblicas' },
            { key: 'section_subtitle', label: 'Subtítulo', type: 'textarea', default: 'Explore as cidades que marcaram a história do cristianismo.' },
        ],
    },
    {
        id: 'homepage_map',
        label: 'Homepage — Mapa de Paulo',
        fields: [
            { key: 'section_title', label: 'Título', type: 'text', default: 'As Rotas do Apóstolo Paulo' },
            { key: 'section_description', label: 'Descrição', type: 'textarea', default: 'Siga os passos do apóstolo Paulo em suas viagens missionárias.' },
            { key: 'map_image', label: 'Imagem Mapa (URL)', type: 'text', default: '' },
        ],
    },
    {
        id: 'dashboard',
        label: 'Dashboard — Textos',
        fields: [
            { key: 'pilgrimage_title', label: 'Título Caminho', type: 'text', default: 'PILGRIMAGE PATH' },
            { key: 'challenge_title', label: 'Título Desafio', type: 'text', default: 'DESAFIO SEMANAL' },
            { key: 'challenge_name', label: 'Nome Desafio', type: 'text', default: 'Parábolas da Luz' },
            { key: 'challenge_description', label: 'Descrição Desafio', type: 'textarea', default: 'Complete uma cidade com 100% de acertos.' },
            { key: 'challenge_reward', label: 'Recompensa', type: 'text', default: '500 pts bônus' },
        ],
    },
    {
        id: 'game',
        label: 'Jogo — Textos',
        fields: [
            { key: 'confirm_button', label: 'Botão Confirmar', type: 'text', default: 'Confirmar Resposta' },
            { key: 'correct_text', label: 'Texto Correto', type: 'text', default: 'Correto!' },
            { key: 'incorrect_text', label: 'Texto Incorreto', type: 'text', default: 'Incorreto' },
        ],
    },
    {
        id: 'results',
        label: 'Resultados — Textos',
        fields: [
            { key: 'complete_title', label: 'Título', type: 'text', default: 'Cidade Completa!' },
            { key: 'share_text', label: 'Texto Compartilhar', type: 'textarea', default: 'Completei uma cidade no jogo O Discípulo! {points} pontos com {accuracy}% de precisão.' },
        ],
    },
    {
        id: 'meta',
        label: 'SEO & Metadata',
        fields: [
            { key: 'site_title', label: 'Título do Site', type: 'text', default: 'O Discípulo — Quiz Bíblico' },
            { key: 'site_description', label: 'Meta Description', type: 'textarea', default: 'Jogo interativo de perguntas sobre cidades bíblicas e as viagens de Paulo.' },
            { key: 'og_image', label: 'OG Image URL', type: 'text', default: '' },
        ],
    },
];

// In-memory storage (will persist per session, ready for DB migration)
let contentStore: Record<string, Record<string, string>> = {};

export default function ContentPage() {
    const [activeSection, setActiveSection] = useState(EDITABLE_SECTIONS[0].id);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const section = EDITABLE_SECTIONS.find(s => s.id === activeSection)!;

    useEffect(() => {
        // Load stored values or defaults
        const stored = contentStore[activeSection] || {};
        const data: Record<string, string> = {};
        section.fields.forEach(f => {
            data[f.key] = stored[f.key] ?? f.default;
        });
        setFormData(data);
        setLoaded(true);
        setSaved(false);
    }, [activeSection]);

    const handleSave = () => {
        setSaving(true);
        contentStore[activeSection] = { ...formData };
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 400);
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Textos & Páginas</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Edite todo o conteúdo textual do app. Alterações são refletidas em tempo real.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }} className="admin-content-grid">
                {/* Section list */}
                <div style={{ ...glass, padding: 10 }}>
                    {EDITABLE_SECTIONS.map(s => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ display: 'block', width: '100%', padding: '10px 12px', borderRadius: 8, background: activeSection === s.id ? 'rgba(201,162,39,0.15)' : 'transparent', border: activeSection === s.id ? goldBorder : '1px solid transparent', color: activeSection === s.id ? '#c9a227' : 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: activeSection === s.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Editor */}
                <div style={{ ...glass, padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700 }}>{section.label}</h2>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {saved && <span style={{ fontSize: 12, color: '#27ae60', fontWeight: 600 }}>Salvo!</span>}
                            <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                                {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>

                    {loaded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {section.fields.map(field => (
                                <div key={field.key}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#c9a227', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={formData[field.key] || ''}
                                            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                            rows={3}
                                            style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: goldBorder, borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData[field.key] || ''}
                                            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: goldBorder, borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                        />
                                    )}
                                    {field.key.includes('image') && formData[field.key] && (
                                        <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', border: goldBorder, maxWidth: 300 }}>
                                            <img src={formData[field.key]} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .admin-content-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
