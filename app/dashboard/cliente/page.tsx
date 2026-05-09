'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
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

export default function DashboardCliente() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  
  const [trabajos, setTrabajos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'activos' | 'historial'>('activos')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) fetchTrabajos()
  }, [user, authLoading])

  const fetchTrabajos = async () => {
    const { data } = await supabase
      .from('trabajos')
      .select('*, profesional_profiles(especialidad, telefono, users:user_id(nombre:raw_user_meta_data->>nombre))')
      .eq('cliente_id', user!.id)
      .order('created_at', { ascending: false })
    setTrabajos(data || [])
    setLoading(false)
  }

  const activos = trabajos.filter(t => ['pendiente', 'aceptado', 'en_progreso'].includes(t.estado))
  const historial = trabajos.filter(t => ['completado', 'cancelado'].includes(t.estado))
  const shown = activeTab === 'activos' ? activos : historial

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #FF5C3A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ marginTop: '1rem', color: '#888', fontSize: '0.9rem' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FF5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔧</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#111' }}>
              reparo<span style={{ color: '#FF5C3A' }}>fácil</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.88rem', color: '#666' }}>
              Hola, <strong style={{ color: '#111' }}>{user?.user_metadata?.nombre?.split(' ')[0]}</strong>
            </span>
            <button onClick={signOut} style={{
              background: 'none', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 100,
              padding: '0.35rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, color: '#555',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            }}>
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#111', marginBottom: '0.25rem' }}>
              Mi panel
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>Gestiona tus solicitudes de servicio</p>
          </div>
          <Link href="/solicitud/nueva" style={{
            background: '#FF5C3A', color: 'white', fontWeight: 700,
            padding: '0.75rem 1.5rem', borderRadius: 12,
            fontSize: '0.92rem', textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(255,92,58,.3)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            + Nueva solicitud
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total solicitudes', value: trabajos.length, icon: '📋' },
            { label: 'En progreso', value: activos.length, icon: '⚡' },
            { label: 'Completados', value: historial.filter(t => t.estado === 'completado').length, icon: '✅' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: 16, padding: '1.25rem',
              border: '1.5px solid rgba(0,0,0,0.07)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#111', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'white', padding: '0.35rem', borderRadius: 12, border: '1.5px solid rgba(0,0,0,0.07)', width: 'fit-content' }}>
          {(['activos', 'historial'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === tab ? '#FF5C3A' : 'transparent',
              color: activeTab === tab ? 'white' : '#666',
              fontWeight: 600, fontSize: '0.88rem', fontFamily: 'Syne, sans-serif',
              transition: 'all .2s',
            }}>
              {tab === 'activos' ? `Activos (${activos.length})` : `Historial (${historial.length})`}
            </button>
          ))}
        </div>

        {/* Trabajos list */}
        {shown.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 20, padding: '3rem',
            textAlign: 'center', border: '1.5px solid rgba(0,0,0,0.07)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>
              {activeTab === 'activos' ? 'No tienes solicitudes activas' : 'No hay historial aún'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.5rem' }}>
              {activeTab === 'activos' ? 'Crea tu primera solicitud y te conectaremos con el profesional ideal.' : 'Aquí aparecerán tus trabajos completados.'}
            </p>
            {activeTab === 'activos' && (
              <Link href="/solicitud/nueva" style={{
                background: '#FF5C3A', color: 'white', fontWeight: 700,
                padding: '0.75rem 1.5rem', borderRadius: 12, fontSize: '0.92rem', textDecoration: 'none',
              }}>
                Crear primera solicitud
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {shown.map(trabajo => {
              const estado = ESTADOS[trabajo.estado] || ESTADOS.pendiente
              return (
                <div key={trabajo.id} style={{
                  background: 'white', borderRadius: 16, padding: '1.5rem',
                  border: '1.5px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'all .2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#111' }}>
                          {trabajo.tipo_servicio}
                        </h3>
                        <span style={{ background: estado.bg, color: estado.color, borderRadius: 100, padding: '0.15rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          {estado.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {trabajo.descripcion}
                      </p>
                      {trabajo.profesional_id && (
                        <div style={{ fontSize: '0.82rem', color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
                          👤 Profesional asignado
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {trabajo.precio && (
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#FF5C3A' }}>
                          {trabajo.precio}€
                        </div>
                      )}
                      <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '0.25rem' }}>
                        {new Date(trabajo.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {trabajo.estado === 'completado' && !trabajo.valorado && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: '0.75rem' }}>
                      <button style={{
                        background: '#FFF0ED', color: '#FF5C3A', border: 'none',
                        borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.85rem',
                        fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                      }}>
                        ⭐ Valorar servicio
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
