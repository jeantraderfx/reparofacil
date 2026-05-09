'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const CATEGORIES = [
  { icon: '⚡', label: 'Electricidad', count: '234 pros', color: '#FFF3CD' },
  { icon: '🔧', label: 'Fontanería', count: '189 pros', color: '#E8F4FD' },
  { icon: '🎨', label: 'Pintura', count: '312 pros', color: '#F3E8FF' },
  { icon: '🪟', label: 'Carpintería', count: '156 pros', color: '#EDFBF3' },
  { icon: '❄️', label: 'Climatización', count: '98 pros', color: '#FFF0ED' },
  { icon: '🧹', label: 'Limpieza', count: '421 pros', color: '#FFF9EC' },
  { icon: '🏠', label: 'Reformas', count: '267 pros', color: '#F0F4FF' },
  { icon: '🔒', label: 'Cerrajería', count: '143 pros', color: '#FFF0F9' },
]

const STEPS = [
  { num: '01', title: 'Describe tu necesidad', desc: 'Cuéntanos qué necesitas reparar o instalar.', icon: '📝' },
  { num: '02', title: 'Elige tu profesional', desc: 'Recibe propuestas de pros verificados en tu zona.', icon: '👤' },
  { num: '03', title: 'Paga con seguridad', desc: 'El pago queda retenido hasta que el trabajo esté completado.', icon: '✅' },
]

const TESTIMONIALS = [
  { text: 'El electricista llegó en menos de una hora. Trabajo impecable y precio exactamente el acordado.', author: 'María G.', location: 'Madrid', initials: 'MG', bg: '#FF5C3A' },
  { text: 'Nunca había tenido tanta facilidad para encontrar un fontanero de confianza.', author: 'Antonio L.', location: 'Valencia', initials: 'AL', bg: '#6366F1' },
  { text: 'Como profesional ha multiplicado mis clientes. Recibo encargos todos los días.', author: 'Isabel M.', location: 'Barcelona', initials: 'IM', bg: '#0EA5E9' },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(e => e.forEach(x => { if (x.isIntersecting) x.target.classList.add('visible') }), { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect() }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent', transition: 'all 0.3s', padding: '0 2rem' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FF5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#111', letterSpacing: '-0.03em' }}>reparo<span style={{ color: '#FF5C3A' }}>fácil</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="#como-funciona" style={{ color: '#555', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none' }}>Cómo funciona</a>
            <Link href="/auth/login" style={{ color: '#111', fontSize: '0.92rem', fontWeight: 600, textDecoration: 'none', padding: '0.45rem 1.1rem', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 100 }}>Entrar</Link>
            <Link href="/auth/signup" style={{ background: '#FF5C3A', color: 'white', fontSize: '0.92rem', fontWeight: 600, textDecoration: 'none', padding: '0.48rem 1.2rem', borderRadius: 100, boxShadow: '0 4px 16px rgba(255,92,58,.3)' }}>Registrarse</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', paddingTop: 72, background: 'radial-gradient(ellipse 80% 60% at 10% 0%,rgba(255,92,58,.10) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 90% 10%,rgba(255,180,50,.07) 0%,transparent 60%),#F7F5F2', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '4rem 2rem 5rem', width: '100%' }}>
          <div style={{ maxWidth: 640 }}>
            <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFF0ED', borderRadius: 100, padding: '0.3rem 0.9rem 0.3rem 0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ background: '#FF5C3A', color: 'white', borderRadius: 100, padding: '0.1rem 0.55rem', fontSize: '0.72rem', fontWeight: 700 }}>NUEVO</span>
              <span style={{ fontSize: '0.82rem', color: '#FF5C3A', fontWeight: 600 }}>+12.000 profesionales verificados en España</span>
            </div>
            <h1 className="animate-fade-up d1" style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem,5vw,3.6rem)', color: '#111', marginBottom: '1.2rem' }}>
              El profesional <span style={{ color: '#FF5C3A' }}>adecuado</span> para cada trabajo
            </h1>
            <p className="animate-fade-up d2" style={{ fontSize: '1.08rem', color: '#555', lineHeight: 1.65, marginBottom: '2.2rem' }}>
              Conectamos clientes con profesionales verificados de confianza. Sin intermediarios, con precios claros y garantía en cada trabajo.
            </p>
            <div className="animate-fade-up d3" style={{ background: 'white', borderRadius: 16, padding: '0.6rem', boxShadow: '0 8px 40px rgba(0,0,0,0.10)', border: '1.5px solid rgba(0,0,0,0.07)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: 520 }}>
              <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem 0.75rem', background: '#F7F5F2', borderRadius: 10 }}>
                <span style={{ color: '#FF5C3A' }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="¿Qué necesitas reparar?" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#111', fontFamily: 'DM Sans,sans-serif', width: '100%' }} />
              </div>
              <Link href={`/auth/signup?q=${encodeURIComponent(search)}`} style={{ background: '#FF5C3A', color: 'white', fontWeight: 700, padding: '0.7rem 1.4rem', borderRadius: 10, fontSize: '0.92rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(255,92,58,.35)', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                Buscar →
              </Link>
            </div>
            <div className="animate-fade-up d4" style={{ display: 'flex', gap: '1.2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {['✅ Verificados', '🔒 Pago seguro', '⭐ Garantía'].map(t => (
                <div key={t} style={{ fontSize: '0.82rem', color: '#555', fontWeight: 500 }}>{t}</div>
              ))}
            </div>
          </div>
          <div className="animate-fade-up d5" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            {[['12.000+','Profesionales'],['58.000+','Trabajos'],['4.96','Valoración media'],['95%','Satisfacción']].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#FF5C3A' }}>{v}</div>
                <div style={{ fontSize: '0.82rem', color: '#777', fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '6rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#111', marginBottom: '0.75rem' }}>¿Qué necesitas hoy?</h2>
            <p style={{ fontSize: '1.05rem', color: '#666' }}>Profesionales especializados en más de 30 categorías</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.label} href={`/auth/signup?cat=${encodeURIComponent(cat.label)}`} style={{ textDecoration: 'none' }}>
                <div className="reveal" style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1.5px solid rgba(0,0,0,0.08)', transition: 'all 0.25s', cursor: 'pointer' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.boxShadow='0 12px 40px rgba(0,0,0,0.10)'; el.style.borderColor='#FF5C3A' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(0)'; el.style.boxShadow='none'; el.style.borderColor='rgba(0,0,0,0.08)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>{cat.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#111', marginBottom: '0.3rem', fontFamily: 'Syne,sans-serif' }}>{cat.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{cat.count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" style={{ padding: '6rem 2rem', background: '#F7F5F2' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#111', marginBottom: '0.75rem' }}>Tan fácil como 1, 2, 3</h2>
            <p style={{ fontSize: '1.05rem', color: '#666' }}>Desde la solicitud hasta el pago, todo bajo control</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
            {STEPS.map(step => (
              <div key={step.num} className="reveal" style={{ background: 'white', borderRadius: 20, padding: '2rem', border: '1.5px solid rgba(0,0,0,0.07)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -10, right: 16, fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: '5rem', color: 'rgba(255,92,58,.06)', lineHeight: 1, userSelect: 'none' }}>{step.num}</div>
                <div style={{ fontSize: '2.2rem', marginBottom: '1.25rem' }}>{step.icon}</div>
                <div style={{ display: 'inline-block', background: '#FFF0ED', color: '#FF5C3A', borderRadius: 100, padding: '0.15rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>PASO {step.num}</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#111', marginBottom: '0.6rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '6rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#111' }}>Lo que dicen nuestros usuarios</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.author} className="reveal" style={{ background: '#F7F5F2', borderRadius: 20, padding: '1.75rem', border: '1.5px solid rgba(0,0,0,0.07)', transition: 'all .25s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='white'; el.style.boxShadow='0 12px 40px rgba(0,0,0,0.08)'; el.style.borderColor='#FF5C3A' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='#F7F5F2'; el.style.boxShadow='none'; el.style.borderColor='rgba(0,0,0,0.07)' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: '1rem' }}>{'⭐⭐⭐⭐⭐'.split('').map((s,i) => <span key={i}>{s}</span>)}</div>
                <p style={{ fontSize: '0.93rem', color: '#333', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>{t.author}</div>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', background: '#F7F5F2' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div className="reveal" style={{ background: '#111', borderRadius: 28, padding: '3.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,92,58,.12)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem,4vw,2.4rem)', color: 'white', marginBottom: '0.75rem' }}>¿Listo para empezar?</h2>
              <p style={{ fontSize: '1.05rem', color: '#aaa', maxWidth: 460, margin: '0 auto 2rem' }}>Únete gratis y encuentra el profesional que necesitas hoy mismo.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/auth/signup?role=cliente" style={{ background: '#FF5C3A', color: 'white', fontWeight: 700, padding: '0.85rem 2rem', borderRadius: 100, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 8px 32px rgba(255,92,58,.4)' }}>Buscar un profesional</Link>
                <Link href="/auth/signup?role=profesional" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 600, padding: '0.85rem 2rem', borderRadius: 100, fontSize: '0.95rem', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.15)' }}>Soy profesional</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0A0A0A', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FF5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔧</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1rem', color: 'white' }}>reparo<span style={{ color: '#FF5C3A' }}>fácil</span></span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#444' }}>© 2025 ReparoFácil. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  )
}
