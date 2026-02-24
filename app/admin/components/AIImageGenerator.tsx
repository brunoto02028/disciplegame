'use client';

import { useState, useRef } from 'react';

interface AIImageGeneratorProps {
    currentUrl?: string;
    context: string;           // e.g. "Tourist spot: Church of the Holy Sepulchre, Jerusalem"
    onImageGenerated: (url: string) => void;
    buttonLabel?: string;
    compact?: boolean;
}

export default function AIImageGenerator({ currentUrl, context, onImageGenerated, buttonLabel, compact }: AIImageGeneratorProps) {
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMsg, setProgressMsg] = useState('');
    const [previews, setPreviews] = useState<{ url: string; description: string }[]>([]);
    const [error, setError] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [showPrompt, setShowPrompt] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const generate = async () => {
        setGenerating(true);
        setProgress(0);
        setProgressMsg('Iniciando...');
        setError('');
        setPreviews([]);

        const prompt = customPrompt.trim() || `High quality, photorealistic image of: ${context}. Cinematic lighting, stunning detail, no text overlays.`;

        try {
            abortRef.current = new AbortController();

            const res = await fetch('/api/admin/ai/generate-image-sse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    count: 2,
                    replaceUrl: currentUrl,
                }),
                signal: abortRef.current.signal,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error('No stream');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const dataStr = line.replace(/^data: /, '').trim();
                    if (!dataStr) continue;
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.type === 'progress') {
                            setProgress(data.pct);
                            setProgressMsg(data.msg);
                        } else if (data.type === 'done') {
                            setPreviews(data.images || []);
                            setProgress(100);
                            setProgressMsg('Pronto!');
                        } else if (data.type === 'error') {
                            setError(data.msg);
                        }
                    } catch { /* skip parse errors */ }
                }
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                setError(e?.message || 'Erro na geração');
            }
        }

        setGenerating(false);
    };

    const cancel = () => {
        abortRef.current?.abort();
        setGenerating(false);
        setProgress(0);
        setProgressMsg('');
    };

    const selectImage = (url: string) => {
        onImageGenerated(url);
        setPreviews([]);
        setShowPrompt(false);
        setCustomPrompt('');
    };

    if (compact) {
        return (
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
                {/* Generate button */}
                {!generating && previews.length === 0 && (
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={generate} style={{ padding: '5px 12px', borderRadius: 8, background: 'linear-gradient(135deg, rgba(139,105,20,0.3), rgba(201,162,39,0.15))', border: '1px solid rgba(201,162,39,0.4)', color: '#c9a227', fontWeight: 600, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            🤖 {buttonLabel || 'Gerar IA'}
                        </button>
                        <button onClick={() => setShowPrompt(!showPrompt)} style={{ padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}>
                            ✏️
                        </button>
                    </div>
                )}

                {/* Custom prompt */}
                {showPrompt && !generating && (
                    <input value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Prompt personalizado..." style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,162,39,0.2)', color: '#fff', fontSize: 11, width: '100%', outline: 'none' }} />
                )}

                {/* Progress bar */}
                {generating && (
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #c9a227, #e8c847)', width: `${progress}%`, transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ fontSize: 10, color: '#c9a227', fontWeight: 700, minWidth: 32 }}>{progress}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{progressMsg}</span>
                            <button onClick={cancel} style={{ fontSize: 10, color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                    </div>
                )}

                {/* Preview images */}
                {previews.length > 0 && (
                    <div style={{ display: 'flex', gap: 6 }}>
                        {previews.map((img, i) => (
                            <div key={i} onClick={() => selectImage(img.url)} style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(201,162,39,0.4)', width: 60, height: 60, position: 'relative' }}>
                                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>Usar</span>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setPreviews([])} style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center' }}>✕</button>
                    </div>
                )}

                {/* Error */}
                {error && <span style={{ fontSize: 10, color: '#e74c3c' }}>❌ {error}</span>}
            </div>
        );
    }

    // Full-size variant
    return (
        <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(201,162,39,0.04)', border: '1px solid rgba(201,162,39,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#c9a227' }}>Gerar Imagem com IA</h4>
            </div>

            {/* Custom prompt input */}
            <div style={{ marginBottom: 12 }}>
                <input value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder={`Prompt: ${context}`} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,162,39,0.2)', color: '#fff', fontSize: 13, outline: 'none' }} />
            </div>

            {/* Generate button */}
            {!generating && (
                <button onClick={generate} style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #c9a227, #8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    🎨 {buttonLabel || 'Gerar Imagem'}
                </button>
            )}

            {/* Progress bar */}
            {generating && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div style={{ flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, #c9a227, #e8c847, #c9a227)', backgroundSize: '200% 100%', animation: progress < 100 ? 'shimmer 1.5s ease-in-out infinite' : 'none', width: `${progress}%`, transition: 'width 0.5s ease' }} />
                        </div>
                        <span style={{ fontSize: 14, color: '#c9a227', fontWeight: 800, minWidth: 42 }}>{progress}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{progressMsg}</span>
                        <button onClick={cancel} style={{ fontSize: 12, color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>✕ Cancelar</button>
                    </div>
                    <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
                </div>
            )}

            {/* Preview images */}
            {previews.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Clique para usar:</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {previews.map((img, i) => (
                            <div key={i} onClick={() => selectImage(img.url)} style={{ cursor: 'pointer', borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(201,162,39,0.4)', width: 140, height: 140, position: 'relative', transition: 'all 0.3s' }}>
                                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 50%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 8 }}>
                                    <span style={{ color: '#c9a227', fontSize: 12, fontWeight: 700 }}>✅ Usar esta</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && <p style={{ marginTop: 8, fontSize: 12, color: '#e74c3c' }}>❌ {error}</p>}
        </div>
    );
}
