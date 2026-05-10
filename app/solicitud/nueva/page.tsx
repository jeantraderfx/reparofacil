'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'

declare global {
  interface Window { google: any; initMap: () => void }
}

interface Profesional {
  id: string
  user_id: string
  especialidad: string
  especialidades: string[]
  rating: number | null
  trabajos_completados: number
  lat: number | null
  lng: number | null
  ciudad: string | null
  direccion: string | null
  disponible: boolean
  foto_url: string | null
  kyc_verificado: boolean
  distancia?: number
}

export default function NuevaSolicitud() {
  const { user } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<'descripcion' | 'mapa'>('descripcion')
  const [descripcion, setDescripcion] = useState('')
  const [loadingIA, setLoadingIA] = useState(false)
  const [servicioDetectado, setServicioDetectado] = useState<{ categoria: string; urgencia: string; resumen: string } | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<Profesional | null>(null)
  const [presupuesto, setPresupuesto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.google) { setMapsLoaded(true); return }
    const existing = document.getElementById('gmaps-script')
    if (existing) return
    window.initMap = () => setMapsLoaded(true)
    const script = document.createElement('script')
    script.id = 'gmaps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&callback=initMap`
    script.async = true
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (step !== 'mapa' || !mapsLoaded || !mapRef.current || mapInstance.current) return
    const center = userLocation || { lat: 40.4168, lng: -3.7038 }
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12, center,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
      styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
    })
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation, map: mapInstance.current,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#FF5C3A', fillOpacity: 1, strokeColor: 'white', strokeWeight: 3 },
        title: 'Tu ubicación', zIndex: 100,
      })
      new window.google.maps.Circle({
        map: mapInstance.current, center: userLocation, radius: 5000,
        fillColor: '#FF5C3A', fillOpacity: 0.06, strokeColor: '#FF5C3A', strokeOpacity: 0.2, strokeWeight: 1,
      })
    }
    profesionales.forEach(pro => {
      if (!pro.lat || !pro.lng) return
      const marker = new window.google.maps.Marker({
        position: { lat: pro.lat, lng: pro.lng }, map: mapInstance.current,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: pro.kyc_verificado ? '#16A34A' : '#111', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 },
        title: pro.especialidad,
      })
      const info = new window.google.maps.InfoWindow({
        content: `<div style="font-family:DM Sans,sans-serif;padding:8px;min-width:180px">
          ${pro.foto_url ? `<img src="${pro.foto_url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;margin-bottom:6px"/>` : ''}
          <div style="font-weight:700;color:#111">${pro.especialidades?.join(', ') || pro.especialidad}</div>
          <div style="color:#888;font-size:0.8rem">${pro.distancia && pro.distancia < 999 ? pro.distancia.toFixed(1)+' km' : ''}</div>
          ${pro.rating ? `<div style="color:#FF5C3A;font-size:0.8rem">⭐ ${pro.rating}</div>` : ''}
          ${pro.kyc_verificado ? '<div style="color:#16A34A;font-size:0.75rem;font-weight:600">✓ Verificado</div>' : ''}
        </div>`,
      })
      marker.addListener('click', () => { info.open(mapInstance.current, marker); setProfesionalSeleccionado(pro) })
    })
  }, [step, mapsLoaded, userLocation, profesionales])

  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  const interpretarConIA = async () => {
    if (descripcion.trim().length < 10) { setError('Describe con más detalle lo que necesitas'); return }
    setLoadingIA(true); setError('')
    try {
      const res = await fetch('/api/interpretar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setServicioDetectado(data)

      const getLocation = () => new Promise<{ lat: number; lng: number }>(resolve => {
        if (!navigator.geolocation) resolve({ lat: 40.4168, lng: -3.7038 })
        else navigator.geolocation.getCurrentPosition(
          p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve({ lat: 40.4168, lng: -3.7038 }),
          { timeout: 5000 }
        )
      })
      const loc = await getLocation()
      setUserLocation(loc)

      const { data: prosData } = await supabase.from('profesional_profiles').select('*').eq('disponible', true)
      if (prosData) {
        const prosConDist = prosData
          .map(p => ({ ...p, distancia: p.lat && p.lng ? calcularDistancia(loc.lat, loc.lng, p.lat, p.lng) : 999 }))
          .sort((a, b) => {
            // Sort by: verified first, then rating desc, then distance asc
            if (a.kyc_verificado !== b.kyc_verificado) return b.kyc_verificado ? 1 : -1
            if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0)
            return a.distancia - b.distancia
          })
        setProfesionales(prosConDist)
      }
      setStep('mapa')
    } catch (e: any) {
      setError('Error al analizar tu solicitud. Inténtalo de nuevo.')
    } finally {
      setLoadingIA(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) { router.push('/auth/login'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.from('trabajos').insert({
      cliente_id: user.id,
      profesional_id: profesionalSeleccionado?.user_id || null,
      tipo_servicio: servicioDetectado?.categoria || 'General',
      descripcion: `${servicioDetectado?.resumen || descripcion}\n\nUrgencia: ${servicioDetectado?.urgencia || 'flexible'}`,
      precio: presupuesto ? parseFloat(presupuesto) : null,
      estado: 'pendiente',
      lat: userLocation?.lat,
      lng: userLocation?.lng,
    })
    if (err) { setError('Error al crear la solicitud.'); setLoading(false); return }
    if (profesionalSeleccionado) {
      await supabase.from('notificaciones').insert({
        user_id: profesionalSeleccionado.user_id,
        tipo: 'nuevo_trabajo',
        titulo: '¡Nueva solicitud de trabajo!',
        mensaje: `${servicioDetectado?.categoria}: ${servicioDetectado?.resumen}`,
      })
    }
    router.push('/dashboard/cliente?success=1')
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return null
    return (
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ color: i <= Math.round(rating) ? '#FFBB00' : '#ddd', fontSize: '0.8rem' }}>★</span>
        ))}
        <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 2 }}>{rating}</span>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <nav style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/dashboard/cliente" style={{ fontSize: '0.88rem', color: '#666', fontWeight: 500, textDecoration: 'none' }}>← Volver</Link>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#111' }}>reparo<span style={{ color: '#FF5C3A' }}>fácil</span></span>
        </div>
      </nav>

      {step === 'descripcion' && (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#111', marginBottom: '0.5rem' }}>¿Qué necesitas?</h1>
            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Descríbelo con tus propias palabras — la IA lo interpretará y encontrará el profesional ideal cerca de ti.
            </p>
            {error && <div style={{ background: '#FFF0ED', border: '1px solid rgba(255,92,58,.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#FF5C3A', fontWeight: 500 }}>{error}</div>}
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Se me ha roto el grifo del baño y sale agua, necesito que alguien venga hoy urgente..."
              rows={5}
              style={{ width: '100%', padding: '1rem', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 12, fontSize: '0.95rem', color: '#111', outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box', resize: 'none', lineHeight: 1.65 }}
              onFocus={e => e.target.style.borderColor='#FF5C3A'} onBlur={e => e.target.style.borderColor='rgba(0,0,0,0.12)'} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', marginBottom: '1.5rem' }}>
              {['Grifo roto', 'Pintar habitación', 'Enchufe sin luz', 'Cerradura rota'].map(s => (
                <button key={s} onClick={() => setDescripcion(s)} style={{ background: '#F7F5F2', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 100, padding: '0.25rem 0.8rem', fontSize: '0.8rem', color: '#555', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>{s}</button>
              ))}
            </div>
            <button onClick={interpretarConIA} disabled={loadingIA || descripcion.trim().length < 10}
              style={{ width: '100%', padding: '0.9rem', background: loadingIA || descripcion.trim().length < 10 ? '#ddd' : '#FF5C3A', color: loadingIA || descripcion.trim().length < 10 ? '#aaa' : 'white', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: loadingIA || descripcion.trim().length < 10 ? 'not-allowed' : 'pointer', fontFamily: 'Syne,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: loadingIA || descripcion.trim().length < 10 ? 'none' : '0 4px 16px rgba(255,92,58,.3)' }}>
              {loadingIA ? <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>Analizando con IA...</> : '🔍 Buscar profesionales cerca →'}
            </button>
          </div>
        </div>
      )}

      {step === 'mapa' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 2rem' }}>
          {/* IA result banner */}
          {servicioDetectado && (
            <div style={{ background: '#FFF0ED', borderRadius: 16, padding: '1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF5C3A', letterSpacing: '.06em' }}>IA DETECTÓ</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#111' }}>{servicioDetectado.categoria}</div>
                <div style={{ fontSize: '0.85rem', color: '#555' }}>{servicioDetectado.resumen}</div>
              </div>
              <span style={{ background: servicioDetectado.urgencia === 'urgente' ? '#FEF2F2' : '#EDFBF3', color: servicioDetectado.urgencia === 'urgente' ? '#DC2626' : '#16A34A', borderRadius: 100, padding: '0.2rem 0.75rem', fontSize: '0.78rem', fontWeight: 600 }}>
                {servicioDetectado.urgencia === 'urgente' ? '🚨 Urgente' : '📅 Sin prisa'}
              </span>
              <button onClick={() => setStep('descripcion')} style={{ marginLeft: 'auto', background: 'none', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 100, padding: '0.35rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: '#555', fontFamily: 'DM Sans,sans-serif' }}>
                ← Modificar
              </button>
            </div>
          )}

          {/* Map */}
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,0.08)', marginBottom: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div ref={mapRef} style={{ width: '100%', height: 420, background: '#e5e3df' }} />
          </div>

          {/* Submit bar */}
          <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '2rem', border: '1.5px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {profesionalSeleccionado ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {profesionalSeleccionado.foto_url && <img src={profesionalSeleccionado.foto_url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111', fontFamily: 'Syne,sans-serif' }}>{profesionalSeleccionado.especialidades?.join(', ') || profesionalSeleccionado.especialidad}</div>
                  <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>✓ Seleccionado</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.88rem', color: '#888' }}>Selecciona un profesional del ranking o publica sin asignar</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
              <input type="number" value={presupuesto} onChange={e => setPresupuesto(e.target.value)} placeholder="Presupuesto €"
                style={{ padding: '0.55rem 0.9rem', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', fontFamily: 'DM Sans,sans-serif', width: 140 }} />
              <button onClick={handleSubmit} disabled={loading}
                style={{ padding: '0.65rem 1.5rem', background: loading ? '#ccc' : '#FF5C3A', color: 'white', border: 'none', borderRadius: 12, fontSize: '0.92rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne,sans-serif', whiteSpace: 'nowrap', boxShadow: loading ? 'none' : '0 4px 16px rgba(255,92,58,.25)' }}>
                {loading ? 'Enviando...' : profesionalSeleccionado ? '🚀 Enviar solicitud' : '📋 Publicar general'}
              </button>
            </div>
          </div>

          {/* Professionals ranking */}
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#111', marginBottom: '0.5rem' }}>
              Profesionales recomendados
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.25rem' }}>
              Ordenados por valoración y distancia a tu ubicación
            </p>

            {profesionales.length === 0 && (
              <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem', textAlign: 'center', border: '1.5px solid rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👷</div>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>No hay profesionales registrados aún en tu zona.</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
              {profesionales.map((pro, idx) => (
                <div key={pro.id} onClick={() => setProfesionalSeleccionado(pro)} style={{
                  background: 'white', borderRadius: 16, padding: '1.25rem',
                  border: `2px solid ${profesionalSeleccionado?.id === pro.id ? '#FF5C3A' : 'rgba(0,0,0,0.08)'}`,
                  cursor: 'pointer', transition: 'all .2s', position: 'relative',
                  boxShadow: profesionalSeleccionado?.id === pro.id ? '0 8px 32px rgba(255,92,58,.15)' : '0 1px 4px rgba(0,0,0,0.05)',
                }}
                  onMouseEnter={e => { if (profesionalSeleccionado?.id !== pro.id) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  {/* Rank badge */}
                  <div style={{ position: 'absolute', top: 12, right: 12, background: idx === 0 ? '#FFBB00' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#F7F5F2', color: idx < 3 ? 'white' : '#888', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'Syne,sans-serif' }}>
                    #{idx + 1}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '0.9rem' }}>
                    {/* Avatar */}
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F7F5F2', flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(0,0,0,0.06)', position: 'relative' }}>
                      {pro.foto_url ? (
                        <img src={pro.foto_url} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#888' }}>
                          {(pro.especialidad || 'P').slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                        {pro.kyc_verificado && (
                          <span style={{ background: '#EDFBF3', color: '#16A34A', borderRadius: 100, padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>✓ Verificado</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.4 }}>
                        {(pro.especialidades || [pro.especialidad]).slice(0, 3).join(' · ')}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={{ marginBottom: '0.6rem' }}>
                    {pro.rating ? renderStars(pro.rating) : <div style={{ fontSize: '0.78rem', color: '#aaa' }}>Sin valoraciones aún</div>}
                    {pro.trabajos_completados > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>{pro.trabajos_completados} trabajos completados</div>
                    )}
                  </div>

                  {/* Distance & location */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>📍 {pro.ciudad || (pro.direccion ? pro.direccion.split(',')[0] : 'España')}</div>
                    {pro.distancia && pro.distancia < 999 && (
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FF5C3A' }}>{pro.distancia.toFixed(1)} km</div>
                    )}
                  </div>

                  {profesionalSeleccionado?.id === pro.id && (
                    <div style={{ marginTop: '0.75rem', background: '#EDFBF3', borderRadius: 8, padding: '0.35rem 0.6rem', fontSize: '0.78rem', color: '#16A34A', fontWeight: 600, textAlign: 'center' }}>
                      ✓ Seleccionado — listo para enviar
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <div style={{ background: '#FFF0ED', border: '1px solid rgba(255,92,58,.3)', borderRadius: 10, padding: '0.75rem 1rem', marginTop: '1rem', fontSize: '0.88rem', color: '#FF5C3A', fontWeight: 500 }}>{error}</div>}
        </div>
      )}
    </div>
  )

}
