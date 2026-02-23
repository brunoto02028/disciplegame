'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const goldBorder = '1px solid rgba(201,162,39,0.45)';
const goldBg = 'rgba(201,162,39,0.08)';

function CrossIcon({ size = 24, color = '#c9a227' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="10" y="2" width="4" height="20" rx="1" fill={color} />
      <rect x="4" y="7" width="16" height="4" rx="1" fill={color} />
    </svg>
  );
}

function OrnamentLine() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '0 auto', maxWidth: 200 }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,162,39,0.5))' }} />
      <CrossIcon size={14} />
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(201,162,39,0.5),transparent)' }} />
    </div>
  );
}

export default function HomePage() {
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/site').then(r => r.json()).then(d => { if (d.success) setSiteData(d.data); });
  }, []);

  const s = siteData?.settings || {};
  const hero = s.hero || {};
  const citiesSec = s.cities_section || {};
  const mapSec = s.map_section || {};
  const howSec = s.how_it_works || {};
  const ctaSec = s.cta_section || {};
  const footerSec = s.footer || {};
  const cities = siteData?.cities || [];

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", color: '#fff', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', overflowX: 'hidden', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(13,11,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: goldBorder }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(201,162,39,0.5)' }}>
              <CrossIcon size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 19, color: '#fff', letterSpacing: 0.5 }}>O Discipulo</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/auth/login" style={{ padding: '8px 20px', borderRadius: 10, border: '1.5px solid rgba(201,162,39,0.4)', color: '#c9a227', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Entrar</Link>
            <Link href="/auth/register" style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 14px rgba(201,162,39,0.4)' }}>Comecar Gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="home-hero-grid" style={{ minHeight: '92vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 48px 80px 64px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: goldBg, border: goldBorder, borderRadius: 100, padding: '6px 18px', marginBottom: 36, fontSize: 13, fontWeight: 600, color: '#c9a227', width: 'fit-content' }}>
            <CrossIcon size={12} />
            {hero.badge_text || 'As Viagens de Paulo'}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 'clamp(48px,7vw,80px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 20, color: '#fff' }}>
            {hero.title || 'O Discipulo'}
          </h1>
          <p style={{ fontSize: 20, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 10, fontStyle: 'italic' }}>{hero.subtitle || 'Onde Historia e Aventura se Encontram'}</p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 44, maxWidth: 440 }}>
            {hero.description || 'Uma jornada interativa de conhecimento biblico, geografia atual e turismo religioso.'}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/auth/register" style={{ padding: '15px 36px', borderRadius: 12, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 24px rgba(201,162,39,0.5)', display: 'inline-block' }}>
              {hero.cta_primary || 'Comecar Jornada'}
            </Link>
            <Link href="/demo" style={{ padding: '15px 36px', borderRadius: 12, background: 'rgba(39,174,96,0.15)', color: '#2ecc71', fontWeight: 700, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(39,174,96,0.4)', display: 'inline-block' }}>
              ▶ Experimentar Grátis
            </Link>
            <Link href="/auth/login" style={{ padding: '15px 36px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: '#c9a227', fontWeight: 700, fontSize: 16, textDecoration: 'none', border: goldBorder, display: 'inline-block' }}>
              {hero.cta_secondary || 'Ja tenho conta'}
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {(hero.stats || [{ number: '10+', label: 'Cidades' }, { number: '270+', label: 'Perguntas' }, { number: '3', label: 'Blocos' }]).map((st: any) => (
              <div key={st.label}>
                <div style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, color: '#c9a227' }}>{st.number}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src={hero.image_url || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80'} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#0d0b2e 0%,rgba(26,10,74,0.6) 30%,rgba(26,10,74,0.3) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#0d0b2e 0%,transparent 30%)' }} />
        </div>
      </section>

      {/* ── CIDADES (DINÂMICO) ── */}
      {cities.length > 0 && (
      <section style={{ padding: '100px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 12 }}>{citiesSec.label || 'Destinos Historicos'}</p>
            <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, marginBottom: 14 }}>{citiesSec.title || 'Explore as Cidades Biblicas'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, maxWidth: 480, margin: '0 auto 16px' }}>{citiesSec.subtitle || ''}</p>
          </div>
          <OrnamentLine />
          <div className="home-cities-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cities.length, 3)},1fr)`, gap: 20, marginTop: 48 }}>
            {cities.map((city: any) => (
              <div key={city.id} style={{ borderRadius: 20, overflow: 'hidden', border: goldBorder, background: '#0d0b2e', position: 'relative' }}>
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                  {city.image_url ? (
                    <img src={city.image_url} alt={city.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a0a4a,#0d1b4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.3 }}>🏛️</div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#0d0b2e 5%,rgba(26,10,74,0.3) 50%,rgba(26,10,74,0.15) 100%)' }} />
                  {city.flag && (
                    <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 12px', border: goldBorder }}>
                      <span style={{ fontSize: 14 }}>{city.flag}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: 0.5 }}>{(city.country || '').toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '20px 22px' }}>
                  <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{city.name}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 14 }}>{city.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {city.biblical_ref && <span style={{ fontSize: 11, color: '#c9a227', fontWeight: 600, background: goldBg, border: goldBorder, borderRadius: 20, padding: '3px 12px' }}>📖 {city.biblical_ref}</span>}
                    <Link href="/auth/register" style={{ fontSize: 13, color: '#c9a227', fontWeight: 700, textDecoration: 'none' }}>Jogar →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── MAPA ── */}
      <section style={{ padding: '80px 24px', background: 'rgba(201,162,39,0.03)', borderTop: goldBorder, borderBottom: goldBorder }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 12 }}>{mapSec.label || 'Viagens Missionarias'}</p>
            <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, marginBottom: 14 }}>{mapSec.title || 'As Rotas do Apostolo Paulo'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, maxWidth: 520, margin: '0 auto 16px' }}>{mapSec.subtitle || ''}</p>
          </div>
          <OrnamentLine />
          <div className="home-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '36px auto 32px', maxWidth: 800 }}>
            {(mapSec.stats || [{ label: 'DISTANCIA', value: '16.000+ km' }, { label: 'DURACAO', value: '~12 anos' }, { label: 'PAISES', value: '10 visitados' }, { label: 'CIDADES', value: '50+ cidades' }]).map((st: any) => (
              <div key={st.label} style={{ background: goldBg, border: goldBorder, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#c9a227', letterSpacing: 1.2, marginBottom: 4 }}>{st.label}</p>
                <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 800 }}>{st.value}</p>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(201,162,39,0.3)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)', position: 'relative', background: '#1a1040' }}>
            <img src={mapSec.image_url || '/images/map.svg'} alt="Viagens Missionarias de Paulo" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(13,11,46,0.6) 0%,transparent 30%,transparent 70%,rgba(13,11,46,0.4) 100%)', pointerEvents: 'none' }} />
          </div>
          <div className="home-journeys-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 24 }}>
            {(mapSec.journeys || [{ num: '1a', title: 'Primeira Viagem', route: 'Chipre, Turquia', date: '46-48 d.C.' }, { num: '2a', title: 'Segunda Viagem', route: 'Grecia, Macedonia', date: '49-52 d.C.' }, { num: '3a', title: 'Terceira Viagem', route: 'Efeso, Jerusalem', date: '53-58 d.C.' }]).map((j: any) => (
              <div key={j.num} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#1a0a4a', flexShrink: 0 }}>{j.num}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{j.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>⚓ {j.route} ({j.date})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 12 }}>{howSec.label || 'Como Funciona'}</p>
            <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, marginBottom: 14 }}>{howSec.title || 'Uma experiencia unica de aprendizado'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, maxWidth: 440, margin: '0 auto 16px' }}>{howSec.subtitle || ''}</p>
          </div>
          <OrnamentLine />
          <div className="home-how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginTop: 48 }}>
            {(howSec.items || [{ icon: '📖', title: 'Aprenda', desc: 'Mergulhe em perguntas sobre contexto biblico.' }, { icon: '⚔️', title: 'Compete', desc: 'Responda com precisao e velocidade.' }, { icon: '🏆', title: 'Ganhe', desc: 'Ganhe premios reais.' }]).map((item: any) => (
              <div key={item.title} style={{ background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 20, padding: '36px 28px', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: goldBg, border: goldBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', fontSize: 32, boxShadow: '0 0 24px rgba(201,162,39,0.2)' }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#c9a227' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: goldBorder }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(201,162,39,0.08) 0%,rgba(201,162,39,0.04) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,162,39,0.15) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(201,162,39,0.4)' }}>
            <CrossIcon size={32} color="#fff" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>{ctaSec.title || 'Pronto para Comecar sua Jornada?'}</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 1.8, marginBottom: 44 }}>{ctaSec.subtitle || ''}</p>
          <Link href="/auth/register" style={{ display: 'inline-block', padding: '16px 48px', borderRadius: 14, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 17, textDecoration: 'none', boxShadow: '0 4px 32px rgba(201,162,39,0.5)' }}>
            {ctaSec.button_text || 'Criar Conta Gratuita'}
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '36px 24px', textAlign: 'center', borderTop: goldBorder }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CrossIcon size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>O Discipulo</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>{footerSec.text || '© 2026 O Discipulo - Todos os direitos reservados'}</p>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .home-hero-grid { grid-template-columns: 1fr !important; min-height: auto !important; }
          .home-hero-grid > div:first-child { padding: 48px 24px !important; }
          .home-hero-grid > div:last-child { height: 300px; position: relative !important; }
          .home-cities-grid { grid-template-columns: 1fr !important; max-width: 440px; margin-left: auto; margin-right: auto; }
          .home-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .home-journeys-grid { grid-template-columns: 1fr !important; }
          .home-how-grid { grid-template-columns: 1fr !important; max-width: 440px; margin-left: auto; margin-right: auto; }
        }
        @media (max-width: 480px) {
          .home-stats-grid { grid-template-columns: 1fr 1fr !important; }
          nav > div { padding: 0 16px !important; }
        }
      `}</style>
    </div>
  );
}