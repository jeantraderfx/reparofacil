'use client'
export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

declare global {
  interface Window { google: any; initPlaces: () => void }
}

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

  // Common fields
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefono, setTelefono] = useState('')

  // Location fields
  const [zona, setZona] = useState('')
  const [zonaCoords, setZonaCoords] = useState<{ lat: number; lng: number; ciudad: string; provincia: string } | null>(null)
  const [loadingGeo, setLoadingGeo] = useState(false)
  const zonaInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  // Pro fields
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [direccion, setDireccion] = useState('')
  const [dirCoords, setDirCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [kyc, setKyc] = useState<File | null>(null)
  const [kycName, setKycName] = useState('')
  const fotoRef = useRef<HTMLInputElement>(null)
  const kycRef = useRef<HTMLInputElement>(null)
  const dirInputRef = useRef<HTMLInputElement>(null)
  const dirAutocompleteRef = useRef<any>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mapsReady, setMapsReady] = useState(false)

  // Load Google Maps Places
  useEffect(() => {
    if (window.google?.maps?.places) { setMapsReady(true); return }
    const existing = document.getElementById('gmaps-places')
    if (existing) { existing.addEventListener('load', () => setMapsReady(true)); return }
    window.initPlaces = () => setMapsReady(true)
    const script = document.createElement('script')
    script.id = 'gmaps-places'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&callback=initPlaces`
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Init zona autocomplete
  useEffect(() => {
    if (!mapsReady || !zonaInputRef.current || autocompleteRef.current) return
    autocompleteRef.current = new window.google.maps.places.Autocomplete(zonaInputRef.current, {
      componentRestrictions: { country: 'es' },
      types: ['(cities)'],
      fields: ['geometry', 'name', 'address_components'],
    })
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace()
      if (!place.geometry) return
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const ciudad = place.name || ''
      const provincia = place.address_components?.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name || ''
      setZona(`${ciudad}${provincia ? ', ' + provincia : ''}`)
      setZonaCoords({ lat, lng, ciudad, provincia })
    })
  }, [mapsReady, step])

  // Init dirección autocomplete for pro
  useEffect(() => {
    if (!mapsReady || !dirInputRef.current || dirAutocompleteRef.current || role !== 'profesional') return
    dirAutocompleteRef.current = new window.google.maps.places.Autocomplete(dirInputRef.current, {
      componentRestrictions: { country: 'es' },
      types: ['address'],
      fields: ['geometry', 'formatted_address'],
    })
    dirAutocompleteRef.current.addListener('place_changed', () => {
      const place = dirAutocompleteRef.current.getPlace()
      if (!place.geometry) return
      setDireccion(place.formatted_address || '')
      setDirCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
    })
  }, [mapsReady, step, role])

  const toggleEsp = (esp: string) => setEspecialidades(prev => prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp])

  const geocodeManual = async (address: string) => {
    if (!address.trim()) return null
    setLoadingGeo(true)
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ', España')}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`)
      const data = await res.json()
      if (data.results?.[0]) {
        const { lat, lng } = data.results[0].geometry.location
        const components = data.results[0].address_components
        const ciudad = components?.find((c: any) => c.types.includes('locality'))?.long_name || address
        const provincia = components?.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name || ''
        return { lat, lng, ciudad, provincia }
      }
    } catch {}
    finally { setLoadingGeo(false) }
    return null
  }

  const handleZonaBlur = async () => {
    if (zona && !zonaCoords) {
      const coords = await geocodeManual(zona)
      if (coords) setZonaCoords(coords)
    }
  }

  const handleSignup = async () => {
    if (!nombre || !email || !password || !telefono) { setError('Completa todos los campos'); return }
    if (!zonaCoords) { setError('Selecciona tu zona de trabajo de la lista'); return }
    if (role === 'profesional') {
      if (especialidades.length === 0) { setError('Selecciona al menos una especialidad'); return }
      if (!foto) { setError('La foto de perfil es obligatoria'); return }
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
      await supabase.from('cliente_profiles').insert({
        user_id: userId,
        telefono,
        lat: zonaCoords.lat,
        lng: zonaCoords.lng,
        ciudad: zonaCoords.ciudad,
        provincia: zonaCoords.provincia,
      })
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
      const lat = dirCoords?.lat || zonaCoords.lat
      const lng = dirCoords?.lng || zonaCoords.lng
      await supabase.from('profesional_profiles').insert({
        user_id: userId,
        especialidad: especialidades[0],
        especialidades,
        telefono,
        foto_url: fotoUrl,
        direccion: direccion || zona,
        lat, lng,
        ciudad: zonaCoords.ciudad,
        kyc_documento_url: kycUrl,
        trabajos_completados: 0,
        disponible: true,
      })
    }

    setSuccess(true)
    setTimeout(() => router.push(role === 'profesional' ? '/dashboard/profesional' : '/dashboard/cliente'), 1200)
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.5rem', color: 'var(--navy)' }}>¡Cuenta creada!</h2>
        <p style={{ color: 'var(--gray-4)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Redirigiendo...</p>
      </div>
    </div>
  )

  const totalSteps = role === 'profesional' ? 3 : 2

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
      <style>{`
        @media(max-width:640px){
          .esp-grid{grid-template-columns:1fr 1fr!important}
          .signup-card{padding:1.75rem 1.25rem!important}
        }
      `}</style>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, background: 'var(--coral)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔧</div>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
        </Link>

        {/* Progress */}
        {role === 'profesional' && (
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i < step ? 'var(--coral)' : 'var(--border)', transition: 'background .3s' }} />
            ))}
          </div>
        )}

        <div className="signup-card" style={{ background: 'white', borderRadius: 16, padding: '2.25rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>

          {/* STEP 1 — Datos + Zona */}
          {step === 1 && (
            <>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '0.35rem' }}>Crear cuenta gratis</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-4)', marginBottom: '1.5rem' }}>Únete a más de 12.000 usuarios en España</p>

              {/* Role selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
                {(['cliente', 'profesional'] as const).map(r => (
                  <button key={r} onClick={() => setRole(r)} style={{ padding: '0.75rem', background: role === r ? 'var(--coral-pale, #FDF1ED)' : 'var(--sand)', border: `2px solid ${role === r ? 'var(--coral)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', transition: 'all .2s', fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{r === 'cliente' ? '🏠' : '🔧'}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: role === r ? 'var(--coral)' : 'var(--navy)' }}>{r === 'cliente' ? 'Soy cliente' : 'Soy profesional'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-3)', marginTop: '0.15rem' }}>{r === 'cliente' ? 'Busco servicios' : 'Ofrezco servicios'}</div>
                  </button>
                ))}
              </div>

              {error && <div style={{ background: '#FDF1ED', border: '1px solid rgba(232,81,42,0.25)', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--coral)', fontWeight: 500 }}>{error}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  { label: 'Nombre completo', value: nombre, set: setNombre, type: 'text', ph: 'Juan García' },
                  { label: 'Email', value: email, set: setEmail, type: 'email', ph: 'tu@email.com' },
                  { label: 'Contraseña', value: password, set: setPassword, type: 'password', ph: '••••••••' },
                  { label: 'Teléfono', value: telefono, set: setTelefono, type: 'tel', ph: '+34 600 000 000' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.35rem' }}>{f.label}</label>
                    <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph} className="input" />
                  </div>
                ))}

                {/* ZONA — clave */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.35rem' }}>
                    📍 Tu zona en España <span style={{ color: 'var(--coral)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={zonaInputRef}
                      type="text"
                      value={zona}
                      onChange={e => { setZona(e.target.value); setZonaCoords(null) }}
                      onBlur={handleZonaBlur}
                      placeholder="Escribe tu ciudad o barrio..."
                      className="input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.95rem' }}>📍</span>
                    {loadingGeo && <span style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--gray-3)' }}>Buscando...</span>}
                  </div>
                  {zonaCoords && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.4rem', fontSize: '0.76rem', color: 'var(--green)' }}>
                      <span>✓</span>
                      <span>{zonaCoords.ciudad}{zonaCoords.provincia ? `, ${zonaCoords.provincia}` : ''} — ubicación confirmada</span>
                    </div>
                  )}
                  {!zonaCoords && zona.length > 2 && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--gray-3)', marginTop: '0.3rem' }}>
                      Selecciona una opción de la lista o escribe y pulsa Tab
                    </div>
                  )}
                  <p style={{ fontSize: '0.74rem', color: 'var(--gray-3)', marginTop: '0.3rem' }}>
                    Se usa para mostrarte profesionales cercanos o para que te encuentren clientes
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!nombre || !email || !password || !telefono) { setError('Completa todos los campos'); return }
                  if (!zonaCoords) { setError('Selecciona tu zona de la lista de sugerencias'); return }
                  setError('')
                  role === 'cliente' ? handleSignup() : setStep(2)
                }}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.82rem', fontSize: '0.95rem', marginTop: '1.5rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creando cuenta...' : role === 'cliente' ? 'Crear cuenta gratis' : 'Continuar →'}
              </button>
            </>
          )}

          {/* STEP 2 — Especialidades (solo pro) */}
          {step === 2 && role === 'profesional' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-4)', fontSize: '1.1rem', padding: 0 }}>←</button>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.4rem', color: 'var(--navy)' }}>¿En qué te especializas?</h2>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--gray-4)', marginBottom: '1.25rem' }}>Selecciona todas las que apliquen — puedes tener múltiples especialidades.</p>
              {error && <div style={{ background: '#FDF1ED', border: '1px solid rgba(232,81,42,0.25)', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--coral)', fontWeight: 500 }}>{error}</div>}
              <div className="esp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '1.5rem' }}>
                {ESPECIALIDADES.map(esp => {
                  const sel = especialidades.includes(esp.label)
                  return (
                    <button key={esp.label} onClick={() => toggleEsp(esp.label)} style={{ padding: '0.7rem 0.9rem', background: sel ? '#FDF1ED' : 'var(--sand)', border: `2px solid ${sel ? 'var(--coral)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'left' }}>
                      <span style={{ fontSize: '1.1rem' }}>{esp.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.83rem', color: sel ? 'var(--coral)' : 'var(--navy)', flex: 1 }}>{esp.label}</span>
                      {sel && <span style={{ color: 'var(--coral)', fontWeight: 700, fontSize: '0.85rem' }}>✓</span>}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => { if (!especialidades.length) { setError('Selecciona al menos una especialidad'); return } setError(''); setStep(3) }} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.82rem', fontSize: '0.95rem' }}>
                Continuar → ({especialidades.length} seleccionadas)
              </button>
            </>
          )}

          {/* STEP 3 — Foto + Dirección + KYC (solo pro) */}
          {step === 3 && role === 'profesional' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-4)', fontSize: '1.1rem', padding: 0 }}>←</button>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.4rem', color: 'var(--navy)' }}>Completa tu perfil</h2>
              </div>
              {error && <div style={{ background: '#FDF1ED', border: '1px solid rgba(232,81,42,0.25)', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--coral)', fontWeight: 500 }}>{error}</div>}

              {/* Foto */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                  Foto de perfil <span style={{ color: 'var(--coral)' }}>*obligatoria</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div onClick={() => fotoRef.current?.click()} style={{ width: 72, height: 72, borderRadius: '50%', background: fotoPreview ? 'transparent' : 'var(--sand)', border: `2px dashed ${foto ? 'var(--coral)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, transition: 'all .2s' }}>
                    {fotoPreview ? <img src={fotoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.4rem' }}>📷</span>}
                  </div>
                  <div>
                    <button onClick={() => fotoRef.current?.click()} style={{ background: 'var(--sand)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.45rem 0.9rem', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--navy)' }}>
                      {foto ? 'Cambiar foto' : 'Subir foto'}
                    </button>
                    <p style={{ fontSize: '0.72rem', color: 'var(--gray-3)', marginTop: '0.3rem' }}>JPG o PNG · máx 5MB</p>
                  </div>
                </div>
                <input ref={fotoRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setFoto(f); setFotoPreview(URL.createObjectURL(f)) } }} style={{ display: 'none' }} />
              </div>

              {/* Dirección exacta */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.35rem' }}>
                  Dirección de trabajo exacta <span style={{ color: 'var(--coral)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={dirInputRef}
                    type="text"
                    value={direccion}
                    onChange={e => { setDireccion(e.target.value); setDirCoords(null) }}
                    placeholder="Calle Mayor 1, Madrid"
                    className="input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.95rem' }}>🏠</span>
                </div>
                {dirCoords && <div style={{ fontSize: '0.74rem', color: 'var(--green)', marginTop: '0.3rem' }}>✓ Dirección geolocalizad</div>}
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-3)', marginTop: '0.3rem' }}>Los clientes te verán en el mapa. Por defecto se usa la zona que indicaste antes.</p>
              </div>

              {/* KYC */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.35rem' }}>
                  DNI/NIE <span style={{ fontSize: '0.75rem', color: 'var(--gray-3)', fontWeight: 400 }}>— recomendado para ganar confianza</span>
                </label>
                <div onClick={() => kycRef.current?.click()} style={{ border: `2px dashed ${kyc ? 'var(--coral)' : 'var(--border)'}`, borderRadius: 10, padding: '0.9rem', cursor: 'pointer', textAlign: 'center', background: kyc ? '#FDF1ED' : 'var(--sand)', transition: 'all .2s' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{kyc ? '✅' : '📄'}</div>
                  <div style={{ fontSize: '0.83rem', fontWeight: 600, color: kyc ? 'var(--coral)' : 'var(--gray-4)' }}>{kycName || 'Subir foto del DNI/NIE'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-3)', marginTop: '0.15rem' }}>Aumenta la confianza de los clientes</div>
                </div>
                <input ref={kycRef} type="file" accept="image/*,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) { setKyc(f); setKycName(f.name) } }} style={{ display: 'none' }} />
              </div>

              <button onClick={handleSignup} disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.82rem', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creando perfil...' : '🚀 Crear perfil profesional'}
              </button>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--gray-4)', marginTop: '1.5rem' }}>
            ¿Ya tienes cuenta?{' '}<Link href="/auth/login" style={{ color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--sand)' }} />}>
      <SignupForm />
    </Suspense>
  )
}
