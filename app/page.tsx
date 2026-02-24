'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

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

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 12 }}>{label}</p>
      <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, marginBottom: 14 }}>{title}</h2>
      {subtitle && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, maxWidth: 520, margin: '0 auto 16px' }}>{subtitle}</p>}
      <OrnamentLine />
    </div>
  );
}

export default function HomePage() {
  const [siteData, setSiteData] = useState<any>(null);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t, lf, locale, toggleLocale } = useLanguage();

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
  const aboutSec = s.about || {};
  const testSec = s.testimonials || {};
  const faqSec = s.faq || {};
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
            <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 19, color: '#fff', letterSpacing: 0.5 }}>O Discípulo</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={toggleLocale} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              {locale === 'pt-BR' ? '🇺🇸' : '🇧🇷'} {t('nav.language')}
            </button>
            <Link href="/auth/login" className="nav-btn-login" style={{ padding: '8px 20px', borderRadius: 10, border: '1.5px solid rgba(201,162,39,0.4)', color: '#c9a227', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{t('nav.enter')}</Link>
            <Link href="/auth/register" style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 14px rgba(201,162,39,0.4)' }}>{t('nav.start_free')}</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="home-hero-grid" style={{ minHeight: '92vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 48px 80px 64px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: goldBg, border: goldBorder, borderRadius: 100, padding: '6px 18px', marginBottom: 36, fontSize: 13, fontWeight: 600, color: '#c9a227', width: 'fit-content' }}>
            <CrossIcon size={12} />
            {lf(hero, 'badge_text') || t('hero.badge')}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 'clamp(42px,6vw,76px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 20, color: '#fff' }}>
            {lf(hero, 'title') || t('hero.title')}
          </h1>
          <p style={{ fontSize: 20, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 10, fontStyle: 'italic' }}>{lf(hero, 'subtitle') || t('hero.subtitle')}</p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 44, maxWidth: 440 }}>
            {lf(hero, 'description') || t('hero.description')}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/auth/register" style={{ padding: '15px 36px', borderRadius: 12, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 24px rgba(201,162,39,0.5)', display: 'inline-block' }}>
              {lf(hero, 'cta_primary') || t('hero.cta_primary')}
            </Link>
            <Link href="/demo" style={{ padding: '15px 36px', borderRadius: 12, background: 'rgba(39,174,96,0.15)', color: '#2ecc71', fontWeight: 700, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(39,174,96,0.4)', display: 'inline-block' }}>
              {t('hero.cta_demo')}
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {(hero.stats || [{ number: '10+', label: 'Cidades', label_en: 'Cities' }, { number: '270+', label: 'Perguntas', label_en: 'Questions' }, { number: '3', label: 'Blocos', label_en: 'Blocks' }]).map((st: any) => (
              <div key={st.label}>
                <div style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 800, color: '#c9a227' }}>{st.number}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{lf(st, 'label')}</div>
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

      {/* ── SOBRE O JOGO ── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader label={lf(aboutSec, 'label') || aboutSec.label} title={lf(aboutSec, 'title') || aboutSec.title} subtitle={lf(aboutSec, 'subtitle') || aboutSec.subtitle} />
          <div className="home-about-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 48, alignItems: 'center' }}>
            <div>
              {(locale === 'en' && aboutSec.paragraphs_en ? aboutSec.paragraphs_en : aboutSec.paragraphs || []).map((p: string, i: number) => (
                <p key={i} style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, marginBottom: 20 }}>{p}</p>
              ))}
              <Link href="/demo" style={{ display: 'inline-block', marginTop: 8, padding: '12px 28px', borderRadius: 10, background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)', color: '#2ecc71', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                {t('about.try_now')}
              </Link>
            </div>
            <div className="home-about-features" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {(aboutSec.features || []).map((f: any, i: number) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                  <h4 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 16, fontWeight: 700, color: '#c9a227', marginBottom: 8 }}>{lf(f, 'title')}</h4>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{lf(f, 'desc')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CIDADES COM PONTOS TURÍSTICOS ── */}
      {cities.length > 0 && (
      <section style={{ padding: '100px 24px', background: 'rgba(201,162,39,0.02)', borderTop: goldBorder, borderBottom: goldBorder }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader label={lf(citiesSec, 'label') || citiesSec.label} title={lf(citiesSec, 'title') || citiesSec.title} subtitle={lf(citiesSec, 'subtitle') || citiesSec.subtitle} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginTop: 48 }}>
            {cities.map((city: any, idx: number) => {
              const isExpanded = expandedCity === city.id;
              const spots = city.tourist_spots || [];
              return (
                <div key={city.id} className="home-city-card" style={{ borderRadius: 24, overflow: 'hidden', border: goldBorder, background: '#0d0b2e' }}>
                  <div className="home-city-inner" style={{ display: 'grid', gridTemplateColumns: idx % 2 === 0 ? '1fr 1fr' : '1fr 1fr', gap: 0 }}>
                    {/* Image side */}
                    <div className={idx % 2 !== 0 ? 'home-city-img-right' : ''} style={{ position: 'relative', minHeight: 320, overflow: 'hidden', order: idx % 2 !== 0 ? 2 : 1 }}>
                      {city.image_url ? (
                        <img src={city.image_url} alt={city.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a0a4a,#0d1b4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: 0.2 }}>🏛️</div>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: idx % 2 === 0 ? 'linear-gradient(90deg,transparent 50%,#0d0b2e 100%)' : 'linear-gradient(270deg,transparent 50%,#0d0b2e 100%)' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#0d0b2e 0%,transparent 40%)' }} />
                      {city.flag && (
                        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '5px 14px', border: goldBorder }}>
                          <span style={{ fontSize: 16 }}>{city.flag}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#c9a227' }}>{(city.country || '').toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    {/* Text side */}
                    <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', order: idx % 2 !== 0 ? 1 : 2 }}>
                      {city.biblical_ref && <span style={{ fontSize: 11, color: '#c9a227', fontWeight: 600, background: goldBg, border: goldBorder, borderRadius: 20, padding: '3px 14px', width: 'fit-content', marginBottom: 12 }}>📖 {city.biblical_ref}</span>}
                      <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, marginBottom: 12 }}>{lf(city, 'name')}</h3>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 12 }}>{lf(city, 'description')}</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 20 }}>{lf(city, 'biblical_context')}</p>

                      {spots.length > 0 && (
                        <button onClick={() => setExpandedCity(isExpanded ? null : city.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: goldBorder, borderRadius: 10, padding: '8px 16px', color: '#c9a227', fontWeight: 600, fontSize: 13, cursor: 'pointer', width: 'fit-content', marginBottom: isExpanded ? 16 : 0 }}>
                          🗺 {isExpanded ? t('cities.close') : t('cities.view_spots', { count: spots.length })}
                          <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', display: 'inline-block' }}>▼</span>
                        </button>
                      )}

                      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <Link href="/auth/register" style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>{t('cities.play_now')}</Link>
                        <Link href="/demo" style={{ padding: '10px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: goldBorder, color: '#c9a227', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>{t('cities.demo')}</Link>
                      </div>
                    </div>
                  </div>

                  {/* Tourist Spots (expandable) */}
                  {isExpanded && spots.length > 0 && (
                    <div style={{ padding: '0 32px 32px', borderTop: goldBorder }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: 2, textTransform: 'uppercase', padding: '20px 0 16px' }}>{t('cities.spots_label', { city: city.name })}</p>
                      <div className="home-spots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                        {spots.map((spot: any, si: number) => (
                          <div key={si} style={{ borderRadius: 14, overflow: 'hidden', border: goldBorder, background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ height: 140, overflow: 'hidden', background: '#1a1040' }}>
                              {spot.image_url ? (
                                <img src={spot.image_url} alt={spot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'rgba(255,255,255,0.1)' }}>📍</div>
                              )}
                            </div>
                            <div style={{ padding: '14px 16px' }}>
                              <h4 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 15, fontWeight: 700, color: '#c9a227', marginBottom: 6 }}>{lf(spot, 'name')}</h4>
                              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{lf(spot, 'description')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ── MAPA ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionHeader label={lf(mapSec, 'label') || mapSec.label} title={lf(mapSec, 'title') || mapSec.title} subtitle={lf(mapSec, 'subtitle') || mapSec.subtitle} />
          <div className="home-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '36px auto 32px', maxWidth: 800 }}>
            {(mapSec.stats || [{ label: 'DISTÂNCIA', label_en: 'DISTANCE', value: '16.000+ km', value_en: '16,000+ km' }, { label: 'DURAÇÃO', label_en: 'DURATION', value: '~12 anos', value_en: '~12 years' }, { label: 'PAÍSES', label_en: 'COUNTRIES', value: '10 visitados', value_en: '10 visited' }, { label: 'CIDADES', label_en: 'CITIES', value: '50+ cidades', value_en: '50+ cities' }]).map((st: any) => (
              <div key={st.label} style={{ background: goldBg, border: goldBorder, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#c9a227', letterSpacing: 1.2, marginBottom: 4 }}>{lf(st, 'label')}</p>
                <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 18, fontWeight: 800 }}>{lf(st, 'value')}</p>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(201,162,39,0.3)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)', position: 'relative', background: '#1a1040' }}>
            <img src={mapSec.image_url || '/images/map.svg'} alt={locale === 'en' ? "Paul's Missionary Journeys" : 'Viagens Missionárias de Paulo'} style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(13,11,46,0.6) 0%,transparent 30%,transparent 70%,rgba(13,11,46,0.4) 100%)', pointerEvents: 'none' }} />
          </div>
          <div className="home-journeys-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 24 }}>
            {(mapSec.journeys || [{ num: '1ª', title: 'Primeira Viagem', title_en: 'First Journey', route: 'Chipre, Turquia', route_en: 'Cyprus, Turkey', date: '46-48 d.C.', date_en: '46-48 AD' }, { num: '2ª', title: 'Segunda Viagem', title_en: 'Second Journey', route: 'Grécia, Macedônia', route_en: 'Greece, Macedonia', date: '49-52 d.C.', date_en: '49-52 AD' }, { num: '3ª', title: 'Terceira Viagem', title_en: 'Third Journey', route: 'Éfeso, Jerusalém', route_en: 'Ephesus, Jerusalem', date: '53-58 d.C.', date_en: '53-58 AD' }]).map((j: any) => (
              <div key={j.num} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#1a0a4a', flexShrink: 0 }}>{j.num}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{lf(j, 'title')}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>⚓ {lf(j, 'route')} ({lf(j, 'date')})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section style={{ padding: '100px 24px', background: 'rgba(201,162,39,0.02)', borderTop: goldBorder, borderBottom: goldBorder }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader label={lf(howSec, 'label') || howSec.label} title={lf(howSec, 'title') || howSec.title} subtitle={lf(howSec, 'subtitle') || howSec.subtitle} />
          <div className="home-how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginTop: 48 }}>
            {(howSec.items || [{ icon: '📖', title: 'Aprenda', title_en: 'Learn', desc: 'Mergulhe em perguntas sobre contexto bíblico.', desc_en: 'Dive into questions about biblical context.' }, { icon: '⚔️', title: 'Compita', title_en: 'Compete', desc: 'Responda com precisão e velocidade.', desc_en: 'Answer with precision and speed.' }, { icon: '🏆', title: 'Ganhe', title_en: 'Win', desc: 'Ganhe prêmios reais.', desc_en: 'Win real prizes.' }]).map((item: any, i: number) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 20, padding: '36px 28px', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: goldBg, border: goldBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', fontSize: 32, boxShadow: '0 0 24px rgba(201,162,39,0.2)' }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#c9a227' }}>{lf(item, 'title')}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7 }}>{lf(item, 'desc')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS / NÚMEROS ── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader label={lf(testSec, 'label') || testSec.label} title={lf(testSec, 'title') || testSec.title} subtitle={lf(testSec, 'subtitle') || testSec.subtitle} />
          {/* Stats bar */}
          <div className="home-test-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, margin: '36px auto 48px', maxWidth: 700 }}>
            {(testSec.stats || []).map((st: any, i: number) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 32, fontWeight: 800, color: '#c9a227', marginBottom: 4 }}>{st.number}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>{lf(st, 'label')}</p>
              </div>
            ))}
          </div>
          {/* Testimonial cards */}
          <div className="home-test-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {(testSec.items || []).map((ti: any, i: number) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: goldBorder, borderRadius: 20, padding: '28px 24px', position: 'relative' }}>
                <div style={{ fontSize: 40, position: 'absolute', top: -8, left: 20, color: 'rgba(201,162,39,0.15)' }}>"</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>{lf(ti, 'text')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: goldBg, border: goldBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{ti.avatar}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{ti.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{lf(ti, 'role')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '100px 24px', background: 'rgba(201,162,39,0.02)', borderTop: goldBorder, borderBottom: goldBorder }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <SectionHeader label={lf(faqSec, 'label') || faqSec.label} title={lf(faqSec, 'title') || faqSec.title} subtitle={lf(faqSec, 'subtitle') || faqSec.subtitle} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 36 }}>
            {(faqSec.items || []).map((item: any, i: number) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: isOpen ? goldBorder : '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s' }}>
                  <button onClick={() => setOpenFaq(isOpen ? null : i)} style={{ width: '100%', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', color: isOpen ? '#c9a227' : '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                    {lf(item, 'question')}
                    <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', fontSize: 12, color: '#c9a227', flexShrink: 0, marginLeft: 12 }}>▼</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 22px 18px' }}>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{lf(item, 'answer')}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(201,162,39,0.08) 0%,rgba(201,162,39,0.04) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,162,39,0.15) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(201,162,39,0.4)' }}>
            <CrossIcon size={32} color="#fff" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>{lf(ctaSec, 'title') || t('cta.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 1.8, marginBottom: 44 }}>{lf(ctaSec, 'subtitle') || ctaSec.subtitle || ''}</p>
          <Link href="/auth/register" style={{ display: 'inline-block', padding: '16px 48px', borderRadius: 14, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontWeight: 700, fontSize: 17, textDecoration: 'none', boxShadow: '0 4px 32px rgba(201,162,39,0.5)' }}>
            {lf(ctaSec, 'button_text') || t('cta.button')}
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '36px 24px', textAlign: 'center', borderTop: goldBorder }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a227,#8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CrossIcon size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Playfair Display','Georgia',serif", fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>{t('footer.brand')}</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>{lf(footerSec, 'text') || footerSec.text || (locale === 'en' ? '© 2026 The Disciple — All rights reserved' : '© 2026 O Discípulo — Todos os direitos reservados')}</p>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .home-hero-grid { grid-template-columns: 1fr !important; min-height: auto !important; }
          .home-hero-grid > div:first-child { padding: 48px 24px !important; }
          .home-hero-grid > div:last-child { height: 300px; position: relative !important; }
          .home-cities-grid { grid-template-columns: 1fr !important; max-width: 440px; margin-left: auto; margin-right: auto; }
          .home-city-inner { grid-template-columns: 1fr !important; }
          .home-city-inner > div:first-child { min-height: 220px !important; order: 1 !important; }
          .home-city-inner > div:last-child { order: 2 !important; }
          .home-city-img-right { order: 1 !important; }
          .home-about-layout { grid-template-columns: 1fr !important; }
          .home-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .home-journeys-grid { grid-template-columns: 1fr !important; }
          .home-how-grid { grid-template-columns: 1fr !important; max-width: 440px; margin-left: auto; margin-right: auto; }
          .home-test-grid { grid-template-columns: 1fr !important; max-width: 440px; margin-left: auto; margin-right: auto; }
          .home-test-stats { grid-template-columns: 1fr 1fr !important; }
          .home-spots-grid { grid-template-columns: 1fr !important; }
          .nav-btn-login { display: none !important; }
        }
        @media (max-width: 480px) {
          .home-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .home-about-features { grid-template-columns: 1fr !important; }
          nav > div { padding: 0 16px !important; }
        }
      `}</style>
    </div>
  );
}