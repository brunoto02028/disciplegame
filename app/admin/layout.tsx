'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navSections = [
    {
        title: 'GERAL',
        items: [
            { href: '/admin', label: 'Dashboard', icon: '📊' },
            { href: '/admin/users', label: 'Usuários', icon: '👥' },
            { href: '/admin/settings', label: 'Config. do Site', icon: '⚙️' },
        ],
    },
    {
        title: 'CONTEÚDO',
        items: [
            { href: '/admin/cities', label: 'Cidades', icon: '🗺️' },
            { href: '/admin/questions', label: 'Perguntas', icon: '❓' },
            { href: '/admin/game-rules', label: 'Regras do Jogo', icon: '🎮' },
            { href: '/admin/challenges', label: 'Desafios', icon: '⚡' },
        ],
    },
];

const goldBorder = '1px solid rgba(201,162,39,0.3)';

function CrossIcon({ size = 24, color = '#c9a227' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="10" y="2" width="4" height="20" rx="1" fill={color} />
            <rect x="4" y="7" width="16" height="4" rx="1" fill={color} />
        </svg>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (pathname === '/admin/login') return <>{children}</>;

    const sidebar = (
        <aside style={{ width: 240, background: 'rgba(13,11,46,0.98)', borderRight: goldBorder, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 60, backdropFilter: 'blur(20px)' }}>
            {/* Logo */}
            <div style={{ padding: '16px 16px 12px', borderBottom: goldBorder, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CrossIcon size={16} color="#fff" />
                    </div>
                    <div>
                        <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 14, lineHeight: 1, color: '#fff' }}>Admin Panel</p>
                        <p style={{ fontSize: 10, color: '#c9a227', marginTop: 2 }}>O Discipulo</p>
                    </div>
                </div>
                {/* Close button (mobile) */}
                <button onClick={() => setSidebarOpen(false)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, padding: 4 }} className="admin-sidebar-close">✕</button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {navSections.map(section => (
                    <div key={section.title} style={{ marginBottom: 4 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(201,162,39,0.6)', padding: '10px 10px 4px', textTransform: 'uppercase' }}>{section.title}</p>
                        {section.items.map(item => {
                            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', background: active ? 'rgba(201,162,39,0.15)' : 'transparent', border: active ? goldBorder : '1px solid transparent', color: active ? '#c9a227' : 'rgba(255,255,255,0.55)', fontSize: 12.5, fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
                                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div style={{ padding: '8px 8px', borderTop: goldBorder, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                    ← Voltar ao Jogo
                </Link>
                <button
                    onClick={async () => { await fetch('/api/admin/login', { method: 'DELETE' }); window.location.href = '/admin/login'; }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'none', border: 'none', color: '#ff6b6b', fontSize: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    🚪 Sair
                </button>
            </div>
        </aside>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0a0820', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>
            {/* Mobile overlay */}
            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 55 }} />}

            {/* Sidebar — hidden on mobile via CSS */}
            <div className="admin-sidebar-desktop">{sidebar}</div>
            {sidebarOpen && <div className="admin-sidebar-mobile">{sidebar}</div>}

            {/* Mobile top bar */}
            <div className="admin-mobile-topbar" style={{ display: 'none', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,11,46,0.95)', backdropFilter: 'blur(20px)', borderBottom: goldBorder, padding: '0 16px', height: 56, alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#c9a227', cursor: 'pointer', fontSize: 22, padding: 4 }}>☰</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CrossIcon size={12} color="#fff" />
                    </div>
                    <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 14 }}>Admin</span>
                </div>
                <div style={{ width: 30 }} />
            </div>

            {/* Main content */}
            <main className="admin-main-content" style={{ marginLeft: 240, flex: 1, padding: '24px 28px', minHeight: '100vh' }}>
                {children}
            </main>

            <style>{`
                @media (max-width: 768px) {
                    .admin-sidebar-desktop { display: none !important; }
                    .admin-sidebar-mobile aside { width: 280px !important; }
                    .admin-sidebar-close { display: block !important; }
                    .admin-mobile-topbar { display: flex !important; }
                    .admin-main-content { margin-left: 0 !important; padding: 16px !important; }
                }
                @media (min-width: 769px) {
                    .admin-sidebar-mobile { display: none; }
                }
            `}</style>
        </div>
    );
}
