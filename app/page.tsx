'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const CATS = [
  { icon: '⚡', label: 'Electricidad', n: '234 pros' },
  { icon: '🔧', label: 'Fontanería', n: '189 pros' },
  { icon: '🎨', label: 'Pintura', n: '312 pros' },
  { icon: '🪟', label: 'Carpintería', n: '156 pros' },
  { icon: '❄️', label: 'Climatización', n: '98 pros' },
  { icon: '🧹', label: 'Limpieza', n: '421 pros' },
  { icon: '🏠', label: 'Reformas', n: '267 pros' },
  { icon: '🔒', label: 'Cerrajería', n: '143 pros' },
  { icon: '🌿', label: 'Jardinería', n: '112 pros' },
]

const PROS = [
  { initials: 'CM', name: 'Carlos M.', esp: 'Electricista', loc: 'Madrid', rating: 4.9, jobs: 187, bg: '#E8512A' },
  { initials: 'LF', name: 'Lucía F.', esp: 'Pintora', loc: 'Barcelona', rating: 5.0, jobs: 243, bg: '#0D1B2A' },
  { initials: 'JR', name: 'Javier R.', esp: 'Fontanero', loc: 'Sevilla', rating: 4.8, jobs: 134, bg: '#1A7A4A' },
]

const STEPS = [
  { n: '1', icon: '✍️', title: 'Describe tu problema', body: 'Escribe con tus palabras. Nuestra IA entiende cualquier descripción y clasifica el servicio automáticamente.' },
  { n: '2', icon: '🗺️', title: 'Elige en el mapa', body: 'Visualiza los profesionales verificados más cercanos a ti, ordenados por valoración y distancia.' },
  { n: '3', icon: '✅', title: 'Trabaja con garantía', body: 'El pago queda retenido hasta que confirmes que todo está correcto.' },
]

const STATS = [
  { v: '12.400+', l: 'Profesionales' },
  { v: '58.000+', l: 'Trabajos' },
  { v: '4.96★', l: 'Valoración' },
  { v: '95%', l: 'Satisfacción' },
]

const TESTIMONIALS = [
  { q: 'El electricista llegó en menos de una hora. Trabajo impecable y precio exactamente el acordado.', name: 'María G.', loc: 'Madrid', ini: 'MG', bg: '#E8512A' },
  { q: 'Nunca había tenido tanta facilidad para encontrar un fontanero de confianza en mi zona.', name: 'Antonio L.', loc: 'Valencia', ini: 'AL', bg: '#0D1B2A' },
  { q: 'Como profesional ha multiplicado mis clientes. La plataforma es muy seria y bien organizada.', name: 'Isabel M.', loc: 'Barcelona', ini: 'IM', bg: '#1A7A4A' },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    els.forEach(el => obs.observe(el))
    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect() }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .hide-mobile { display: flex; }
        .show-mobile { display: none; }
        @media(max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .hero-title { font-size: 2.2rem !important; }
          .stats-grid { gap: 1.5rem !important; }
          .cats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .pros-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr 1fr !important; }
          .testi-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .cta-btns { flex-direction: column !important; }
          .search-box { flex-wrap: wrap !important; }
          .search-btn { width: 100% !important; justify-content: center !important; }
          .nav-logo-text { font-size: 1rem !important; }
          .section-pad { padding: 4rem 1.25rem !important; }
          .hero-pad { padding: 3rem 1.25rem 4rem !important; }
          .pro-card-row { flex-direction: column !important; gap: 0.5rem !important; }
        }
        @media(max-width: 480px) {
          .cats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 1rem !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent', borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', transition: 'all 0.3s ease' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'var(--coral)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🔧</div>
            <span className="nav-logo-text" style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.15rem', color: 'var(--navy)' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hide-mobile" style={{ alignItems: 'center', gap: '2rem' }}>
            <a href="#servicios" className="nav-link">Servicios</a>
            <a href="#como-funciona" className="nav-link">Cómo funciona</a>
            <a href="#profesionales" className="nav-link">Profesionales</a>
          </nav>

          <div className="hide-mobile" style={{ alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/auth/login" className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Entrar</Link>
            <Link href="/auth/signup" className="btn-primary" style={{ padding: '0.52rem 1.1rem', fontSize: '0.85rem' }}>Regístrate</Link>
          </div>

          {/* Mobile burger */}
          <button className="show-mobile" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, width: 38, height: 38, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '1rem 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="#servicios" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1rem', padding: '0.4rem 0' }}>Servicios</a>
            <a href="#como-funciona" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1rem', padding: '0.4rem 0' }}>Cómo funciona</a>
            <a href="#profesionales" className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: '1rem', padding: '0.4rem 0' }}>Profesionales</a>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link href="/auth/login" className="btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.9rem' }}>Entrar</Link>
              <Link href="/auth/signup" className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.9rem' }}>Regístrate</Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section style={{ paddingTop: 64, background: 'var(--sand)', minHeight: '85vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '48px 48px', opacity: 0.4, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(232,81,42,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="hero-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.25rem 5rem', width: '100%', position: 'relative' }}>
          <div style={{ maxWidth: 680 }}>
            <div className="anim-up" style={{ marginBottom: '1.25rem' }}>
              <span className="tag">✦ Plataforma verificada · España</span>
            </div>
            <h1 className="anim-up d1 hero-title" style={{ fontSize: 'clamp(2.1rem, 5vw, 3.8rem)', fontWeight: 900, marginBottom: '1.1rem', lineHeight: 1.08, color: 'var(--navy)' }}>
              Tu hogar en buenas manos.<br />
              <span style={{ color: 'var(--coral)', fontStyle: 'italic' }}>Siempre.</span>
            </h1>
            <p className="anim-up d2" style={{ fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', color: 'var(--gray-4)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 520 }}>
              Describe lo que necesitas y nuestra IA encuentra al profesional verificado más cercano a ti en segundos.
            </p>

            {/* Search */}
            <div className="anim-up d3 search-box" style={{ background: 'white', borderRadius: 10, padding: '0.45rem 0.45rem 0.45rem 1rem', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: 540 }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ej: se me rompió el grifo..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--navy)', background: 'transparent', fontFamily: 'Plus Jakarta Sans, sans-serif', minWidth: 0 }} />
              <Link href={`/auth/signup?q=${encodeURIComponent(search)}`} className="btn-primary search-btn" style={{ flexShrink: 0, whiteSpace: 'nowrap', fontSize: '0.85rem', padding: '0.6rem 1.1rem' }}>
                Buscar
              </Link>
            </div>

            {/* Popular */}
            <div className="anim-up d4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-3)', fontWeight: 500 }}>Frecuentes:</span>
              {['Fontanero', 'Electricista', 'Pintar piso'].map(s => (
                <button key={s} onClick={() => setSearch(s)} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 100, padding: '0.18rem 0.7rem', fontSize: '0.76rem', color: 'var(--gray-4)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--coral)'; (e.currentTarget as HTMLElement).style.color = 'var(--coral)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--gray-4)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="anim-up d5 stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '2rem', marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', width: 'fit-content' }}>
            {STATS.map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.75rem', color: 'var(--coral)', letterSpacing: '-0.03em' }}>{s.v}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--gray-3)', fontWeight: 500, marginTop: '0.1rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicios" className="section-pad" style={{ padding: '5rem 1.25rem', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="section-label">Servicios</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900 }}>¿Qué necesitas hoy?</h2>
              <Link href="/auth/signup" style={{ fontSize: '0.85rem', color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>Ver todos →</Link>
            </div>
          </div>
          <div className="cats-grid reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.85rem' }}>
            {CATS.map((cat, i) => (
              <Link key={cat.label} href={`/auth/signup?cat=${encodeURIComponent(cat.label)}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1.25rem 1rem', cursor: 'pointer', transition: 'all .22s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--coral)'; el.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = 'translateY(0)' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem', lineHeight: 1 }}>{cat.icon}</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)', marginBottom: '0.25rem' }}>{cat.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-3)', fontWeight: 500 }}>{cat.n}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="section-pad" style={{ padding: '5rem 1.25rem', background: 'var(--navy)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <div className="section-label" style={{ color: 'rgba(232,81,42,0.9)', justifyContent: 'center', display: 'flex' }}>Proceso</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, color: 'white', marginBottom: '0.6rem' }}>Tan sencillo como describir<br />lo que necesitas</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.92rem', maxWidth: 400, margin: '0 auto' }}>De la descripción al profesional en tu puerta, en minutos.</p>
          </div>
          <div className="steps-grid reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.75rem', position: 'relative', overflow: 'hidden', transition: 'all .25s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(232,81,42,0.08)'; el.style.borderColor = 'rgba(232,81,42,0.3)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                <div style={{ position: 'absolute', top: -10, right: 12, fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '5rem', color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none' }}>{step.n}</div>
                <div style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{step.icon}</div>
                <div style={{ display: 'inline-block', background: 'rgba(232,81,42,0.15)', color: 'var(--coral)', borderRadius: 4, padding: '0.1rem 0.5rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>Paso {step.n}</div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.08rem', color: 'white', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROS */}
      <section id="profesionales" className="section-pad" style={{ padding: '5rem 1.25rem', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div className="section-label">Profesionales</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900 }}>Los mejor valorados</h2>
            </div>
            <Link href="/auth/signup" style={{ fontSize: '0.85rem', color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          <div className="pros-grid reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {PROS.map(pro => (
              <div key={pro.name} className="card" style={{ padding: '1.5rem' }}>
                <div className="pro-card-row" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: pro.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>{pro.initials}</div>
                  <div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>{pro.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-4)' }}>{pro.esp} · {pro.loc}</div>
                  </div>
                  <span className="badge-verified" style={{ marginLeft: 'auto' }}>✓ KYC</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#F59E0B', fontSize: '0.8rem' }}>★</span>)}
                  <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '0.92rem', color: 'var(--navy)' }}>{pro.rating}</span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--gray-3)' }}>· {pro.jobs} trabajos</span>
                </div>
                <Link href="/auth/signup" className="btn-navy" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.58rem' }}>Solicitar presupuesto</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section-pad" style={{ padding: '5rem 1.25rem', background: 'var(--sand)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-label" style={{ justifyContent: 'center', display: 'flex' }}>Garantías</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900 }}>Por qué elegir ReparoFácil</h2>
          </div>
          <div className="why-grid reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🛡️', title: 'Profesionales verificados', body: 'Verificación de identidad y credenciales antes de activar cada perfil.' },
              { icon: '⚡', title: 'Respuesta en 1 hora', body: 'Media de 28 minutos en urgencias. Sin esperas interminables.' },
              { icon: '💳', title: 'Pago retenido', body: 'Tu dinero queda protegido hasta que confirmes el trabajo bien hecho.' },
              { icon: '🤝', title: 'Garantía total', body: 'Si no quedas satisfecho, gestionamos el problema sin preguntas.' },
            ].map((f, i) => (
              <div key={i} className="card reveal" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.85rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: '0.45rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-4)', lineHeight: 1.65 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-pad" style={{ padding: '5rem 1.25rem', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-label" style={{ justifyContent: 'center', display: 'flex' }}>Opiniones</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900 }}>Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="testi-grid reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: '0.9rem' }}>{[1,2,3,4,5].map(j => <span key={j} style={{ color: '#F59E0B', fontSize: '0.85rem' }}>★</span>)}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-5)', lineHeight: 1.72, marginBottom: '1.25rem', fontStyle: 'italic' }}>"{t.q}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>{t.ini}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--navy)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--gray-3)' }}>{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad" style={{ padding: '5rem 1.25rem', background: 'var(--navy)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-label" style={{ color: 'rgba(232,81,42,0.9)', justifyContent: 'center', display: 'flex' }}>Empieza hoy</div>
            <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)', fontWeight: 900, color: 'white', marginBottom: '0.9rem' }}>
              ¿Listo para encontrar tu<br /><span style={{ color: 'var(--coral)', fontStyle: 'italic' }}>profesional ideal?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.92rem', marginBottom: '2rem', maxWidth: 420, margin: '0 auto 2rem' }}>
              Registro gratuito. Sin comisiones ocultas.
            </p>
            <div className="cta-btns" style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup?role=cliente" className="btn-primary" style={{ padding: '0.82rem 1.75rem', fontSize: '0.92rem' }}>Buscar un profesional</Link>
              <Link href="/auth/signup?role=profesional" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: '0.92rem', padding: '0.82rem 1.75rem', borderRadius: 6, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', transition: 'all .2s' }}>
                Soy profesional
              </Link>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.76rem', marginTop: '1.25rem' }}>✓ Gratis · ✓ Sin permanencia · ✓ Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#080F18', padding: '3rem 1.25rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem' }}>
                <div style={{ width: 28, height: 28, background: 'var(--coral)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔧</div>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.65 }}>La plataforma más confiable para servicios del hogar en España.</p>
            </div>
            {[
              { title: 'Plataforma', links: ['Cómo funciona', 'Para clientes', 'Para profesionales'] },
              { title: 'Empresa', links: ['Sobre nosotros', 'Blog', 'Contacto'] },
              { title: 'Legal', links: ['Términos', 'Privacidad', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: 'white', marginBottom: '0.85rem', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ marginBottom: '0.5rem' }}>
                    <a href="#" style={{ fontSize: '0.81rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                      {l}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.18)' }}>© 2025 ReparoFácil</span>
            <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.18)' }}>Hecho con ❤️ en España</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
