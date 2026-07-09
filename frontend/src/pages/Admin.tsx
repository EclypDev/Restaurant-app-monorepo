import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { IPlatillo, IMesa, IOrden, IIngrediente, IResena, IComposicionDefault } from '@shared'
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
      const [platillosRes, mesasRes, ordenesRes, ingredientesRes, resenasRes] = await Promise.all([
        axios.get<IPlatillo[]>('/api/menu'),
        axios.get<IMesa[]>('/api/mesas'),
        axios.get<{ ordenes: IOrden[] }>('/api/pedidos?limit=100'),
        axios.get<IIngrediente[]>('/api/inventario'),
        axios.get<IResena[]>('/api/resenas'),
      ])
      setPlatillos(platillosRes.data)
      setMesas(mesasRes.data)
      setOrdenes(ordenesRes.data.ordenes)
      setIngredientes(ingredientesRes.data)
      setResenas(resenasRes.data)
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
          <span>{user.nombre}</span>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
          🍽️ Menú
        </button>
        <button className={activeTab === 'composicion' ? 'active' : ''} onClick={() => setActiveTab('composicion')}>
          🧩 Composición
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
      </nav>

      <main className="admin-content">
        {activeTab === 'menu' && (
          <MenuTab
            platillos={platillos}
            onRefresh={fetchData}
            onEdit={(p) => { setEditingPlatillo(p); setShowPlatilloForm(true) }}
            onAdd={() => { setEditingPlatillo(null); setShowPlatilloForm(true) }}
          />
        )}

        {activeTab === 'composicion' && (
          <ComposicionTab platillos={platillos} ingredientes={ingredientes} onRefresh={fetchData} />
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
      </main>

      {showPlatilloForm && (
        <PlatilloFormModal
          platillo={editingPlatillo}
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

function MenuTab({ platillos, onRefresh, onEdit, onAdd }: {
  platillos: IPlatillo[]
  onRefresh: () => void
  onEdit: (p: IPlatillo) => void
  onAdd: () => void
}) {
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este platillo?')) return
    try {
      await axios.delete(`/api/menu/${id}`)
      onRefresh()
    } catch {
      console.error('Error deleting platillo')
    }
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h3>Gestión de Menú</h3>
        <button onClick={onAdd} className="btn-primary">+ Nuevo Platillo</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio Base</th>
            <th>Disponible</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {platillos.map(p => (
            <tr key={p._id}>
              <td>{p.nombre}</td>
              <td>{p.categoria}</td>
              <td>${p.precioBase.toLocaleString()}</td>
              <td>{p.disponible ? '✅' : '❌'}</td>
              <td>
                <button onClick={() => onEdit(p)} className="btn-small">Editar</button>
                <button onClick={() => handleDelete(p._id)} className="btn-small btn-danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

  const selectedPlatillo = platillos.find(p => p._id === selectedId)

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
              key={p._id}
              className={`composicion-platillo-btn ${selectedId === p._id ? 'active' : ''}`}
              onClick={() => setSelectedId(p._id)}
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
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta mesa?')) return
    try {
      await axios.delete(`/api/mesas/${id}`)
      onRefresh()
    } catch {
      console.error('Error deleting mesa')
    }
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h3>Gestión de Mesas</h3>
        <button onClick={onAdd} className="btn-primary">+ Nueva Mesa</button>
      </div>

      <div className="mesas-grid">
        {mesas.map(m => (
          <div key={m._id} className="mesa-card">
            <QRGenerator value={m.qrCode || ''} />
            <h4>{m.numero}</h4>
            <p className="mesa-qr-url">{m.qrCode}</p>
            <div className="mesa-actions">
              <button onClick={() => handleDelete(m._id)} className="btn-small btn-danger">Eliminar</button>
            </div>
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
            <tr key={o._id}>
              <td>{o._id.slice(-6)}</td>
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
            <tr key={r._id} className={r.estrellas <= 2 ? 'row-alerta' : ''}>
              <td>{r.mesaId}</td>
              <td>{'⭐'.repeat(r.estrellas)}</td>
              <td>{r.categoria || '-'}</td>
              <td>{r.comentario || '-'}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                {!r.resuelto && r.estrellas <= 2 && (
                  <button onClick={() => resolverResena(r._id)} className="btn-small">
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

function PlatilloFormModal({ platillo, onClose, onSuccess }: {
  platillo: IPlatillo | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    nombre: platillo?.nombre || '',
    descripcion: platillo?.descripcion || '',
    precioBase: platillo?.precioBase || 0,
    categoria: platillo?.categoria || '',
    disponible: platillo?.disponible ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (platillo) {
        await axios.put(`/api/menu/${platillo._id}`, form)
      } else {
        await axios.post('/api/menu', form)
      }
      onSuccess()
    } catch {
      console.error('Error saving platillo')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{platillo ? 'Editar Platillo' : 'Nuevo Platillo'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
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
            placeholder="Precio Base"
            value={form.precioBase}
            onChange={e => setForm({ ...form, precioBase: Number(e.target.value) })}
            required
          />
          <input
            type="text"
            placeholder="Categoría"
            value={form.categoria}
            onChange={e => setForm({ ...form, categoria: e.target.value })}
            required
          />
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
