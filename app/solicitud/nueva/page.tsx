'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'

const CATEGORIAS = [
  { icon: '⚡', label: 'Electricidad' },
  { icon: '🔧', label: 'Fontanería' },
  { icon: '🎨', label: 'Pintura' },
  { icon: '🪟', label: 'Carpintería' },
  { icon: '❄️', label: 'Climatización' },
  { icon: '🧹', label: 'Limpieza' },
  { icon: '🏠', label: 'Reformas' },
  { icon: '🔒', label: 'Cerrajería' },
  { icon: '🌿', label: 'Jardinería' },
  { icon: '📦', label: 'Mudanzas' },
  { icon: '🔩', label: 'Otros' },
]

const URGENCIAS = [
  { value: 'urgente', label: '🚨 Urgente', desc: 'Lo antes posible' },
  { value: 'esta_semana', label: '📅 Esta semana', desc: 'En los próximos días' },
  { value: 'flexible', label: '🗓️ Flexible', desc: 'Sin prisa, me adapto' },
]

export default function NuevaSolicitud() {
  const { user } = useAuth()
  const router = useRouter()
  

  const [step, setStep] = useState(1)
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [urgencia, setUrgencia] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [direccion, setDireccion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!user) { router.push('/auth/login'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.from('trabajos').insert({
      cliente_id: user.id,
      tipo_servicio: categoria,
      descripcion: `${descripcion}\n\nUrgencia: ${urgencia}\nDirección: ${direccion}`,
      precio: presupuesto ? parseFloat(presupuesto) : null,
      estado: 'pendiente',
    })

    if (error) {
      setError('Error al crear la solicitud. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard/cliente?success=1')
  }

  const canNext1 = categoria !== ''
  const canNext2 = descripcion.length >= 20 && urgencia !== ''
  const canSubmit = direccion !== ''

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 2rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/dashboard/cliente" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#666', fontSize: '0.88rem', fontWeight: 500 }}>
            ← Volver al panel
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#FF5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔧</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#111' }}>
              reparo<span style={{ color: '#FF5C3A' }}>fácil</span>
            </span>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Progress */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            {['Servicio', 'Detalles', 'Ubicación'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step > i + 1 ? '#FF5C3A' : step === i + 1 ? '#FF5C3A' : 'white',
                  border: `2px solid ${step >= i + 1 ? '#FF5C3A' : 'rgba(0,0,0,0.15)'}`,
                  color: step >= i + 1 ? 'white' : '#aaa',
                  fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? '#111' : '#aaa' }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 100, height: 4 }}>
            <div style={{ background: '#FF5C3A', borderRadius: 100, height: '100%', width: `${((step - 1) / 2) * 100}%`, transition: 'width .4s ease' }} />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1.5px solid rgba(0,0,0,0.07)' }}>

          {/* Step 1: Categoría */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#111', marginBottom: '0.4rem' }}>
                ¿Qué tipo de servicio necesitas?
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.75rem' }}>
                Selecciona la categoría que mejor describe tu necesidad
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.75rem' }}>
                {CATEGORIAS.map(cat => (
                  <button key={cat.label} onClick={() => setCategoria(cat.label)} style={{
                    padding: '1rem 0.75rem',
                    background: categoria === cat.label ? '#FFF0ED' : '#F7F5F2',
                    border: `2px solid ${categoria === cat.label ? '#FF5C3A' : 'transparent'}`,
                    borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
                    textAlign: 'center', fontFamily: 'DM Sans, sans-serif',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{cat.icon}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: categoria === cat.label ? '#FF5C3A' : '#333' }}>
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Detalles */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#111', marginBottom: '0.4rem' }}>
                Cuéntanos más detalles
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.75rem' }}>
                Cuanto más detallado, mejores propuestas recibirás
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                  Describe el trabajo
                </label>
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Ej: Tengo un enchufe que no funciona en la cocina, además necesito instalar un nuevo punto de luz en el salón..."
                  rows={5}
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 12,
                    fontSize: '0.92rem', color: '#111', outline: 'none',
                    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                    resize: 'vertical', lineHeight: 1.6,
                    transition: 'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#FF5C3A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                />
                <div style={{ fontSize: '0.75rem', color: descripcion.length >= 20 ? '#16A34A' : '#aaa', marginTop: '0.3rem', textAlign: 'right' }}>
                  {descripcion.length} caracteres {descripcion.length < 20 && '(mínimo 20)'}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.75rem' }}>
                  ¿Cuándo lo necesitas?
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {URGENCIAS.map(u => (
                    <button key={u.value} onClick={() => setUrgencia(u.value)} style={{
                      padding: '0.85rem 1rem', textAlign: 'left',
                      background: urgencia === u.value ? '#FFF0ED' : '#F7F5F2',
                      border: `2px solid ${urgencia === u.value ? '#FF5C3A' : 'transparent'}`,
                      borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
                      display: 'flex', alignItems: 'center', gap: 12,
                      fontFamily: 'DM Sans, sans-serif',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: urgencia === u.value ? '#FF5C3A' : '#333' }}>{u.label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#888' }}>{u.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                  Presupuesto aproximado (opcional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={presupuesto}
                    onChange={e => setPresupuesto(e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 12,
                      fontSize: '0.95rem', color: '#111', outline: 'none',
                      fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888', fontWeight: 600 }}>€</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ubicación */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#111', marginBottom: '0.4rem' }}>
                ¿Dónde necesitas el servicio?
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.75rem' }}>
                Indica la dirección para que los profesionales de tu zona puedan contactarte
              </p>

              {/* Summary */}
              <div style={{ background: '#F7F5F2', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1.5px solid rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Tu solicitud</div>
                <div style={{ fontWeight: 700, color: '#111', fontSize: '0.95rem' }}>{categoria}</div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>{descripcion.slice(0, 80)}{descripcion.length > 80 ? '...' : ''}</div>
              </div>

              {error && (
                <div style={{ background: '#FFF0ED', border: '1px solid rgba(255,92,58,.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#FF5C3A', fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                  Dirección completa
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="Calle Mayor 1, 2º A, 28001 Madrid"
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 12,
                    fontSize: '0.95rem', color: '#111', outline: 'none',
                    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                    transition: 'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#FF5C3A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.12)'}
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '0.75rem' }}>
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} style={{
                background: 'white', border: '1.5px solid rgba(0,0,0,0.12)',
                borderRadius: 12, padding: '0.75rem 1.5rem',
                fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer',
                color: '#333', fontFamily: 'DM Sans, sans-serif',
              }}>← Atrás</button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 ? !canNext1 : !canNext2}
                style={{
                  background: (step === 1 ? canNext1 : canNext2) ? '#FF5C3A' : '#ddd',
                  color: (step === 1 ? canNext1 : canNext2) ? 'white' : '#aaa',
                  border: 'none', borderRadius: 12, padding: '0.75rem 1.75rem',
                  fontSize: '0.92rem', fontWeight: 700, cursor: (step === 1 ? canNext1 : canNext2) ? 'pointer' : 'not-allowed',
                  fontFamily: 'Syne, sans-serif', transition: 'all .2s',
                  boxShadow: (step === 1 ? canNext1 : canNext2) ? '0 4px 16px rgba(255,92,58,.3)' : 'none',
                }}
              >
                Continuar →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                style={{
                  background: canSubmit && !loading ? '#FF5C3A' : '#ddd',
                  color: canSubmit && !loading ? 'white' : '#aaa',
                  border: 'none', borderRadius: 12, padding: '0.75rem 1.75rem',
                  fontSize: '0.92rem', fontWeight: 700, cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
                  fontFamily: 'Syne, sans-serif',
                  boxShadow: canSubmit && !loading ? '0 4px 16px rgba(255,92,58,.3)' : 'none',
                }}
              >
                {loading ? 'Enviando...' : '🚀 Publicar solicitud'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
