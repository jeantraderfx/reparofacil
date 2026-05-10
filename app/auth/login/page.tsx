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
      <style>{`
        @media(max-width:768px){
          .login-left{display:none!important}
          .login-right{padding:2rem 1.25rem!important}
        }
      `}</style>

      {/* Left panel - hidden on mobile */}
      <div className="login-left" style={{ flex: '0 0 440px', background: 'var(--navy)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '3.5rem' }}>
          <div style={{ width: 34, height: 34, background: 'var(--coral)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🔧</div>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.15rem', color: 'white' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
        </Link>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '2rem', color: 'white', lineHeight: 1.15, marginBottom: '1.25rem' }}>
          Tu hogar en buenas manos.<br /><span style={{ color: 'var(--coral)', fontStyle: 'italic' }}>Siempre.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 300, marginBottom: '2.5rem' }}>
          Más de 12.000 profesionales verificados esperando para ayudarte.
        </p>
        {['Profesionales verificados con KYC', 'Pago retenido hasta finalizar', 'Garantía de satisfacción'].map(t => (
          <div key={t} style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--coral)', fontWeight: 700 }}>✓</span>{t}
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div className="login-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: '2.5rem' }}>
            <div style={{ width: 30, height: 30, background: 'var(--coral)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔧</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
          </Link>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '0.35rem' }}>Bienvenido de nuevo</h1>
          <p style={{ fontSize: '0.87rem', color: 'var(--gray-4)', marginBottom: '2rem' }}>Entra en tu cuenta para continuar</p>
          {error && <div style={{ background: '#FDF1ED', border: '1px solid rgba(232,81,42,0.25)', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1.25rem', fontSize: '0.84rem', color: 'var(--coral)', fontWeight: 500 }}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" className="input" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--gray-4)', marginTop: '1.5rem' }}>
            ¿No tienes cuenta?{' '}<Link href="/auth/signup" style={{ color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
