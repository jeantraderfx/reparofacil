'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false); return }
    const role = data.user?.user_metadata?.role
    router.push(role === 'profesional' ? '/dashboard/profesional' : '/dashboard/cliente')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex' }}>
      {/* Left panel */}
      <div style={{ flex: '0 0 480px', background: 'var(--navy)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3.5rem' }} className="hidden lg:flex">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '4rem' }}>
          <div style={{ width: 36, height: 36, background: 'var(--coral)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
        </Link>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '2.2rem', color: 'white', lineHeight: 1.15, marginBottom: '1.5rem' }}>
          Tu hogar en buenas manos.<br />
          <span style={{ color: 'var(--coral)', fontStyle: 'italic' }}>Siempre.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.92rem', lineHeight: 1.7, maxWidth: 320 }}>
          Más de 12.000 profesionales verificados esperando para ayudarte.
        </p>
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {['✓ Profesionales verificados con KYC', '✓ Pago retenido hasta finalizar', '✓ Garantía de satisfacción'].map(t => (
            <div key={t} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--coral)' }}>✓</span>
              {t.slice(2)}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: '2.5rem' }}>
            <div style={{ width: 32, height: 32, background: 'var(--coral)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔧</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
          </Link>

          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.9rem', color: 'var(--navy)', marginBottom: '0.4rem' }}>Bienvenido de nuevo</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--gray-4)', marginBottom: '2rem' }}>Entra en tu cuenta para continuar</p>

          {error && (
            <div style={{ background: '#FDF1ED', border: '1px solid rgba(232,81,42,0.25)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--coral)', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem', letterSpacing: '0.01em' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" className="input" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.82rem', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--gray-4)', marginTop: '1.5rem' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
