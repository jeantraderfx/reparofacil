'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const CATS = [
  { icon: '⚡', label: 'Electricidad', n: '234 profesionales' },
  { icon: '🔧', label: 'Fontanería', n: '189 profesionales' },
  { icon: '🎨', label: 'Pintura', n: '312 profesionales' },
  { icon: '🪟', label: 'Carpintería', n: '156 profesionales' },
  { icon: '❄️', label: 'Climatización', n: '98 profesionales' },
  { icon: '🧹', label: 'Limpieza', n: '421 profesionales' },
  { icon: '🏠', label: 'Reformas', n: '267 profesionales' },
  { icon: '🔒', label: 'Cerrajería', n: '143 profesionales' },
  { icon: '🌿', label: 'Jardinería', n: '112 profesionales' },
]

const PROS = [
  { initials: 'CM', name: 'Carlos M.', esp: 'Electricista', loc: 'Madrid', rating: 4.9, jobs: 187, verified: true, bg: '#E8512A' },
  { initials: 'LF', name: 'Lucía F.', esp: 'Pintora', loc: 'Barcelona', rating: 5.0, jobs: 243, verified: true, bg: '#0D1B2A' },
  { initials: 'JR', name: 'Javier R.', esp: 'Fontanero', loc: 'Sevilla', rating: 4.8, jobs: 134, verified: true, bg: '#1A7A4A' },
]

const STEPS = [
  { n: '1', icon: '✍️', title: 'Describe tu problema', body: 'Escribe con tus palabras. Nuestra IA entiende cualquier descripción y clasifica el servicio automáticamente.' },
  { n: '2', icon: '🗺️', title: 'Elige en el mapa', body: 'Visualiza los profesionales verificados más cercanos a ti, ordenados por valoración y distancia.' },
  { n: '3', icon: '✅', title: 'Trabaja con garantía', body: 'El profesional acepta el trabajo. El pago queda retenido hasta que confirmes que todo está correcto.' },
]

const STATS = [
  { v: '12.400+', l: 'Profesionales activos' },
  { v: '58.000+', l: 'Trabajos completados' },
  { v: '4.96', l: 'Valoración media' },
  { v: '95%', l: 'Satisfacción garantizada' },
]

const TESTIMONIALS = [
  { q: 'El electricista llegó en menos de una hora. Trabajo impecable y precio exactamente el acordado.', name: 'María G.', loc: 'Madrid', ini: 'MG', bg: '#E8512A' },
  { q: 'Nunca había tenido tanta facilidad para encontrar un fontanero de confianza en mi zona.', name: 'Antonio L.', loc: 'Valencia', ini: 'AL', bg: '#0D1B2A' },
  { q: 'Como profesional ha multiplicado mis clientes. La plataforma es muy seria y bien organizada.', name: 'Isabel M.', loc: 'Barcelona', ini: 'IM', bg: '#1A7A4A' },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )
    els.forEach(el => obs.observe(el))
    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect() }
  }, [])

  const Stars = ({ r }: { r: number }) => (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(r) ? '#F59E0B' : '#E2E0DC', fontSize: '0.78rem' }}>★</span>)}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.0)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: 'var(--coral)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🔧</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.18rem', color: 'var(--navy)', letterSpacing: '-0.02em' }}>
              Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span>
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#servicios" className="nav-link">Servicios</a>
            <a href="#como-funciona" className="nav-link">Cómo funciona</a>
            <a href="#profesionales" className="nav-link">Profesionales</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/auth/login" className="btn-outline" style={{ padding: '0.55rem 1.1rem', fontSize: '0.86rem' }}>Entrar</Link>
            <Link href="/auth/signup" className="btn-primary" style={{ padding: '0.58rem 1.2rem', fontSize: '0.86rem' }}>Regístrate gratis</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section style={{ paddingTop: 68, background: 'var(--sand)', minHeight: '88vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '48px 48px', opacity: 0.5, pointerEvents: 'none' }} />
        {/* Coral accent blob */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 480, height: 480, background: 'radial-gradient(circle, rgba(232,81,42,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem 6rem', width: '100%', position: 'relative' }}>
          <div style={{ maxWidth: 680 }}>
            <div className="anim-up" style={{ marginBottom: '1.25rem' }}>
              <span className="tag">✦ Plataforma verificada · España</span>
            </div>

            <h1 className="anim-up d1" style={{ fontSize: 'clamp(2.6rem,5.5vw,4rem)', fontWeight: 900, marginBottom: '1.25rem', lineHeight: 1.08, color: 'var(--navy)' }}>
              Tu hogar en buenas manos.<br />
              <span style={{ color: 'var(--coral)', fontStyle: 'italic' }}>Siempre.</span>
            </h1>

            <p className="anim-up d2" style={{ fontSize: '1.05rem', color: 'var(--gray-4)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 520, fontWeight: 400 }}>
              Describe lo que necesitas y nuestra IA encuentra al profesional verificado más cercano a ti en segundos. Sin sorpresas, con garantía.
            </p>

            {/* Search box */}
            <div className="anim-up d3" style={{ background: 'white', borderRadius: 10, padding: '0.5rem 0.5rem 0.5rem 1.25rem', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: 560 }}>
              <span style={{ fontSize: '1rem' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ej: se me rompió el grifo del baño..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', color: 'var(--navy)', background: 'transparent', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
              <Link href={`/auth/signup?q=${encodeURIComponent(search)}`} className="btn-primary" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                Buscar profesional
              </Link>
            </div>

            {/* Popular searches */}
            <div className="anim-up d4" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--gray-3)', fontWeight: 500 }}>Frecuentes:</span>
              {['Fontanero urgente', 'Electricista', 'Pintar piso', 'Cerrajero'].map(s => (
                <button key={s} onClick={() => setSearch(s)} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 100, padding: '0.2rem 0.75rem', fontSize: '0.78rem', color: 'var(--gray-4)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--coral)'; (e.currentTarget as HTMLElement).style.color = 'var(--coral)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--gray-4)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <div className="anim-up d5" style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
            {STATS.map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '2rem', color: 'var(--coral)', letterSpacing: '-0.03em' }}>{s.v}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-3)', fontWeight: 500, marginTop: '0.1rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ───────────────────────────────────────────── */}
      <section id="servicios" style={{ padding: '6rem 2rem', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: '3rem' }}>
            <div className="section-label">Servicios</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 900 }}>¿Qué necesitas hoy?</h2>
              <Link href="/auth/signup" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>
                Ver todos los servicios →
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
            {CATS.map((cat, i) => (
              <div key={cat.label} className="reveal" style={{ animationDelay: `${i * 0.04}s` }}>
                <Link href={`/auth/signup?cat=${encodeURIComponent(cat.label)}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="card" style={{ padding: '1.5rem 1.25rem', cursor: 'pointer' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--coral)'; el.style.transform = 'translateY(-3px)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = 'translateY(0)' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.9rem', lineHeight: 1 }}>{cat.icon}</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: '0.3rem' }}>{cat.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-3)', fontWeight: 500 }}>{cat.n}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="como-funciona" style={{ padding: '6rem 2rem', background: 'var(--navy)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
            <div className="section-label" style={{ color: 'rgba(232,81,42,0.9)' }}>Proceso</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 900, color: 'white', marginBottom: '0.75rem' }}>
              Tan sencillo como describir<br />lo que necesitas
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: 440, margin: '0 auto' }}>
              De la descripción al profesional en tu puerta, en minutos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {STEPS.map((step, i) => (
              <div key={step.n} className="reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '2rem', position: 'relative', overflow: 'hidden', transition: 'all .25s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(232,81,42,0.08)'; el.style.borderColor = 'rgba(232,81,42,0.3)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.08)' }}>
                  {/* Step number watermark */}
                  <div style={{ position: 'absolute', top: -12, right: 16, fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '6rem', color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{step.n}</div>
                  <div style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>{step.icon}</div>
                  <div style={{ display: 'inline-block', background: 'rgba(232,81,42,0.15)', color: 'var(--coral)', borderRadius: 4, padding: '0.12rem 0.55rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Paso {step.n}
                  </div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.15rem', color: 'white', marginBottom: '0.6rem' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROS ──────────────────────────────────────── */}
      <section id="profesionales" style={{ padding: '6rem 2rem', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="section-label">Profesionales</div>
              <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 900 }}>Los mejor valorados</h2>
            </div>
            <Link href="/auth/signup" style={{ fontSize: '0.85rem', color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>Ver todos →</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {PROS.map((pro, i) => (
              <div key={pro.name} className="reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: pro.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0, position: 'relative' }}>
                      {pro.initials}
                      <div className="dot-online" style={{ position: 'absolute', bottom: 1, right: 1 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '0.1rem' }}>{pro.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-4)' }}>{pro.esp} · {pro.loc}</div>
                    </div>
                    {pro.verified && <span className="badge-verified">✓ Verificado</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                    <Stars r={pro.rating} />
                    <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>{pro.rating}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-3)' }}>· {pro.jobs} trabajos</span>
                  </div>
                  <Link href="/auth/signup" className="btn-navy" style={{ width: '100%', justifyContent: 'center', fontSize: '0.86rem', padding: '0.6rem' }}>
                    Solicitar presupuesto
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ─────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', background: 'var(--sand)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-label">Garantías</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
              Por qué elegir ReparoFácil
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '🛡️', title: 'Profesionales verificados', body: 'Cada profesional pasa por verificación de identidad y credenciales antes de activar su perfil.' },
              { icon: '⚡', title: 'Respuesta en menos de 1 hora', body: 'Media de 28 minutos para responder en servicios urgentes. Sin esperas eternas.' },
              { icon: '💳', title: 'Pago retenido hasta finalizar', body: 'Tu dinero queda protegido hasta que confirmes que el trabajo está bien hecho.' },
              { icon: '🤝', title: 'Garantía de satisfacción', body: 'Si no quedas satisfecho, gestionamos el problema sin preguntas incómodas.' },
            ].map((f, i) => (
              <div key={i} className="reveal card" style={{ padding: '1.75rem', animationDelay: `${i * 0.08}s` }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '0.55rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.87rem', color: 'var(--gray-4)', lineHeight: 1.7 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-label">Opiniones</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 900 }}>Lo que dicen nuestros usuarios</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="reveal card" style={{ padding: '1.75rem', animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(j => <span key={j} style={{ color: '#F59E0B', fontSize: '0.85rem' }}>★</span>)}
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--gray-5)', lineHeight: 1.75, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  "{t.q}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{t.ini}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-3)' }}>{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', background: 'var(--navy)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-label" style={{ color: 'rgba(232,81,42,0.9)', justifyContent: 'center', display: 'flex' }}>Empieza hoy</div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>
              ¿Listo para encontrar<br />
              <span style={{ color: 'var(--coral)', fontStyle: 'italic' }}>tu profesional ideal?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginBottom: '2.5rem', maxWidth: 460, margin: '0 auto 2.5rem' }}>
              Registro gratuito. Sin comisiones ocultas. Encuentra un profesional verificado en tu zona hoy mismo.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup?role=cliente" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
                Buscar un profesional
              </Link>
              <Link href="/auth/signup?role=profesional" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem', padding: '0.85rem 2rem', borderRadius: 6, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', transition: 'all .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'}>
                Registrarme como profesional
              </Link>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
              ✓ Registro gratuito &nbsp;·&nbsp; ✓ Sin permanencia &nbsp;·&nbsp; ✓ Cancelación en cualquier momento
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{ background: '#080F18', padding: '3.5rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: '1rem' }}>
                <div style={{ width: 30, height: 30, background: 'var(--coral)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔧</div>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', color: 'white' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, maxWidth: 200 }}>
                La plataforma más confiable para servicios del hogar en España.
              </p>
            </div>
            {[
              { title: 'Plataforma', links: ['Cómo funciona', 'Para clientes', 'Para profesionales', 'Precios'] },
              { title: 'Empresa', links: ['Sobre nosotros', 'Blog', 'Prensa', 'Carreras'] },
              { title: 'Legal', links: ['Términos de uso', 'Privacidad', 'Cookies', 'Contacto'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: 'white', marginBottom: '1rem', fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ marginBottom: '0.6rem' }}>
                    <a href="#" style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                      {l}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>© 2025 ReparoFácil · Todos los derechos reservados.</span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>Hecho con ❤️ en España</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
