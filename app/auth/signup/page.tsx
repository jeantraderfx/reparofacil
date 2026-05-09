'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  

  const [role, setRole] = useState<'cliente' | 'profesional'>(
    (searchParams.get('role') as 'cliente' | 'profesional') || 'cliente'
  )
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefono, setTelefono] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const especialidades = [
    'Electricidad', 'Fontanería', 'Pintura', 'Carpintería',
    'Climatización', 'Limpieza', 'Reformas', 'Cerrajería',
    'Jardinería', 'Mudanzas', 'Otros'
  ]

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          role,
          telefono,
          especialidad: role === 'profesional' ? especialidad : null,
        }
      }
    })

    if (error) {
      setError(error.message === 'User already registered' ? 'Este email ya está registrado' : error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Insert profile
      if (role === 'cliente') {
        await supabase.from('cliente_profiles').insert({
          user_id: data.user.id,
          telefono,
        })
      } else {
        await supabase.from('profesional_profiles').insert({
          user_id: data.user.id,
          especialidad,
          telefono,
          anos_experiencia: 0,
          rating: null,
          trabajos_completados: 0,
          certificado: false,
        })
      }
      setSuccess(true)
      setTimeout(() => {
        router.push(role === 'profesional' ? '/dashboard/profesional' : '/dashboard/cliente')
      }, 1500)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#111' }}>¡Cuenta creada!</h2>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>Redirigiendo a tu panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: '2rem', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FF5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#111' }}>
            reparo<span style={{ color: '#FF5C3A' }}>fácil</span>
          </span>
        </Link>

        <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1.5px solid rgba(0,0,0,0.07)' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#111', marginBottom: '0.4rem' }}>
            Crear cuenta gratis
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.75rem' }}>
            Únete a más de 12.000 usuarios en España
          </p>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {(['cliente', 'profesional'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: '0.85rem',
                background: role === r ? '#FFF0ED' : 'white',
                border: `2px solid ${role === r ? '#FF5C3A' : 'rgba(0,0,0,0.10)'}`,
                borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
                fontFamily: 'Syne, sans-serif',
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{r === 'cliente' ? '🏠' : '🔧'}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: role === r ? '#FF5C3A' : '#333' }}>
                  {r === 'cliente' ? 'Soy cliente' : 'Soy profesional'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>
                  {r === 'cliente' ? 'Busco servicios' : 'Ofrezco servicios'}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: '#FFF0ED', border: '1px solid rgba(255,92,58,.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#FF5C3A', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            {[
              { label: 'Nombre completo', value: nombre, set: setNombre, type: 'text', placeholder: 'Juan García' },
              { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'tu@email.com' },
              { label: 'Contraseña', value: password, set: setPassword, type: 'password', placeholder: '••••••••' },
              { label: 'Teléfono', value: telefono, set: setTelefono, type: 'tel', placeholder: '+34 600 000 000' },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  required
                  placeholder={field.placeholder}
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
            ))}

            {role === 'profesional' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                  Especialidad
                </label>
                <select
                  value={especialidad}
                  onChange={e => setEspecialidad(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 12,
                    fontSize: '0.95rem', color: '#111', outline: 'none',
                    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                    background: 'white', cursor: 'pointer',
                  }}
                >
                  <option value="">Selecciona tu especialidad</option>
                  {especialidades.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.85rem', marginTop: '0.5rem',
                background: loading ? '#ccc' : '#FF5C3A',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Syne, sans-serif', transition: 'all .2s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(255,92,58,.3)',
              }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#888', marginTop: '1.5rem' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" style={{ color: '#FF5C3A', fontWeight: 600, textDecoration: 'none' }}>
              Entrar
            </Link>
          </p>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#bbb', marginTop: '1rem' }}>
            Al registrarte aceptas nuestros{' '}
            <a href="#" style={{ color: '#888' }}>Términos de uso</a>
            {' '}y{' '}
            <a href="#" style={{ color: '#888' }}>Política de privacidad</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7F5F2' }} />}>
      <SignupForm />
    </Suspense>
  )
}
