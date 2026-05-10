'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'

const ESTADOS: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:   { label: 'Pendiente',   color: '#92600A', bg: '#FEF3C7' },
  aceptado:    { label: 'Aceptado',    color: '#1E40AF', bg: '#DBEAFE' },
  en_progreso: { label: 'En progreso', color: '#5B21B6', bg: '#EDE9FE' },
  completado:  { label: 'Completado',  color: '#14532D', bg: '#DCFCE7' },
  cancelado:   { label: 'Cancelado',   color: '#991B1B', bg: '#FEE2E2' },
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
    channelRef.current = supabase.channel(`notif-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `user_id=eq.${user.id}` },
        payload => { setNotificaciones(prev => [payload.new, ...prev]); fetchData() })
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
    await fetchData(); setUpdatingId(null)
  }

  const completarTrabajo = async (id: string) => {
    setUpdatingId(id)
    await supabase.from('trabajos').update({ estado: 'completado' }).eq('id', id)
    if (perfil) await supabase.from('profesional_profiles').update({ trabajos_completados: (perfil.trabajos_completados || 0) + 1 }).eq('user_id', user!.id)
    await fetchData(); setUpdatingId(null)
  }

  const marcarLeidas = async () => {
    await supabase.from('notificaciones').update({ leida: true }).eq('user_id', user!.id).eq('leida', false)
    setNotificaciones([]); setShowNotif(false)
  }

  const disponibles = trabajos.filter(t => t.estado === 'pendiente' && (!t.profesional_id || t.profesional_id === user?.id))
  const mios = trabajos.filter(t => t.profesional_id === user?.id && ['aceptado','en_progreso'].includes(t.estado))
  const historial = trabajos.filter(t => t.profesional_id === user?.id && ['completado','cancelado'].includes(t.estado))
  const shown = activeTab === 'disponibles' ? disponibles : activeTab === 'mios' ? mios : historial
  const nombre = user?.user_metadata?.nombre?.split(' ')[0] || 'Profesional'

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--coral)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: 'var(--coral)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔧</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowNotif(!showNotif); if (notificaciones.length) marcarLeidas() }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', position: 'relative' }}>
                🔔
                {notificaciones.length > 0 && <div style={{ position: 'absolute', top: -3, right: -3, background: 'var(--coral)', color: 'white', borderRadius: '50%', width: 17, height: 17, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notificaciones.length}</div>}
              </button>
              {showNotif && (
                <div style={{ position: 'absolute', right: 0, top: 44, background: 'white', borderRadius: 10, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', width: 290, zIndex: 100 }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy)' }}>Notificaciones</div>
                  {notificaciones.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--gray-3)', fontSize: '0.83rem' }}>Sin notificaciones nuevas</div>
                  ) : notificaciones.map(n => (
                    <div key={n.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--navy)', marginBottom: '0.2rem' }}>{n.titulo}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--gray-4)' }}>{n.mensaje}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>{nombre}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--gray-3)' }}>{perfil?.especialidad}</div>
            </div>
            <button onClick={signOut} className="btn-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>Salir</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.9rem', color: 'var(--navy)', marginBottom: '0.2rem' }}>Panel profesional</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--gray-4)', marginBottom: '1.5rem' }}>Gestiona tus trabajos y encuentra nuevos clientes</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Completados', value: perfil?.trabajos_completados || 0, icon: '✅' },
              { label: 'Activos', value: mios.length, icon: '⚡' },
              { label: 'Disponibles', value: disponibles.length, icon: '📋' },
              { label: 'Valoración', value: perfil?.rating ? `${perfil.rating}★` : '—', icon: '⭐' },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.9rem', color: 'var(--navy)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-3)', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'white', padding: '0.3rem', borderRadius: 8, border: '1px solid var(--border)', width: 'fit-content', flexWrap: 'wrap' }}>
          {([
            { key: 'disponibles', label: `Disponibles (${disponibles.length})` },
            { key: 'mios', label: `Mis trabajos (${mios.length})` },
            { key: 'historial', label: `Historial (${historial.length})` },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '0.45rem 1.1rem', borderRadius: 6, border: 'none', cursor: 'pointer', background: activeTab === tab.key ? 'var(--navy)' : 'transparent', color: activeTab === tab.key ? 'white' : 'var(--gray-4)', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all .2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs */}
        {shown.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '3.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{activeTab === 'disponibles' ? '🎉' : '📋'}</div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              {activeTab === 'disponibles' ? 'No hay trabajos disponibles' : activeTab === 'mios' ? 'No tienes trabajos activos' : 'Sin historial aún'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-4)' }}>
              {activeTab === 'disponibles' ? 'Cuando los clientes publiquen solicitudes aparecerán aquí.' : 'Acepta trabajos disponibles para empezar.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {shown.map(trabajo => {
              const estado = ESTADOS[trabajo.estado] || ESTADOS.pendiente
              return (
                <div key={trabajo.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', boxShadow: 'var(--shadow-xs)', transition: 'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-xs)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)' }}>{trabajo.tipo_servicio}</h3>
                        <span style={{ background: estado.bg, color: estado.color, borderRadius: 4, padding: '0.12rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}>{estado.label}</span>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--gray-4)', marginBottom: '0.5rem', lineHeight: 1.6 }}>{trabajo.descripcion?.slice(0, 140)}{trabajo.descripcion?.length > 140 ? '...' : ''}</p>
                      <div style={{ fontSize: '0.76rem', color: 'var(--gray-3)' }}>{new Date(trabajo.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    {trabajo.precio && <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.3rem', color: 'var(--coral)' }}>{trabajo.precio}€</div>}
                  </div>
                  {activeTab === 'disponibles' && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <button onClick={() => aceptarTrabajo(trabajo.id)} disabled={updatingId === trabajo.id} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.2rem', opacity: updatingId === trabajo.id ? 0.6 : 1 }}>
                        {updatingId === trabajo.id ? 'Procesando...' : '✓ Aceptar trabajo'}
                      </button>
                    </div>
                  )}
                  {activeTab === 'mios' && trabajo.estado === 'aceptado' && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => completarTrabajo(trabajo.id)} disabled={updatingId === trabajo.id} style={{ background: 'var(--green)', color: 'white', border: 'none', borderRadius: 6, padding: '0.55rem 1.2rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: updatingId === trabajo.id ? 0.6 : 1 }}>
                        {updatingId === trabajo.id ? 'Procesando...' : '✅ Marcar completado'}
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
