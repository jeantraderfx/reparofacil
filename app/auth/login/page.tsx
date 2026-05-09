'use client'

export const dynamic = 'force-dynamic'

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
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    // Get role from user metadata
    const role = data.user?.user_metadata?.role
    if (role === 'profesional') {
      router.push('/dashboard/profesional')
    } else {
      router.push('/dashboard/cliente')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: '2rem', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FF5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#111' }}>
            reparo<span style={{ color: '#FF5C3A' }}>fácil</span>
          </span>
        </Link>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1.5px solid rgba(0,0,0,0.07)' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#111', marginBottom: '0.4rem' }}>
            Bienvenido de nuevo
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '2rem' }}>
            Entra en tu cuenta para continuar
          </p>

          {error && (
            <div style={{ background: '#FFF0ED', border: '1px solid rgba(255,92,58,.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#FF5C3A', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.85rem',
                background: loading ? '#ccc' : '#FF5C3A',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Syne, sans-serif', transition: 'all .2s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(255,92,58,.3)',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#888', marginTop: '1.5rem' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/auth/signup" style={{ color: '#FF5C3A', fontWeight: 600, textDecoration: 'none' }}>
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
