import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { IPlatillo, IMesa, IOrden, IIngrediente, IResena, IComposicionDefault } from '@shared'
import NegocioSwitcher from '../components/NegocioSwitcher'
import QRGenerator from '../components/QRGenerator'
import '../styles/Admin.css'

export default function Admin() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'menu' | 'composicion' | 'mesas' | 'inventario' | 'ordenes' | 'resenas'>('menu')
  const [platillos, setPlatillos] = useState<IPlatillo[]>([])
  const [mesas, setMesas] = useState<IMesa[]>([])
  const [ordenes, setOrdenes] = useState<IOrden[]>([])
  const [ingredientes, setIngredientes] = useState<IIngrediente[]>([])
  const [resenas, setResenas] = useState<IResena[]>([])
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([])
  const [showPlatilloForm, setShowPlatilloForm] = useState(false)
  const [showMesaForm, setShowMesaForm] = useState(false)
  const [editingPlatillo, setEditingPlatillo] = useState<IPlatillo | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user?.rol === 'admin') {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [platillosRes, mesasRes, ordenesRes, ingredientesRes, resenasRes, categoriasRes] = await Promise.all([
        axios.get<IPlatillo[]>('/api/menu'),
        axios.get<IMesa[]>('/api/mesas'),
        axios.get<{ ordenes: IOrden[] }>('/api/pedidos?limit=100'),
        axios.get<IIngrediente[]>('/api/inventario'),
        axios.get<IResena[]>('/api/resenas'),
        axios.get<{ id: string; nombre: string }[]>('/api/categorias'),
      ])
      setPlatillos(platillosRes.data)
      setMesas(mesasRes.data)
      setOrdenes(ordenesRes.data.ordenes)
      setIngredientes(ingredientesRes.data)
      setResenas(resenasRes.data)
      setCategorias(categoriasRes.data)
    } catch {
      console.error('Error fetching data')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return <div className="loading">Cargando...</div>
  if (!user || user.rol !== 'admin') return null

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>⚙️ Panel de Administración</h2>
        <div className="admin-header-actions">
          <NegocioSwitcher onSwitch={fetchData} />
          <span>{user.nombre}</span>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
          🍽️ Menú
        </button>
        <button className={activeTab === 'mesas' ? 'active' : ''} onClick={() => setActiveTab('mesas')}>
          🪑 Mesas
        </button>
        <button className={activeTab === 'inventario' ? 'active' : ''} onClick={() => setActiveTab('inventario')}>
          📦 Inventario
        </button>
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>
          📦 Órdenes
        </button>
        <button className={activeTab === 'resenas' ? 'active' : ''} onClick={() => setActiveTab('resenas')}>
          ⭐ Reseñas
        </button>
        <button className={activeTab === 'categorias' ? 'active' : ''} onClick={() => setActiveTab('categorias')}>
          🏷️ Categorías
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'menu' && (
          <MenuTab
            platillos={platillos}
            categorias={categorias}
            onRefresh={fetchData}
            onEdit={(p) => { setEditingPlatillo(p); setShowPlatilloForm(true) }}
            onAdd={() => { setEditingPlatillo(null); setShowPlatilloForm(true) }}
          />
        )}

        {activeTab === 'mesas' && (
          <MesasTab
            mesas={mesas}
            onRefresh={fetchData}
            onAdd={() => setShowMesaForm(true)}
          />
        )}

        {activeTab === 'inventario' && (
          <InventarioTab
            ingredientes={ingredientes}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'ordenes' && (
          <OrdenesTab ordenes={ordenes} />
        )}

        {activeTab === 'resenas' && (
          <ResenasTab
            resenas={resenas}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'categorias' && (
          <CategoriasTab
            categorias={categorias}
            onRefresh={fetchData}
          />
        )}
      </main>

      {showPlatilloForm && (
        <ProductoFormModal
          platillo={editingPlatillo}
          categorias={categorias}
          onClose={() => { setShowPlatilloForm(false); setEditingPlatillo(null) }}
          onSuccess={() => { setShowPlatilloForm(false); setEditingPlatillo(null); fetchData() }}
        />
      )}

      {showMesaForm && (
        <MesaFormModal
          onClose={() => setShowMesaForm(false)}
          onSuccess={() => { setShowMesaForm(false); fetchData() }}
        />
      )}
    </div>
  )
}

function MenuTab({ platillos, categorias, onRefresh, onEdit, onAdd }: {
  platillos: IPlatillo[]
  categorias: { id: string; nombre: string }[]
  onRefresh: () => void
  onEdit: (p: IPlatillo) => void
  onAdd: () => void
}) {
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await axios.delete(`/api/menu/${id}`)
      onRefresh()
    } catch {
      console.error('Error eliminando producto')
    }
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h3>Gestión de Productos</h3>
        <button onClick={onAdd} className="btn-primary">+ Nuevo Producto</button>
      </div>

      <div className="productos-grid-admin" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {platillos.map(p => (
          <div key={p.id || p._id} className="producto-card-admin" style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            transition: 'all 0.2s'
          }}>
            <div style={{
              height: '160px',
              background: p.imagenUrl ? `url(${p.imagenUrl}) center/cover` : 'linear-gradient(135deg, #1a1f3a, #111827)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '3rem'
            }}>
              {!p.imagenUrl && '🍽️'}
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{p.nombre}</h4>
                <span style={{
                  background: p.disponible ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: p.disponible ? '#4ade80' : '#f87171',
                  padding: '2px 10px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>{p.disponible ? 'Disponible' : 'Agotado'}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(255,107,53,0.1)',
                  color: '#ff8a50',
                  padding: '2px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>{p.categoria}</span>
                <span style={{
                  background: 'rgba(59,130,246,0.1)',
                  color: '#60a5fa',
                  padding: '2px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>${p.precioBase.toLocaleString()}</span>
              </div>
              {p.descripcion && (
                <p style={{ fontSize: '0.85rem', color: '#8892a0', lineHeight: 1.4, margin: '0 0 12px' }}>{p.descripcion}</p>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => onEdit(p)} style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: '#f1f3f5',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}>Editar</button>
                <button onClick={() => handleDelete(p.id || p._id)} style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(239,68,68,0.15)',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComposicionTab({ platillos, ingredientes, onRefresh }: {
  platillos: IPlatillo[]
  ingredientes: IIngrediente[]
  onRefresh: () => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [localComposicion, setLocalComposicion] = useState<IComposicionDefault[]>([])
  const [localAdiciones, setLocalAdiciones] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const selectedPlatillo = platillos.find(p => (p.id || p._id) === selectedId)

  useEffect(() => {
    if (selectedPlatillo) {
      setLocalComposicion(selectedPlatillo.composicionPorDefecto || [])
      setLocalAdiciones(selectedPlatillo.adicionesPermitidas || [])
    }
  }, [selectedPlatillo])

  const ingredienteMap = new Map(ingredientes.map(i => [i.id, i]))

  const updateComp = (idx: number, field: string, value: any) => {
    setLocalComposicion(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const toggleAdicion = (ingId: string) => {
    setLocalAdiciones(prev =>
      prev.includes(ingId) ? prev.filter(id => id !== ingId) : [...prev, ingId]
    )
  }

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      await axios.put(`/api/menu/${selectedId}`, {
        composicionPorDefecto: localComposicion,
        adicionesPermitidas: localAdiciones,
      })
      onRefresh()
    } catch {
      console.error('Error saving composition')
    } finally {
      setSaving(false)
    }
  }

  const ingredientesNoBase = ingredientes.filter(i =>
    !localComposicion.some(c => c.ingredienteId === i.id)
  )

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h3>Configuración de Ingredientes por Plato</h3>
      </div>

      <div className="composicion-layout">
        <div className="composicion-sidebar">
          <h4>Platos</h4>
          {platillos.map(p => (
            <button
              key={p.id || p._id}
              className={`composicion-platillo-btn ${selectedId === (p.id || p._id) ? 'active' : ''}`}
              onClick={() => setSelectedId(p.id || p._id)}
            >
              {p.nombre}
            </button>
          ))}
        </div>

        <div className="composicion-main">
          {!selectedPlatillo ? (
            <p className="composicion-empty">Selecciona un plato para configurar sus ingredientes</p>
          ) : (
            <>
              <h4>{selectedPlatillo.nombre} — ${selectedPlatillo.precioBase.toLocaleString()}</h4>

              <div className="comp-section">
                <h5>Ingredientes incluidos (composición por defecto)</h5>
                <p className="group-desc">Marca como removible y asigna descuento al quitar</p>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ingrediente</th>
                      <th>Removible</th>
                      <th>Descuento ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localComposicion.map((comp, idx) => {
                      const ing = ingredienteMap.get(comp.ingredienteId)
                      return (
                        <tr key={comp.ingredienteId}>
                          <td>{ing?.emoji} {ing?.nombre || comp.ingredienteId}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={comp.removible}
                              onChange={e => updateComp(idx, 'removible', e.target.checked)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={comp.descuento || 0}
                              onChange={e => updateComp(idx, 'descuento', Number(e.target.value))}
                              min="0"
                              step="100"
                              className="input-small"
                              disabled={!comp.removible}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="comp-section">
                <h5>Extras disponibles (adiciones permitidas)</h5>
                <p className="group-desc">Selecciona los ingredientes que se pueden añadir como extra</p>
                <div className="adiciones-grid">
                  {ingredientesNoBase.map(ing => {
                    const activo = localAdiciones.includes(ing.id)
                    return (
                      <button
                        key={ing.id}
                        className={`adicion-btn ${activo ? 'activo' : ''}`}
                        onClick={() => toggleAdicion(ing.id)}
                      >
                        <span>{ing.emoji} {ing.nombre}</span>
                        <span className="adicion-precio">+${ing.precioAdicional.toLocaleString()}</span>
                        {activo && <span className="check-badge">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MesasTab({ mesas, onRefresh, onAdd }: {
  mesas: IMesa[]
  onRefresh: () => void
  onAdd: () => void
}) {
  const [numero, setNumero] = useState('')
  const [capacidad, setCapacidad] = useState(4)
  const [creando, setCreando] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numero.trim()) return
    setCreando(true)
    try {
      await axios.post('/api/mesas', { numero: numero.trim(), capacidad })
      setNumero('')
      setCapacidad(4)
      onRefresh()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al crear mesa')
    } finally {
      setCreando(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta mesa?')) return
    try {
      await axios.delete(`/api/mesas/${id}`)
      onRefresh()
    } catch {
      console.error('Error eliminando mesa')
    }
  }

  const handleBulk = async () => {
    const count = prompt('¿Cuántas mesas quieres crear en lote?', '5')
    if (!count) return
    const prefix = prompt('Prefijo (ej: Mesa, Barra, VIP)', 'Mesa') || 'Mesa'
    try {
      await axios.post('/api/mesas/bulk', { count: parseInt(count), prefix })
      onRefresh()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al crear mesas')
    }
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h3>Gestión de Mesas</h3>
        <button onClick={handleBulk} className="btn-primary">+ Crear en Lote</button>
      </div>

      {/* Formulario inline para agregar mesa */}
      <form onSubmit={handleCreate} style={{
        display: 'flex', gap: '12px', marginBottom: '24px',
        padding: '16px', background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
        alignItems: 'end', flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', marginBottom: '4px' }}>Número / Nombre de mesa</label>
          <input
            type="text"
            placeholder="Ej: Mesa 1, Barra 2, VIP 1"
            value={numero}
            onChange={e => setNumero(e.target.value)}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
              color: '#f1f3f5', fontSize: '0.95rem', outline: 'none'
            }}
            required
          />
        </div>
        <div style={{ minWidth: '100px' }}>
          <label style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', marginBottom: '4px' }}>Capacidad</label>
          <input
            type="number"
            value={capacidad}
            onChange={e => setCapacidad(Number(e.target.value))}
            min={1}
            max={50}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
              color: '#f1f3f5', fontSize: '0.95rem', outline: 'none'
            }}
          />
        </div>
        <button type="submit" disabled={creando} style={{
          padding: '10px 24px', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
          color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
          opacity: creando ? 0.6 : 1
        }}>
          {creando ? 'Creando...' : 'Agregar Mesa'}
        </button>
      </form>

      {/* Grid de mesas */}
      <div className="mesas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {mesas.map(m => (
          <div key={m.id || m._id} className="mesa-card" style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '20px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              {m.qrCode ? (
                <QRGenerator value={m.qrCode} showDownload />
              ) : (
                <div style={{ width: '128px', height: '128px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8892a0', fontSize: '0.8rem' }}>Sin QR</div>
              )}
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>{m.numero}</h4>
            {m.capacidad && (
              <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#8892a0' }}>🪑 {m.capacidad} personas</p>
            )}
            <div className="mesa-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => handleDelete(m.id || m._id)} className="btn-small btn-danger">Eliminar</button>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: '8px', wordBreak: 'break-all' }}>{m.qrCode}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function InventarioTab({ ingredientes, onRefresh }: {
  ingredientes: IIngrediente[]
  onRefresh: () => void
}) {
  const toggleDisponibilidad = async (id: string, disponible: boolean) => {
    try {
      await axios.patch(`/api/inventario/${id}/disponibilidad`, { disponible: !disponible })
      onRefresh()
    } catch {
      console.error('Error updating ingredient')
    }
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h3>Inventario de Ingredientes</h3>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio adicional</th>
            <th>Disponible</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredientes.map(ing => (
            <tr key={ing.id} className={!ing.stockDisponible ? 'row-agotado' : ''}>
              <td>{ing.emoji} {ing.nombre}</td>
              <td>{ing.categoria || '-'}</td>
              <td>${ing.precioAdicional.toLocaleString()}</td>
              <td>{ing.stockDisponible ? '✅' : '❌ Agotado'}</td>
              <td>
                <button
                  onClick={() => toggleDisponibilidad(ing.id, ing.stockDisponible)}
                  className="btn-small"
                >
                  {ing.stockDisponible ? 'Marcar Agotado' : 'Marcar Disponible'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OrdenesTab({ ordenes }: { ordenes: IOrden[] }) {
  return (
    <div className="tab-content">
      <h3>Historial de Órdenes</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mesa</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Pago</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map(o => (
            <tr key={o.id || o._id}>
              <td>{o.id.slice(-6)}</td>
              <td>{o.mesaId}</td>
              <td><span className={`estado-badge estado-${o.estado.toLowerCase()}`}>{o.estado}</span></td>
              <td>${o.totalPagar.toLocaleString()}</td>
              <td>{o.pagado ? '✅' : '⏳'}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ResenasTab({ resenas, onRefresh }: {
  resenas: IResena[]
  onRefresh: () => void
}) {
  const resolverResena = async (id: string) => {
    try {
      await axios.patch(`/api/resenas/${id}/resolver`, { respuestaAdmin: 'Resuelto' })
      onRefresh()
    } catch {
      console.error('Error resolving review')
    }
  }

  return (
    <div className="tab-content">
      <h3>Reseñas de Clientes</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Mesa</th>
            <th>Estrellas</th>
            <th>Categoría</th>
            <th>Comentario</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {resenas.map(r => (
            <tr key={r.id || r._id} className={r.estrellas <= 2 ? 'row-alerta' : ''}>
              <td>{r.mesaId}</td>
              <td>{'⭐'.repeat(r.estrellas)}</td>
              <td>{r.categoria || '-'}</td>
              <td>{r.comentario || '-'}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                {!r.resuelto && r.estrellas <= 2 && (
                  <button onClick={() => resolverResena(r.id || r._id)} className="btn-small">
                    Resolver
                  </button>
                )}
                {r.resuelto && <span className="resuelto-badge">✅ Resuelto</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CategoriasTab({ categorias, onRefresh }: {
  categorias: { id: string; nombre: string }[]
  onRefresh: () => void
}) {
  const [nuevaCategoria, setNuevaCategoria] = useState('')

  const agregarCategoria = async () => {
    if (!nuevaCategoria.trim()) return
    try {
      await axios.post('/api/categorias', { nombre: nuevaCategoria.trim() })
      setNuevaCategoria('')
      onRefresh()
    } catch {
      console.error('Error agregando categoría')
    }
  }

  const eliminarCategoria = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await axios.delete(`/api/categorias/${id}`)
      onRefresh()
    } catch {
      console.error('Error eliminando categoría')
    }
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h3>Gestión de Categorías</h3>
      </div>
      <div className="categorias-manager" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Nueva categoría"
          value={nuevaCategoria}
          onChange={e => setNuevaCategoria(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && agregarCategoria()}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#f1f3f5' }}
        />
        <button onClick={agregarCategoria} className="btn-primary">Agregar</button>
      </div>
      <div className="categorias-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {categorias.map(c => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span>{c.nombre}</span>
            <button onClick={() => eliminarCategoria(c.id)} className="btn-small btn-danger">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductoFormModal({ platillo, categorias, onClose, onSuccess }: {
  platillo: IPlatillo | null
  categorias: { id: string; nombre: string }[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    nombre: platillo?.nombre || '',
    descripcion: platillo?.descripcion || '',
    precioBase: platillo?.precioBase || 0,
    categoria: platillo?.categoria || (categorias[0]?.nombre || ''),
    imagenUrl: platillo?.imagenUrl || '',
    disponible: platillo?.disponible ?? true,
  })

  const [previewImg, setPreviewImg] = useState(platillo?.imagenUrl || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (platillo) {
        await axios.put(`/api/menu/${platillo.id || platillo._id}`, form)
      } else {
        await axios.post('/api/menu', form)
      }
      onSuccess()
    } catch {
      console.error('Error guardando producto')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{platillo ? 'Editar Producto' : 'Nuevo Producto'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <textarea
            placeholder="Descripción"
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
          />
          <input
            type="number"
            placeholder="Precio"
            value={form.precioBase}
            onChange={e => setForm({ ...form, precioBase: Number(e.target.value) })}
            required
          />
          <select
            value={form.categoria}
            onChange={e => setForm({ ...form, categoria: e.target.value })}
            required
          >
            {categorias.map(c => (
              <option key={c.id} value={c.nombre}>{c.nombre}</option>
            ))}
          </select>
          <input
            type="url"
            placeholder="URL de la imagen (opcional)"
            value={form.imagenUrl}
            onChange={e => {
              setForm({ ...form, imagenUrl: e.target.value })
              setPreviewImg(e.target.value)
            }}
          />
          {previewImg && (
            <div className="image-preview">
              <img src={previewImg} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', marginTop: '8px' }} />
            </div>
          )}
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={e => setForm({ ...form, disponible: e.target.checked })}
            />
            Disponible
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MesaFormModal({ onClose, onSuccess }: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [count, setCount] = useState(10)
  const [prefix, setPrefix] = useState('Mesa')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/mesas/bulk', { count, prefix })
      onSuccess()
    } catch {
      console.error('Error creating mesas')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Generar Mesas</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Prefijo"
            value={prefix}
            onChange={e => setPrefix(e.target.value)}
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            min="1"
            required
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Generar QRs</button>
          </div>
        </form>
      </div>
    </div>
  )
}
