'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const ESPECIALIDADES = [
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
]

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState<'cliente' | 'profesional'>((searchParams.get('role') as any) || 'cliente')
  const [step, setStep] = useState(1)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefono, setTelefono] = useState('')
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [direccion, setDireccion] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [kyc, setKyc] = useState<File | null>(null)
  const [kycName, setKycName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fotoRef = useRef<HTMLInputElement>(null)
  const kycRef = useRef<HTMLInputElement>(null)

  const toggleEsp = (esp: string) => {
    setEspecialidades(prev => prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp])
  }

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const handleKyc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setKyc(file)
    setKycName(file.name)
  }

  const geocodeDireccion = async (dir: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(dir + ', España')}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`)
      const data = await res.json()
      if (data.results?.[0]) {
        const { lat, lng } = data.results[0].geometry.location
        return { lat, lng }
      }
    } catch {}
    return null
  }

  const handleSignup = async () => {
    if (!nombre || !email || !password) { setError('Completa todos los campos'); return }
    if (role === 'profesional') {
      if (especialidades.length === 0) { setError('Selecciona al menos una especialidad'); return }
      if (!foto) { setError('La foto de perfil es obligatoria'); return }
      if (!direccion) { setError('La dirección es obligatoria'); return }
    }
    setLoading(true); setError('')

    const { data, error: signupError } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre, role, telefono } }
    })

    if (signupError) { setError(signupError.message === 'User already registered' ? 'Este email ya está registrado' : signupError.message); setLoading(false); return }
    if (!data.user) { setError('Error al crear la cuenta'); setLoading(false); return }

    const userId = data.user.id

    if (role === 'cliente') {
      await supabase.from('cliente_profiles').insert({ user_id: userId, telefono })
    } else {
      // Upload foto
      let fotoUrl = null
      if (foto) {
        const ext = foto.name.split('.').pop()
        const { data: uploadData } = await supabase.storage.from('avatares').upload(`${userId}/foto.${ext}`, foto, { upsert: true })
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(uploadData.path)
          fotoUrl = urlData.publicUrl
        }
      }

      // Upload KYC
      let kycUrl = null
      if (kyc) {
        const ext = kyc.name.split('.').pop()
        const { data: kycData } = await supabase.storage.from('avatares').upload(`${userId}/kyc.${ext}`, kyc, { upsert: true })
        if (kycData) {
          const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(kycData.path)
          kycUrl = urlData.publicUrl
        }
      }

      // Geocode address
      const coords = await geocodeDireccion(direccion)

      await supabase.from('profesional_profiles').insert({
        user_id: userId,
        especialidad: especialidades[0],
        especialidades,
        telefono,
        foto_url: fotoUrl,
        direccion,
        lat: coords?.lat || null,
        lng: coords?.lng || null,
        kyc_documento_url: kycUrl,
        trabajos_completados: 0,
        disponible: true,
      })
    }

    setSuccess(true)
    setTimeout(() => router.push(role === 'profesional' ? '/dashboard/profesional' : '/dashboard/cliente'), 1500)
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#111' }}>¡Cuenta creada!</h2>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>Redirigiendo...</p>
        </div>
      </div>
    )
  }

  const totalSteps = role === 'profesional' ? 3 : 1

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: '2rem', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FF5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#111' }}>reparo<span style={{ color: '#FF5C3A' }}>fácil</span></span>
        </Link>

        <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1.5px solid rgba(0,0,0,0.07)' }}>
          {/* Role selector */}
          {step === 1 && (
            <>
              <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#111', marginBottom: '1.5rem' }}>Crear cuenta gratis</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
                {(['cliente', 'profesional'] as const).map(r => (
                  <button key={r} onClick={() => setRole(r)} style={{ padding: '0.85rem', background: role === r ? '#FFF0ED' : 'white', border: `2px solid ${role === r ? '#FF5C3A' : 'rgba(0,0,0,0.10)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all .2s', fontFamily: 'Syne,sans-serif' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{r === 'cliente' ? '🏠' : '🔧'}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: role === r ? '#FF5C3A' : '#333' }}>{r === 'cliente' ? 'Soy cliente' : 'Soy profesional'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>{r === 'cliente' ? 'Busco servicios' : 'Ofrezco servicios'}</div>
                  </button>
                ))}
              </div>
              {error && <div style={{ background: '#FFF0ED', border: '1px solid rgba(255,92,58,.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', color: '#FF5C3A', fontWeight: 500 }}>{error}</div>}
              {[
                { label: 'Nombre completo', value: nombre, set: setNombre, type: 'text', ph: 'Juan García' },
                { label: 'Email', value: email, set: setEmail, type: 'email', ph: 'tu@email.com' },
                { label: 'Contraseña', value: password, set: setPassword, type: 'password', ph: '••••••••' },
                { label: 'Teléfono', value: telefono, set: setTelefono, type: 'tel', ph: '+34 600 000 000' },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>{f.label}</label>
                  <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 12, fontSize: '0.95rem', color: '#111', outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor='#FF5C3A'} onBlur={e => e.target.style.borderColor='rgba(0,0,0,0.12)'} />
                </div>
              ))}
              <button onClick={() => role === 'cliente' ? handleSignup() : setStep(2)}
                disabled={loading}
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', background: loading ? '#ccc' : '#FF5C3A', color: 'white', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne,sans-serif', boxShadow: '0 4px 16px rgba(255,92,58,.3)' }}>
                {loading ? 'Creando...' : role === 'cliente' ? 'Crear cuenta' : 'Continuar →'}
              </button>
            </>
          )}

          {/* Step 2: Especialidades */}
          {step === 2 && role === 'profesional' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1.2rem' }}>←</button>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#111' }}>¿En qué te especializas?</h2>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#888', marginBottom: '1.25rem' }}>Selecciona todas las que apliquen</p>
              {error && <div style={{ background: '#FFF0ED', border: '1px solid rgba(255,92,58,.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', color: '#FF5C3A', fontWeight: 500 }}>{error}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {ESPECIALIDADES.map(esp => {
                  const sel = especialidades.includes(esp.label)
                  return (
                    <button key={esp.label} onClick={() => toggleEsp(esp.label)} style={{ padding: '0.75rem', background: sel ? '#FFF0ED' : '#F7F5F2', border: `2px solid ${sel ? '#FF5C3A' : 'transparent'}`, borderRadius: 12, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans,sans-serif' }}>
                      <span style={{ fontSize: '1.2rem' }}>{esp.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: sel ? '#FF5C3A' : '#333' }}>{esp.label}</span>
                      {sel && <span style={{ marginLeft: 'auto', color: '#FF5C3A', fontWeight: 700 }}>✓</span>}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => { if (especialidades.length === 0) { setError('Selecciona al menos una especialidad'); return } setError(''); setStep(3) }}
                style={{ width: '100%', padding: '0.85rem', background: '#FF5C3A', color: 'white', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne,sans-serif', boxShadow: '0 4px 16px rgba(255,92,58,.3)' }}>
                Continuar → ({especialidades.length} seleccionadas)
              </button>
            </>
          )}

          {/* Step 3: Foto, dirección, KYC */}
          {step === 3 && role === 'profesional' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1.2rem' }}>←</button>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#111' }}>Completa tu perfil</h2>
              </div>
              {error && <div style={{ background: '#FFF0ED', border: '1px solid rgba(255,92,58,.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', color: '#FF5C3A', fontWeight: 500 }}>{error}</div>}

              {/* Foto de perfil */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                  Foto de perfil <span style={{ color: '#FF5C3A' }}>*obligatoria</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div onClick={() => fotoRef.current?.click()} style={{ width: 80, height: 80, borderRadius: '50%', background: fotoPreview ? 'transparent' : '#F7F5F2', border: `2px dashed ${foto ? '#FF5C3A' : 'rgba(0,0,0,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
                    {fotoPreview ? <img src={fotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>📷</span>}
                  </div>
                  <div>
                    <button onClick={() => fotoRef.current?.click()} style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', color: '#333' }}>
                      {foto ? 'Cambiar foto' : 'Subir foto'}
                    </button>
                    <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.3rem' }}>JPG o PNG, máx 5MB</p>
                  </div>
                </div>
                <input ref={fotoRef} type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
              </div>

              {/* Dirección */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                  Dirección de trabajo <span style={{ color: '#FF5C3A' }}>*</span>
                </label>
                <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Calle Mayor 1, Madrid"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 12, fontSize: '0.92rem', color: '#111', outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor='#FF5C3A'} onBlur={e => e.target.style.borderColor='rgba(0,0,0,0.12)'} />
                <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.3rem' }}>Se usará para mostrarte en el mapa a clientes cercanos</p>
              </div>

              {/* KYC */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.4rem' }}>
                  Documento de identidad (DNI/NIE) <span style={{ color: '#888', fontWeight: 400 }}>— recomendado</span>
                </label>
                <div onClick={() => kycRef.current?.click()} style={{ border: `2px dashed ${kyc ? '#FF5C3A' : 'rgba(0,0,0,0.12)'}`, borderRadius: 12, padding: '1rem', cursor: 'pointer', textAlign: 'center', background: kyc ? '#FFF0ED' : '#F7F5F2', transition: 'all .2s' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{kyc ? '✅' : '📄'}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: kyc ? '#FF5C3A' : '#555' }}>{kycName || 'Subir foto del DNI/NIE'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.2rem' }}>Aumenta la confianza de los clientes</div>
                </div>
                <input ref={kycRef} type="file" accept="image/*,.pdf" onChange={handleKyc} style={{ display: 'none' }} />
              </div>

              <button onClick={handleSignup} disabled={loading}
                style={{ width: '100%', padding: '0.85rem', background: loading ? '#ccc' : '#FF5C3A', color: 'white', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne,sans-serif', boxShadow: loading ? 'none' : '0 4px 16px rgba(255,92,58,.3)' }}>
                {loading ? 'Creando perfil...' : '🚀 Crear perfil profesional'}
              </button>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#888', marginTop: '1.5rem' }}>
            ¿Ya tienes cuenta?{' '}<Link href="/auth/login" style={{ color: '#FF5C3A', fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
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
