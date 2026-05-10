'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'

const ESTADOS: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: '#B45309', bg: '#FFF3CD' },
  aceptado: { label: 'Aceptado', color: '#2563EB', bg: '#EFF6FF' },
  en_progreso: { label: 'En progreso', color: '#7C3AED', bg: '#F3E8FF' },
  completado: { label: 'Completado', color: '#16A34A', bg: '#EDFBF3' },
  cancelado: { label: 'Cancelado', color: '#DC2626', bg: '#FEF2F2' },
}

export default function DashboardProfesional() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [trabajos, setTrabajos] = useState<any[]>([])
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'disponibles' | 'mios' | 'historial'>('disponibles')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [showNotif, setShowNotif] = useState(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user) fetchData()
  }, [user, authLoading])

  useEffect(() => {
    if (!user) return
    // Realtime notifications
    channelRef.current = supabase
      .channel(`notif-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setNotificaciones(prev => [payload.new, ...prev])
        fetchData()
      })
      .subscribe()

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [user])

  const fetchData = async () => {
    const [{ data: perfData }, { data: trabajosData }, { data: notifData }] = await Promise.all([
      supabase.from('profesional_profiles').select('*').eq('user_id', user!.id).single(),
      supabase.from('trabajos').select('*').order('created_at', { ascending: false }),
      supabase.from('notificaciones').select('*').eq('user_id', user!.id).eq('leida', false).order('created_at', { ascending: false }),
    ])
    setPerfil(perfData)
    setTrabajos(trabajosData || [])
    setNotificaciones(notifData || [])
    setLoading(false)
  }

  const aceptarTrabajo = async (id: string) => {
    setUpdatingId(id)
    await supabase.from('trabajos').update({ profesional_id: user!.id, estado: 'aceptado' }).eq('id', id)
    await fetchData()
    setUpdatingId(null)
  }

  const rechazarTrabajo = async (id: string) => {
    setUpdatingId(id)
    await supabase.from('trabajos').update({ estado: 'cancelado' }).eq('id', id).eq('profesional_id', user!.id)
    await fetchData()
    setUpdatingId(null)
  }

  const completarTrabajo = async (id: string) => {
    setUpdatingId(id)
    await supabase.from('trabajos').update({ estado: 'completado' }).eq('id', id)
    if (perfil) await supabase.from('profesional_profiles').update({ trabajos_completados: (perfil.trabajos_completados || 0) + 1 }).eq('user_id', user!.id)
    await fetchData()
    setUpdatingId(null)
  }

  const marcarNotifsLeidas = async () => {
    await supabase.from('notificaciones').update({ leida: true }).eq('user_id', user!.id).eq('leida', false)
    setNotificaciones([])
    setShowNotif(false)
  }

  const disponibles = trabajos.filter(t => t.estado === 'pendiente' && (!t.profesional_id || t.profesional_id === user?.id))
  const mios = trabajos.filter(t => t.profesional_id === user?.id && ['aceptado', 'en_progreso'].includes(t.estado))
  const historial = trabajos.filter(t => t.profesional_id === user?.id && ['completado', 'cancelado'].includes(t.estado))
  const shown = activeTab === 'disponibles' ? disponibles : activeTab === 'mios' ? mios : historial

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #FF5C3A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ marginTop: '1rem', color: '#888', fontSize: '0.9rem' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#FF5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔧</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#111' }}>reparo<span style={{ color: '#FF5C3A' }}>fácil</span></span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Notifications bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowNotif(!showNotif); if (notificaciones.length > 0) marcarNotifsLeidas() }}
                style={{ background: 'none', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', position: 'relative' }}>
                🔔
                {notificaciones.length > 0 && (
                  <div style={{ position: 'absolute', top: -4, right: -4, background: '#FF5C3A', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {notificaciones.length}
                  </div>
                )}
              </button>
              {showNotif && (
                <div style={{ position: 'absolute', right: 0, top: 44, background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1.5px solid rgba(0,0,0,0.08)', width: 300, zIndex: 100 }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.07)', fontWeight: 700, fontSize: '0.88rem', color: '#111' }}>Notificaciones</div>
                  {notificaciones.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>Sin notificaciones nuevas</div>
                  ) : notificaciones.map(n => (
                    <div key={n.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111', marginBottom: '0.2rem' }}>{n.titulo}</div>
                      <div style={{ fontSize: '0.78rem', color: '#888' }}>{n.mensaje}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>{user?.user_metadata?.nombre?.split(' ')[0]}</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{perfil?.especialidad}</div>
            </div>
            <button onClick={signOut} style={{ background: 'none', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 100, padding: '0.35rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Salir</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#111', marginBottom: '0.25rem' }}>Panel profesional</h1>
          <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.5rem' }}>Gestiona tus trabajos y encuentra nuevos clientes</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
            {[
              { label: 'Completados', value: perfil?.trabajos_completados || 0, icon: '✅' },
              { label: 'Activos', value: mios.length, icon: '⚡' },
              { label: 'Disponibles', value: disponibles.length, icon: '📋' },
              { label: 'Valoración', value: perfil?.rating ? `${perfil.rating}⭐` : 'N/A', icon: '⭐' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'white', borderRadius: 16, padding: '1.25rem', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#111', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'white', padding: '0.35rem', borderRadius: 12, border: '1.5px solid rgba(0,0,0,0.07)', width: 'fit-content', flexWrap: 'wrap' }}>
          {([
            { key: 'disponibles', label: `Disponibles (${disponibles.length})` },
            { key: 'mios', label: `Mis trabajos (${mios.length})` },
            { key: 'historial', label: `Historial (${historial.length})` },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: activeTab === tab.key ? '#FF5C3A' : 'transparent', color: activeTab === tab.key ? 'white' : '#666', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'Syne,sans-serif', transition: 'all .2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, padding: '3rem', textAlign: 'center', border: '1.5px solid rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{activeTab === 'disponibles' ? '🎉' : '📋'}</div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
              {activeTab === 'disponibles' ? 'No hay trabajos disponibles ahora' : activeTab === 'mios' ? 'No tienes trabajos activos' : 'Sin historial aún'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>
              {activeTab === 'disponibles' ? 'Cuando los clientes publiquen solicitudes apareceran aquí.' : 'Acepta trabajos disponibles para empezar.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {shown.map(trabajo => {
              const estado = ESTADOS[trabajo.estado] || ESTADOS.pendiente
              return (
                <div key={trabajo.id} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1rem', color: '#111' }}>{trabajo.tipo_servicio}</h3>
                        <span style={{ background: estado.bg, color: estado.color, borderRadius: 100, padding: '0.15rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}>{estado.label}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '0.5rem', lineHeight: 1.5 }}>{trabajo.descripcion}</p>
                      <div style={{ fontSize: '0.78rem', color: '#999' }}>📅 {new Date(trabajo.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    {trabajo.precio && <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#FF5C3A' }}>{trabajo.precio}€</div>}
                  </div>
                  {activeTab === 'disponibles' && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => aceptarTrabajo(trabajo.id)} disabled={updatingId === trabajo.id}
                        style={{ background: '#FF5C3A', color: 'white', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', opacity: updatingId === trabajo.id ? 0.6 : 1, boxShadow: '0 4px 12px rgba(255,92,58,.25)' }}>
                        {updatingId === trabajo.id ? 'Procesando...' : '✓ Aceptar trabajo'}
                      </button>
                    </div>
                  )}
                  {activeTab === 'mios' && trabajo.estado === 'aceptado' && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => completarTrabajo(trabajo.id)} disabled={updatingId === trabajo.id}
                        style={{ background: '#16A34A', color: 'white', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', opacity: updatingId === trabajo.id ? 0.6 : 1 }}>
                        {updatingId === trabajo.id ? 'Procesando...' : '✅ Marcar completado'}
                      </button>
                      <button onClick={() => rechazarTrabajo(trabajo.id)} disabled={updatingId === trabajo.id}
                        style={{ background: 'white', color: '#DC2626', border: '1.5px solid #DC2626', borderRadius: 10, padding: '0.6rem 1.25rem', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
