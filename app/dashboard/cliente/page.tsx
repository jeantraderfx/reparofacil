'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
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

export default function DashboardCliente() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [trabajos, setTrabajos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'activos' | 'historial'>('activos')

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user) fetchTrabajos()
  }, [user, authLoading])

  const fetchTrabajos = async () => {
    const { data } = await supabase.from('trabajos').select('*').eq('cliente_id', user!.id).order('created_at', { ascending: false })
    setTrabajos(data || [])
    setLoading(false)
  }

  const activos = trabajos.filter(t => ['pendiente','aceptado','en_progreso'].includes(t.estado))
  const historial = trabajos.filter(t => ['completado','cancelado'].includes(t.estado))
  const shown = activeTab === 'activos' ? activos : historial
  const nombre = user?.user_metadata?.nombre?.split(' ')[0] || 'Usuario'

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--coral)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, background: 'var(--coral)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔧</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>Reparo<span style={{ color: 'var(--coral)' }}>Fácil</span></span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-4)' }}>Hola, <strong style={{ color: 'var(--navy)' }}>{nombre}</strong></span>
            <button onClick={signOut} className="btn-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>Salir</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.9rem', color: 'var(--navy)', marginBottom: '0.2rem' }}>Mi panel</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-4)' }}>Gestiona tus solicitudes de servicio</p>
          </div>
          <Link href="/solicitud/nueva" className="btn-primary">+ Nueva solicitud</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total', value: trabajos.length, icon: '📋' },
            { label: 'En curso', value: activos.length, icon: '⚡' },
            { label: 'Completados', value: historial.filter(t => t.estado === 'completado').length, icon: '✅' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.9rem', color: 'var(--navy)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gray-3)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'white', padding: '0.3rem', borderRadius: 8, border: '1px solid var(--border)', width: 'fit-content' }}>
          {[
            { key: 'activos', label: `En curso (${activos.length})` },
            { key: 'historial', label: `Historial (${historial.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ padding: '0.45rem 1.1rem', borderRadius: 6, border: 'none', cursor: 'pointer', background: activeTab === tab.key ? 'var(--navy)' : 'transparent', color: activeTab === tab.key ? 'white' : 'var(--gray-4)', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all .2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs */}
        {shown.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '3.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              {activeTab === 'activos' ? 'No tienes solicitudes activas' : 'Sin historial aún'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--gray-4)', marginBottom: '1.5rem' }}>
              {activeTab === 'activos' ? 'Crea tu primera solicitud y te conectaremos con el profesional ideal.' : 'Aquí aparecerán tus trabajos completados.'}
            </p>
            {activeTab === 'activos' && <Link href="/solicitud/nueva" className="btn-primary">Crear solicitud</Link>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {shown.map(trabajo => {
              const estado = ESTADOS[trabajo.estado] || ESTADOS.pendiente
              return (
                <div key={trabajo.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', boxShadow: 'var(--shadow-xs)', transition: 'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.borderColor = '#D0CEC9' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-xs)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)' }}>{trabajo.tipo_servicio}</h3>
                        <span style={{ background: estado.bg, color: estado.color, borderRadius: 4, padding: '0.12rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em' }}>{estado.label}</span>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--gray-4)', marginBottom: '0.6rem', lineHeight: 1.6 }}>{trabajo.descripcion?.slice(0, 120)}{trabajo.descripcion?.length > 120 ? '...' : ''}</p>
                      <div style={{ fontSize: '0.76rem', color: 'var(--gray-3)' }}>
                        {new Date(trabajo.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    {trabajo.precio && (
                      <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.3rem', color: 'var(--coral)' }}>{trabajo.precio}€</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
