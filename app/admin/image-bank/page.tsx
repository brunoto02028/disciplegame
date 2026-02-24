'use client';

import { useState, useEffect, useRef } from 'react';

interface ImageItem {
    id: string;
    url: string;
    name: string;
    category: string;
    size: number;
    type: string;
    usedIn: string[];
    uploaded_at: string;
}

const goldBorder = '1px solid rgba(201,162,39,0.3)';
const categories = ['all', 'cities', 'settings', 'heroes', 'maps', 'general'];

export default function ImageBankPage() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
    const [showAddUrl, setShowAddUrl] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [urlName, setUrlName] = useState('');
    const [urlCategory, setUrlCategory] = useState('general');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [syncing, setSyncing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/admin/image-bank', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setImages(data.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchImages(); }, []);

    const showMsg = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'general');
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData, credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                showMsg('Imagem enviada e registrada no banco!', 'success');
                fetchImages();
            } else {
                showMsg(data.error || 'Erro no upload', 'error');
            }
        } catch { showMsg('Erro no upload', 'error'); }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/admin/image-bank/sync', { method: 'POST', credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                showMsg(`Sincronizado! ${data.data.added} imagem(ns) adicionada(s). Total: ${data.data.total}`, 'success');
                fetchImages();
            } else {
                showMsg(data.error || 'Erro ao sincronizar', 'error');
            }
        } catch { showMsg('Erro ao sincronizar', 'error'); }
        setSyncing(false);
    };

    const handleAddUrl = async () => {
        if (!urlInput.trim()) return;
        try {
            const res = await fetch('/api/admin/image-bank', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ url: urlInput.trim(), name: urlName.trim() || undefined, category: urlCategory }),
            });
            const data = await res.json();
            if (data.success) {
                showMsg(data.message || 'Imagem adicionada ao banco!', 'success');
                setUrlInput(''); setUrlName(''); setShowAddUrl(false);
                fetchImages();
            } else {
                showMsg(data.error || 'Erro', 'error');
            }
        } catch { showMsg('Erro ao adicionar', 'error'); }
    };

    const handleDelete = async (img: ImageItem) => {
        const usageCount = img.usedIn.length;
        const confirmMsg = usageCount > 0
            ? `Esta imagem está sendo usada em ${usageCount} lugar(es). Ao deletar, será removida de TODOS esses locais. Deseja continuar?`
            : 'Deletar esta imagem do banco?';
        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch(`/api/admin/image-bank?id=${img.id}`, { method: 'DELETE', credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                showMsg(data.data.message || 'Imagem removida!', 'success');
                setSelectedImage(null);
                fetchImages();
            } else {
                showMsg(data.error || 'Erro', 'error');
            }
        } catch { showMsg('Erro ao deletar', 'error'); }
    };

    const filtered = images.filter(img => {
        if (filter !== 'all' && img.category !== filter) return false;
        if (search && !img.name.toLowerCase().includes(search.toLowerCase()) && !img.url.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const formatSize = (bytes: number) => {
        if (!bytes) return '—';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (d: string) => {
        try { return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
        catch { return d; }
    };

    const usageLabel = (usage: string): string => {
        if (usage.startsWith('city:')) {
            const name = usage.replace('city:', '');
            return `🗺️ Cidade: ${name}`;
        }
        if (usage.startsWith('settings:')) return `⚙️ Settings: ${usage.replace('settings:', '')}`;
        if (usage.startsWith('question:')) return `❓ Pergunta: ${usage.replace('question:', '')}`;
        return usage;
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>🖼️ Banco de Imagens</h1>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{images.length} imagem(ns) registrada(s)</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={handleSync} disabled={syncing}
                        style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(39,174,96,0.12)', border: '1px solid rgba(39,174,96,0.3)', color: '#2ecc71', fontWeight: 600, fontSize: 12, cursor: syncing ? 'wait' : 'pointer', opacity: syncing ? 0.7 : 1 }}>
                        {syncing ? '⏳ Sincronizando...' : '🔄 Sincronizar do Site'}
                    </button>
                    <button onClick={() => setShowAddUrl(!showAddUrl)}
                        style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: goldBorder, color: '#c9a227', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                        🔗 Adicionar URL
                    </button>
                    <label style={{ padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        📤 {uploading ? 'Enviando...' : 'Upload'}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div style={{ background: message.type === 'success' ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)', border: `1px solid ${message.type === 'success' ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: message.type === 'success' ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>{message.text}</p>
                </div>
            )}

            {/* Add URL form */}
            {showAddUrl && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: goldBorder, borderRadius: 14, padding: 20, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#c9a227', marginBottom: 12 }}>Adicionar imagem por URL</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }} className="url-form-grid">
                        <div>
                            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>URL da imagem *</label>
                            <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Nome (opcional)</label>
                            <input value={urlName} onChange={e => setUrlName(e.target.value)} placeholder="Nome da imagem" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <select value={urlCategory} onChange={e => setUrlCategory(e.target.value)} style={{ padding: '10px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12 }}>
                                <option value="general" style={{ background: '#1a1045', color: '#fff' }}>Geral</option>
                                <option value="cities" style={{ background: '#1a1045', color: '#fff' }}>Cidades</option>
                                <option value="settings" style={{ background: '#1a1045', color: '#fff' }}>Settings</option>
                                <option value="heroes" style={{ background: '#1a1045', color: '#fff' }}>Heroes</option>
                                <option value="maps" style={{ background: '#1a1045', color: '#fff' }}>Mapas</option>
                            </select>
                            <button onClick={handleAddUrl} style={{ padding: '10px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', border: 'none', color: '#1a0a4a', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                Adicionar
                            </button>
                        </div>
                    </div>
                    {urlInput && (
                        <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', maxWidth: 200, border: goldBorder }}>
                            <img src={urlInput} alt="Preview" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} onError={e => (e.currentTarget.style.display = 'none')} />
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar imagem..." style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, outline: 'none', flex: '1 1 200px', minWidth: 150 }} />
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '6px 12px', borderRadius: 8, background: filter === cat ? 'rgba(201,162,39,0.15)' : 'transparent', border: filter === cat ? goldBorder : '1px solid rgba(255,255,255,0.08)', color: filter === cat ? '#c9a227' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                            {cat === 'all' ? 'Todas' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>🖼️</p>
                    <p style={{ fontSize: 14 }}>Nenhuma imagem encontrada</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Faça upload ou adicione URLs para começar</p>
                </div>
            ) : (
                <div className="image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {filtered.map(img => (
                        <div key={img.id} onClick={() => setSelectedImage(img)} style={{ borderRadius: 12, overflow: 'hidden', border: goldBorder, background: 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}>
                            <div style={{ width: '100%', height: 130, background: '#0a0820', position: 'relative' }}>
                                <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                                {img.usedIn.length > 0 && (
                                    <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(39,174,96,0.9)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}>
                                        Em uso ({img.usedIn.length})
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '8px 10px' }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.name}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{img.category}</span>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{formatSize(img.size)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail modal */}
            {selectedImage && (
                <>
                    <div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#0d0b2e', border: goldBorder, borderRadius: 16, padding: 24, zIndex: 101, width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 700 }}>Detalhes da Imagem</h3>
                            <button onClick={() => setSelectedImage(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                        </div>

                        {/* Preview */}
                        <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 16, border: goldBorder }}>
                            <img src={selectedImage.url} alt={selectedImage.name} style={{ width: '100%', maxHeight: 250, objectFit: 'contain', display: 'block', background: '#000' }} />
                        </div>

                        {/* Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                            {[
                                { label: 'Nome', value: selectedImage.name },
                                { label: 'Categoria', value: selectedImage.category },
                                { label: 'Tamanho', value: formatSize(selectedImage.size) },
                                { label: 'Tipo', value: selectedImage.type },
                                { label: 'Adicionada', value: formatDate(selectedImage.uploaded_at) },
                                { label: 'Usos', value: `${selectedImage.usedIn.length} lugar(es)` },
                            ].map(item => (
                                <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{item.label}</p>
                                    <p style={{ fontSize: 12, fontWeight: 600 }}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* URL */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
                            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>URL</p>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <input readOnly value={selectedImage.url} style={{ flex: 1, padding: '6px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#c9a227', fontSize: 11, outline: 'none' }} />
                                <button onClick={() => { navigator.clipboard.writeText(selectedImage.url); showMsg('URL copiada!', 'success'); }}
                                    style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(201,162,39,0.1)', border: goldBorder, color: '#c9a227', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    📋 Copiar
                                </button>
                            </div>
                        </div>

                        {/* Usages */}
                        {selectedImage.usedIn.length > 0 && (
                            <div style={{ background: 'rgba(39,174,96,0.06)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: '#2ecc71', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Em uso em:</p>
                                {selectedImage.usedIn.map((u, i) => (
                                    <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{usageLabel(u)}</p>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setSelectedImage(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: goldBorder, color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                                Fechar
                            </button>
                            <button onClick={() => handleDelete(selectedImage)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                🗑️ Deletar {selectedImage.usedIn.length > 0 ? '(remove de tudo)' : ''}
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                @media (max-width: 640px) {
                    .image-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .url-form-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
