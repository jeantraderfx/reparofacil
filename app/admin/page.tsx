'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'

const ADMIN_EMAIL = 'jeanfrankfx@gmail.com'

interface Profesional {
  id: string
  user_id: string
  especialidades: string[]
  especialidad: string
  telefono: string
  direccion: string
  foto_url: string | null
  kyc_documento_url: string | null
  kyc_verificado: boolean
  disponible: boolean
  trabajos_completados: number
  rating: number | null
  created_at: string
  email?: string
  nombre?: string
}

interface Cliente {
  id: string
  user_id: string
  telefono: string
  kyc_verificado?: boolean
  kyc_documento_url?: string | null
  created_at: string
  email?: string
  nombre?: string
}

export default function AdminPanel() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'profesionales' | 'clientes' | 'trabajos'>('profesionales')
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [trabajos, setTrabajos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedImg, setSelectedImg] = useState<string | null>(null)
  const [stats, setStats] = useState({ pros: 0, clientes: 0, trabajos: 0, pendientes: 0 })

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push('/auth/login'); return }
      if (user.email !== ADMIN_EMAIL) { router.push('/'); return }
      fetchAll()
    }
  }, [user, authLoading])

  const fetchAll = async () => {
    const [{ data: prosData }, { data: clientesData }, { data: trabajosData }, { data: usersData }] = await Promise.all([
      supabase.from('profesional_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('cliente_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('trabajos').select('*').order('created_at', { ascending: false }),
      supabase.auth.admin?.listUsers ? supabase.auth.admin.listUsers() : Promise.resolve({ data: { users: [] } }),
    ])

    // Enrich with auth user data via metadata
    const enriched = async (profiles: any[]) => {
      return await Promise.all(profiles?.map(async p => {
        const { data: userData } = await supabase.auth.admin?.getUserById?.(p.user_id) || { data: null }
        return {
          ...p,
          email: userData?.user?.email || '—',
          nombre: userData?.user?.user_metadata?.nombre || '—',
        }
      }) || [])
    }

    // Simple enrich without admin API (using auth.getUser workaround)
    const pros = prosData || []
    const clts = clientesData || []

    setProfesionales(pros)
    setClientes(clts)
    setTrabajos(trabajosData || [])
    setStats({
      pros: pros.length,
      clientes: clts.length,
      trabajos: trabajosData?.length || 0,
      pendientes: pros.filter(p => !p.kyc_verificado).length,
    })
    setLoading(false)
  }

  const verificarPro = async (id: string, verificado: boolean) => {
    setUpdating(id)
    await supabase.from('profesional_profiles').update({ kyc_verificado: verificado }).eq('id', id)
    await fetchAll()
    setUpdating(null)
  }

  const toggleDisponible = async (id: string, disponible: boolean) => {
    setUpdating(id)
    await supabase.from('profesional_profiles').update({ disponible }).eq('id', id)
    await fetchAll()
    setUpdating(null)
  }

  const eliminarPro = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este profesional?')) return
    setUpdating(id)
    await supabase.from('profesional_profiles').delete().eq('id', id)
    await fetchAll()
    setUpdating(null)
  }

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #FF5C3A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ marginTop: '1rem', color: '#888', fontSize: '0.9rem' }}>Cargando panel admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F0F' }}>
      {/* Image lightbox */}
      {selectedImg && (
        <div onClick={() => setSelectedImg(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={selectedImg} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <div style={{ position: 'absolute', top: 20, right: 24, color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</div>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ background: '#1A1A1A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FF5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔧</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, color: 'white', fontSize: '1rem' }}>
              reparo<span style={{ color: '#FF5C3A' }}>fácil</span>
              <span style={{ marginLeft: 8, background: 'rgba(255,92,58,.2)', color: '#FF5C3A', borderRadius: 6, padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>ADMIN</span>
            </span>
          </div>
          <button onClick={signOut} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '0.35rem 0.9rem', color: '#888', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Profesionales', value: stats.pros, icon: '🔧', color: '#FF5C3A' },
            { label: 'Clientes', value: stats.clientes, icon: '👤', color: '#6366F1' },
            { label: 'Trabajos totales', value: stats.trabajos, icon: '📋', color: '#0EA5E9' },
            { label: 'KYC pendientes', value: stats.pendientes, icon: '⚠️', color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1A1A1A', borderRadius: 16, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#1A1A1A', padding: '0.35rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
          {([
            { key: 'profesionales', label: `Profesionales (${stats.pros})` },
            { key: 'clientes', label: `Clientes (${stats.clientes})` },
            { key: 'trabajos', label: `Trabajos (${stats.trabajos})` },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: tab === t.key ? '#FF5C3A' : 'transparent', color: tab === t.key ? 'white' : '#666', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'Syne,sans-serif', transition: 'all .2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profesionales table */}
        {tab === 'profesionales' && (
          <div>
            <div style={{ background: '#1A1A1A', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: 'white', fontSize: '1rem' }}>Profesionales registrados</h2>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{stats.pendientes} pendientes de verificación KYC</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Foto', 'Especialidades', 'Dirección', 'DNI/KYC', 'Estado', 'Trabajos', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#666', letterSpacing: '.05em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profesionales.map(pro => (
                      <tr key={pro.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          {pro.foto_url ? (
                            <img onClick={() => setSelectedImg(pro.foto_url!)} src={pro.foto_url} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.1)' }} />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '0.9rem' }}>👤</div>
                          )}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, marginBottom: '0.2rem' }}>
                            {(pro.especialidades || [pro.especialidad]).join(', ')}
                          </div>
                          {pro.telefono && <div style={{ fontSize: '0.75rem', color: '#666' }}>📞 {pro.telefono}</div>}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontSize: '0.82rem', color: '#888', maxWidth: 180 }}>{pro.direccion || '—'}</div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          {pro.kyc_documento_url ? (
                            <button onClick={() => setSelectedImg(pro.kyc_documento_url!)} style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.35rem 0.75rem', color: '#aaa', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                              📄 Ver DNI
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#555' }}>Sin documento</span>
                          )}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ background: pro.kyc_verificado ? 'rgba(22,163,74,.15)' : 'rgba(245,158,11,.15)', color: pro.kyc_verificado ? '#16A34A' : '#F59E0B', borderRadius: 100, padding: '0.15rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, width: 'fit-content' }}>
                              {pro.kyc_verificado ? '✓ Verificado' : '⏳ Pendiente'}
                            </span>
                            <span style={{ background: pro.disponible ? 'rgba(14,165,233,.15)' : 'rgba(255,255,255,.05)', color: pro.disponible ? '#0EA5E9' : '#555', borderRadius: 100, padding: '0.15rem 0.6rem', fontSize: '0.72rem', fontWeight: 600, width: 'fit-content' }}>
                              {pro.disponible ? '🟢 Activo' : '🔴 Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{pro.trabajos_completados}</div>
                          {pro.rating && <div style={{ fontSize: '0.75rem', color: '#F59E0B' }}>⭐ {pro.rating}</div>}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <button onClick={() => verificarPro(pro.id, !pro.kyc_verificado)} disabled={updating === pro.id}
                              style={{ background: pro.kyc_verificado ? 'rgba(220,38,38,.15)' : 'rgba(22,163,74,.15)', color: pro.kyc_verificado ? '#DC2626' : '#16A34A', border: 'none', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', opacity: updating === pro.id ? 0.6 : 1 }}>
                              {pro.kyc_verificado ? '✕ Revocar' : '✓ Verificar'}
                            </button>
                            <button onClick={() => toggleDisponible(pro.id, !pro.disponible)} disabled={updating === pro.id}
                              style={{ background: 'rgba(255,255,255,.06)', color: '#aaa', border: 'none', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                              {pro.disponible ? 'Desactivar' : 'Activar'}
                            </button>
                            <button onClick={() => eliminarPro(pro.id)} disabled={updating === pro.id}
                              style={{ background: 'rgba(220,38,38,.1)', color: '#DC2626', border: 'none', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
                              🗑 Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {profesionales.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>No hay profesionales registrados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Clientes table */}
        {tab === 'clientes' && (
          <div style={{ background: '#1A1A1A', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: 'white', fontSize: '1rem' }}>Clientes registrados</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['ID', 'Teléfono', 'Registro'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#666', letterSpacing: '.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', color: '#555', fontFamily: 'monospace' }}>{c.user_id.slice(0, 16)}...</td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#aaa' }}>{c.telefono || '—'}</td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#666' }}>{new Date(c.created_at).toLocaleDateString('es-ES')}</td>
                    </tr>
                  ))}
                  {clientes.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>No hay clientes registrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trabajos table */}
        {tab === 'trabajos' && (
          <div style={{ background: '#1A1A1A', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, color: 'white', fontSize: '1rem' }}>Todos los trabajos</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['Servicio', 'Descripción', 'Estado', 'Precio', 'Fecha'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#666', letterSpacing: '.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trabajos.map(t => {
                    const estadoColors: Record<string, string> = { pendiente: '#F59E0B', aceptado: '#0EA5E9', completado: '#16A34A', cancelado: '#DC2626' }
                    return (
                      <tr key={t.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.88rem', color: 'white', fontWeight: 600 }}>{t.tipo_servicio}</td>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#888', maxWidth: 240 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descripcion}</div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span style={{ background: `${estadoColors[t.estado]}20`, color: estadoColors[t.estado] || '#888', borderRadius: 100, padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            {t.estado}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#FF5C3A', fontWeight: 600 }}>{t.precio ? `${t.precio}€` : '—'}</td>
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#666' }}>{new Date(t.created_at).toLocaleDateString('es-ES')}</td>
                      </tr>
                    )
                  })}
                  {trabajos.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>No hay trabajos registrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
