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
  rating: number | null
  trabajos_completados: number
  lat: number | null
  lng: number | null
  ciudad: string | null
  disponible: boolean
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
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#111', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 },
        title: pro.especialidad,
      })
      const info = new window.google.maps.InfoWindow({
        content: `<div style="font-family:DM Sans,sans-serif;padding:6px"><b>${pro.especialidad}</b><br/><span style="color:#FF5C3A">${pro.distancia ? pro.distancia.toFixed(1)+' km' : ''}</span></div>`,
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

      // Get location
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

      // Fetch pros
      const { data: prosData } = await supabase.from('profesional_profiles').select('*').eq('disponible', true)
      if (prosData) {
        const prosConDist = prosData.map(p => ({ ...p, distancia: p.lat && p.lng ? calcularDistancia(loc.lat, loc.lng, p.lat, p.lng) : 999 }))
          .sort((a, b) => a.distancia - b.distancia)
        setProfesionales(prosConDist)
      }
      setStep('mapa')
    } catch {
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

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:768px){.map-grid{grid-template-columns:1fr!important;grid-template-rows:auto 400px}}`}</style>
      <nav style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
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
        <div className="map-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: 'calc(100vh - 64px)' }}>
          <div style={{ overflowY: 'auto', background: 'white', borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
            {servicioDetectado && (
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#FFF0ED' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF5C3A', letterSpacing: '.06em', marginBottom: '0.3rem' }}>IA DETECTÓ</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#111', marginBottom: '0.25rem' }}>{servicioDetectado.categoria}</div>
                <div style={{ fontSize: '0.83rem', color: '#555', lineHeight: 1.5, marginBottom: '0.5rem' }}>{servicioDetectado.resumen}</div>
                <span style={{ background: servicioDetectado.urgencia === 'urgente' ? '#FEF2F2' : '#EDFBF3', color: servicioDetectado.urgencia === 'urgente' ? '#DC2626' : '#16A34A', borderRadius: 100, padding: '0.15rem 0.65rem', fontSize: '0.72rem', fontWeight: 600 }}>
                  {servicioDetectado.urgencia === 'urgente' ? '🚨 Urgente' : '📅 Sin prisa'}
                </span>
              </div>
            )}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#888' }}>{profesionales.length} profesionales encontrados</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
              {profesionales.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: '0.88rem' }}>
                  No hay profesionales registrados aún.<br/>
                  <button onClick={handleSubmit} style={{ marginTop: '1rem', background: '#FF5C3A', color: 'white', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>Publicar solicitud general →</button>
                </div>
              )}
              {profesionales.map(pro => (
                <div key={pro.id} onClick={() => setProfesionalSeleccionado(pro)} style={{ padding: '0.9rem 1rem', borderRadius: 12, marginBottom: '0.5rem', border: `2px solid ${profesionalSeleccionado?.id === pro.id ? '#FF5C3A' : 'rgba(0,0,0,0.08)'}`, background: profesionalSeleccionado?.id === pro.id ? '#FFF0ED' : 'white', cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: profesionalSeleccionado?.id === pro.id ? '#FF5C3A' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.8rem', fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>
                      {pro.especialidad.slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111', fontFamily: 'Syne,sans-serif' }}>{pro.especialidad}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{pro.ciudad || 'España'}{pro.rating ? ` · ⭐ ${pro.rating}` : ''}</div>
                    </div>
                    {pro.distancia && pro.distancia < 999 && <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF5C3A' }}>{pro.distancia.toFixed(1)} km</div>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(0,0,0,0.07)', background: 'white' }}>
              {profesionalSeleccionado && (
                <div style={{ background: '#EDFBF3', borderRadius: 10, padding: '0.5rem 0.85rem', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>
                  ✓ {profesionalSeleccionado.especialidad} seleccionado
                </div>
              )}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#333', marginBottom: '0.3rem' }}>Presupuesto máximo (opcional)</label>
                <input type="number" value={presupuesto} onChange={e => setPresupuesto(e.target.value)} placeholder="€"
                  style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }} />
              </div>
              {error && <div style={{ color: '#FF5C3A', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 }}>{error}</div>}
              <button onClick={handleSubmit} disabled={loading}
                style={{ width: '100%', padding: '0.8rem', background: loading ? '#ccc' : '#FF5C3A', color: 'white', border: 'none', borderRadius: 12, fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne,sans-serif' }}>
                {loading ? 'Enviando...' : profesionalSeleccionado ? '🚀 Enviar al profesional' : '📋 Publicar solicitud general'}
              </button>
            </div>
          </div>
          <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#e5e3df' }} />
        </div>
      )}
    </div>
  )
}
