'use client';

import { useState, useEffect, useRef } from 'react';

const goldBorder = '1px solid rgba(201,162,39,0.3)';
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 14 };

const CATEGORIES = [
    { id: 'cities', label: 'Cidades', icon: '🏛️' },
    { id: 'maps', label: 'Mapas', icon: '🗺️' },
    { id: 'heroes', label: 'Hero / Banners', icon: '🖼️' },
    { id: 'icons', label: 'Icones', icon: '✝️' },
    { id: 'general', label: 'Geral', icon: '📁' },
];

interface MediaFile {
    url: string;
    filename: string;
    category: string;
}

export default function MediaPage() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [activeCategory, setActiveCategory] = useState('cities');
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = async () => {
        try {
            const res = await fetch('/api/admin/upload');
            const data = await res.json();
            if (data.success) setFiles(data.data);
        } catch { }
    };

    useEffect(() => { fetchFiles(); }, []);

    const handleUpload = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        setUploading(true);
        setUploadMsg('');

        let successCount = 0;
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const form = new FormData();
            form.append('file', file);
            form.append('category', activeCategory);
            try {
                const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
                const data = await res.json();
                if (data.success) successCount++;
                else setUploadMsg(data.error || 'Erro no upload');
            } catch {
                setUploadMsg('Erro de conexao');
            }
        }

        if (successCount > 0) {
            setUploadMsg(`${successCount} arquivo(s) enviado(s)!`);
            fetchFiles();
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setUploadMsg(''), 3000);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const filteredFiles = files.filter(f => f.category === activeCategory);

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setUploadMsg('URL copiada!');
        setTimeout(() => setUploadMsg(''), 2000);
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Midia & Fotos</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Upload e gerenciamento de imagens. Arraste ou selecione arquivos (max 5MB, jpg/png/webp/gif/svg).</p>
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ padding: '8px 16px', borderRadius: 8, background: activeCategory === cat.id ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)', border: activeCategory === cat.id ? goldBorder : '1px solid rgba(255,255,255,0.08)', color: activeCategory === cat.id ? '#c9a227' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: activeCategory === cat.id ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{cat.icon}</span> {cat.label}
                        <span style={{ fontSize: 11, opacity: 0.6 }}>({files.filter(f => f.category === cat.id).length})</span>
                    </button>
                ))}
            </div>

            {/* Upload area */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ ...glass, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', marginBottom: 24, borderStyle: dragOver ? 'dashed' : 'solid', borderColor: dragOver ? '#c9a227' : 'rgba(201,162,39,0.3)', background: dragOver ? 'rgba(201,162,39,0.08)' : 'rgba(255,255,255,0.04)', transition: 'all 0.2s' }}
            >
                <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
                <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.6 }}>{uploading ? '⏳' : '📤'}</div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: dragOver ? '#c9a227' : '#fff' }}>
                    {uploading ? 'Enviando...' : dragOver ? 'Solte aqui!' : 'Arraste imagens ou clique para selecionar'}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    Categoria: <strong style={{ color: '#c9a227' }}>{CATEGORIES.find(c => c.id === activeCategory)?.label}</strong>
                </p>
                {uploadMsg && <p style={{ fontSize: 12, color: uploadMsg.includes('Erro') ? '#e74c3c' : '#27ae60', marginTop: 8, fontWeight: 600 }}>{uploadMsg}</p>}
            </div>

            {/* File grid */}
            {filteredFiles.length === 0 ? (
                <div style={{ ...glass, padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🖼️</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Nenhuma imagem nesta categoria.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
                    {filteredFiles.map(file => (
                        <div key={file.url} style={{ ...glass, overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: 140, position: 'relative', background: '#0d0b2e' }}>
                                <img src={file.url} alt={file.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '10px 12px' }}>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{file.filename}</p>
                                <button onClick={() => copyUrl(file.url)} style={{ width: '100%', padding: '6px', borderRadius: 6, background: 'rgba(201,162,39,0.1)', border: goldBorder, color: '#c9a227', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                    Copiar URL
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
