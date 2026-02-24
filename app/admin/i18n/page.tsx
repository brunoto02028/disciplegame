'use client';

import { useState, useEffect } from 'react';

const goldBorder = '1px solid rgba(201,162,39,0.3)';
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 14 };

const LANGUAGES = [
    { code: 'pt', label: 'Português', flag: '🇧🇷', enabled: true },
    { code: 'en', label: 'English', flag: '🇺🇸', enabled: false },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷', enabled: false },
];

const TRANSLATION_SECTIONS = [
    {
        id: 'nav',
        label: 'Navegação',
        keys: [
            { key: 'home', pt: 'Início', en: 'Home', tr: 'Ana Sayfa' },
            { key: 'dashboard', pt: 'Dashboard', en: 'Dashboard', tr: 'Kontrol Paneli' },
            { key: 'ranking', pt: 'Ranking', en: 'Ranking', tr: 'Siralama' },
            { key: 'profile', pt: 'Perfil', en: 'Profile', tr: 'Profil' },
            { key: 'play', pt: 'Jogar', en: 'Play', tr: 'Oyna' },
        ],
    },
    {
        id: 'game',
        label: 'Jogo',
        keys: [
            { key: 'confirm_answer', pt: 'Confirmar Resposta', en: 'Confirm Answer', tr: 'Cevabi Onayla' },
            { key: 'correct', pt: 'Correto!', en: 'Correct!', tr: 'Dogru!' },
            { key: 'incorrect', pt: 'Incorreto', en: 'Incorrect', tr: 'Yanlis' },
            { key: 'next_question', pt: 'Próxima Pergunta', en: 'Next Question', tr: 'Sonraki Soru' },
            { key: 'time', pt: 'Tempo', en: 'Time', tr: 'Zaman' },
            { key: 'points', pt: 'Pontos', en: 'Points', tr: 'Puan' },
            { key: 'streak', pt: 'Sequência', en: 'Streak', tr: 'Seri' },
        ],
    },
    {
        id: 'results',
        label: 'Resultados',
        keys: [
            { key: 'city_complete', pt: 'Cidade Completa!', en: 'City Complete!', tr: 'Sehir Tamamlandi!' },
            { key: 'total_score', pt: 'Pontuação Total', en: 'Total Score', tr: 'Toplam Puan' },
            { key: 'accuracy', pt: 'Precisão', en: 'Accuracy', tr: 'Doğruluk' },
            { key: 'total_time', pt: 'Tempo Total', en: 'Total Time', tr: 'Toplam Sure' },
            { key: 'share', pt: 'Compartilhar', en: 'Share', tr: 'Paylas' },
            { key: 'view_ranking', pt: 'Ver Ranking', en: 'View Ranking', tr: 'Siralamaya Bak' },
        ],
    },
    {
        id: 'auth',
        label: 'Autenticação',
        keys: [
            { key: 'login', pt: 'Entrar', en: 'Login', tr: 'Giriş' },
            { key: 'register', pt: 'Criar Conta', en: 'Create Account', tr: 'Hesap Oluştur' },
            { key: 'email', pt: 'Email', en: 'Email', tr: 'E-posta' },
            { key: 'password', pt: 'Senha', en: 'Password', tr: 'Sifre' },
            { key: 'name', pt: 'Nome', en: 'Name', tr: 'İsim' },
            { key: 'logout', pt: 'Sair', en: 'Logout', tr: 'Çıkış' },
        ],
    },
    {
        id: 'homepage',
        label: 'Homepage',
        keys: [
            { key: 'hero_title', pt: 'O Discípulo', en: 'The Disciple', tr: 'Mürit' },
            { key: 'hero_subtitle', pt: 'Uma jornada interativa pelas cidades bíblicas', en: 'An interactive journey through biblical cities', tr: 'Kutsal kitap şehirleri arasında interaktif bir yolculuk' },
            { key: 'start_journey', pt: 'Começar Jornada', en: 'Start Journey', tr: 'Yolculuğa Başla' },
            { key: 'biblical_cities', pt: 'Cidades Bíblicas', en: 'Biblical Cities', tr: 'Kutsal Kitap Şehirleri' },
            { key: 'pauls_routes', pt: 'As Rotas do Apóstolo Paulo', en: "Paul the Apostle's Routes", tr: 'Havari Pavlus\'un Rotaları' },
        ],
    },
];

// In-memory store for translations
let translationStore: Record<string, Record<string, Record<string, string>>> = {};

export default function I18nPage() {
    const [languages, setLanguages] = useState(LANGUAGES);
    const [activeSection, setActiveSection] = useState(TRANSLATION_SECTIONS[0].id);
    const [editLang, setEditLang] = useState('en');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [newLangCode, setNewLangCode] = useState('');
    const [newLangLabel, setNewLangLabel] = useState('');
    const [newLangFlag, setNewLangFlag] = useState('');
    const [showAddLang, setShowAddLang] = useState(false);

    const section = TRANSLATION_SECTIONS.find(s => s.id === activeSection)!;

    useEffect(() => {
        const stored = translationStore[activeSection]?.[editLang] || {};
        const data: Record<string, string> = {};
        section.keys.forEach(k => {
            data[k.key] = stored[k.key] ?? (k as any)[editLang] ?? '';
        });
        setTranslations(data);
        setSaved(false);
    }, [activeSection, editLang]);

    const handleSave = () => {
        setSaving(true);
        if (!translationStore[activeSection]) translationStore[activeSection] = {};
        translationStore[activeSection][editLang] = { ...translations };
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 300);
    };

    const toggleLanguage = (code: string) => {
        if (code === 'pt') return; // Can't disable default
        setLanguages(prev => prev.map(l => l.code === code ? { ...l, enabled: !l.enabled } : l));
    };

    const addLanguage = () => {
        if (!newLangCode || !newLangLabel) return;
        setLanguages(prev => [...prev, { code: newLangCode.toLowerCase(), label: newLangLabel, flag: newLangFlag || '🏳️', enabled: false }]);
        setNewLangCode('');
        setNewLangLabel('');
        setNewLangFlag('');
        setShowAddLang(false);
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 13, border: goldBorder, borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Idiomas & Traduções</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Gerencie idiomas e traduções. O português é o idioma padrão.</p>
            </div>

            {/* Languages overview */}
            <div style={{ ...glass, padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: 1.5, textTransform: 'uppercase' }}>Idiomas Disponíveis</p>
                    <button onClick={() => setShowAddLang(!showAddLang)} style={{ padding: '6px 14px', borderRadius: 6, background: 'rgba(201,162,39,0.1)', border: goldBorder, color: '#c9a227', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        + Adicionar Idioma
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: showAddLang ? 16 : 0 }}>
                    {languages.map(lang => (
                        <div key={lang.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, background: lang.enabled || lang.code === 'pt' ? 'rgba(201,162,39,0.1)' : 'rgba(255,255,255,0.03)', border: lang.enabled || lang.code === 'pt' ? goldBorder : '1px solid rgba(255,255,255,0.08)' }}>
                            <span style={{ fontSize: 20 }}>{lang.flag}</span>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{lang.label}</p>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{lang.code.toUpperCase()}{lang.code === 'pt' ? ' (padrão)' : ''}</p>
                            </div>
                            {lang.code !== 'pt' && (
                                <button onClick={() => toggleLanguage(lang.code)} style={{ marginLeft: 8, padding: '4px 10px', borderRadius: 6, background: lang.enabled ? 'rgba(39,174,96,0.2)' : 'rgba(255,255,255,0.05)', border: lang.enabled ? '1px solid rgba(39,174,96,0.4)' : '1px solid rgba(255,255,255,0.1)', color: lang.enabled ? '#27ae60' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                    {lang.enabled ? 'Ativo' : 'Inativo'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {showAddLang && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ flex: 1, minWidth: 80 }}>
                            <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600 }}>CODIGO</label>
                            <input value={newLangCode} onChange={e => setNewLangCode(e.target.value)} placeholder="es" style={{ ...inputStyle, maxWidth: 80 }} />
                        </div>
                        <div style={{ flex: 2, minWidth: 120 }}>
                            <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600 }}>NOME</label>
                            <input value={newLangLabel} onChange={e => setNewLangLabel(e.target.value)} placeholder="Espanol" style={inputStyle} />
                        </div>
                        <div style={{ flex: 1, minWidth: 60 }}>
                            <label style={{ display: 'block', fontSize: 10, color: '#c9a227', marginBottom: 4, fontWeight: 600 }}>EMOJI</label>
                            <input value={newLangFlag} onChange={e => setNewLangFlag(e.target.value)} placeholder="🇪🇸" style={{ ...inputStyle, maxWidth: 60 }} />
                        </div>
                        <button onClick={addLanguage} style={{ padding: '9px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Adicionar
                        </button>
                    </div>
                )}
            </div>

            {/* Translation editor */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }} className="admin-i18n-grid">
                {/* Sections */}
                <div style={{ ...glass, padding: 10 }}>
                    {TRANSLATION_SECTIONS.map(s => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ display: 'block', width: '100%', padding: '10px 12px', borderRadius: 8, background: activeSection === s.id ? 'rgba(201,162,39,0.15)' : 'transparent', border: activeSection === s.id ? goldBorder : '1px solid transparent', color: activeSection === s.id ? '#c9a227' : 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: activeSection === s.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', marginBottom: 2 }}>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Editor */}
                <div style={{ ...glass, padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                        <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700 }}>{section.label}</h2>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <select value={editLang} onChange={e => setEditLang(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: goldBorder, color: '#fff', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
                                {languages.filter(l => l.code !== 'pt').map(l => (
                                    <option key={l.code} value={l.code} style={{ background: '#1a1045', color: '#fff' }}>{l.flag} {l.label}</option>
                                ))}
                            </select>
                            {saved && <span style={{ fontSize: 12, color: '#27ae60', fontWeight: 600 }}>Salvo!</span>}
                            <button onClick={handleSave} disabled={saving} style={{ padding: '7px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                                {saving ? '...' : 'Salvar'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {section.keys.map(k => (
                            <div key={k.key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="admin-i18n-row">
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{k.key}</p>
                                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                                    🇧🇷 {k.pt}
                                </div>
                                <input
                                    value={translations[k.key] || ''}
                                    onChange={e => setTranslations({ ...translations, [k.key]: e.target.value })}
                                    placeholder={`Tradução ${editLang.toUpperCase()}`}
                                    style={inputStyle}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .admin-i18n-grid { grid-template-columns: 1fr !important; }
                    .admin-i18n-row { grid-template-columns: 1fr !important; gap: 4px !important; }
                }
            `}</style>
        </div>
    );
}
