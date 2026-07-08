import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import QRGenerator from '../components/QRGenerator'
import '../styles/Admin.css'

export default function Admin() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('menu')
  const [platillos, setPlatillos] = useState([])
  const [mesas, setMesas] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [showPlatilloForm, setShowPlatilloForm] = useState(false)
  const [showMesaForm, setShowMesaForm] = useState(false)
  const [editingPlatillo, setEditingPlatillo] = useState(null)

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
      const [platillosRes, mesasRes, ordenesRes] = await Promise.all([
        axios.get('/api/menu'),
        axios.get('/api/mesas'),
        axios.get('/api/pedidos'),
      ])
      setPlatillos(platillosRes.data)
      setMesas(mesasRes.data)
      setOrdenes(ordenesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
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
        <button className={activeTab === 'mesas' ? 'active' : ''} onClick={() => setActiveTab('mesas')}>
          🪑 Mesas
        </button>
        <button className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>
          📦 Órdenes
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

        {activeTab === 'mesas' && (
          <MesasTab
            mesas={mesas}
            onRefresh={fetchData}
            onAdd={() => setShowMesaForm(true)}
          />
        )}

        {activeTab === 'ordenes' && (
          <OrdenesTab ordenes={ordenes} />
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

function MenuTab({ platillos, onRefresh, onEdit, onAdd }) {
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este platillo?')) return
    try {
      await axios.delete(`/api/menu/${id}`)
      onRefresh()
    } catch (error) {
      console.error('Error deleting platillo:', error)
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
            <th>Personalizable</th>
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
              <td>{p.personalizable ? 'Sí' : 'No'}</td>
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

function MesasTab({ mesas, onRefresh, onAdd }) {
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta mesa?')) return
    try {
      await axios.delete(`/api/mesas/${id}`)
      onRefresh()
    } catch (error) {
      console.error('Error deleting mesa:', error)
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
            <QRGenerator value={m.qrCode} />
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

function OrdenesTab({ ordenes }) {
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
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PlatilloFormModal({ platillo, onClose, onSuccess }) {
  const [form, setForm] = useState(platillo || {
    nombre: '',
    descripcion: '',
    precioBase: 0,
    categoria: '',
    personalizable: false,
    disponible: true,
    opcionesSeleccionables: [],
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (platillo) {
        await axios.put(`/api/menu/${platillo._id}`, form)
      } else {
        await axios.post('/api/menu', form)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving platillo:', error)
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
          <label>
            <input
              type="checkbox"
              checked={form.personalizable}
              onChange={e => setForm({ ...form, personalizable: e.target.checked })}
            />
            Personalizable
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

function MesaFormModal({ onClose, onSuccess }) {
  const [count, setCount] = useState(10)
  const [prefix, setPrefix] = useState('Mesa')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/mesas/bulk', { count, prefix })
      onSuccess()
    } catch (error) {
      console.error('Error creating mesas:', error)
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
