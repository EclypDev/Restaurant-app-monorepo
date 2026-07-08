import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import '../styles/Cocina.css'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000')

export default function Cocina() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    if (!loading && (!user || (user.rol !== 'cocina' && user.rol !== 'admin'))) {
      navigate('/login')
      return
    }

    socket.emit('join-kitchen')

    fetchPedidos()

    socket.on('nueva-orden-cocina', (nuevaOrden) => {
      setPedidos((prev) => [nuevaOrden, ...prev])
    })

    socket.on('orden-actualizada', (ordenActualizada) => {
      setPedidos((prev) =>
        prev.map((o) => (o._id === ordenActualizada._id ? ordenActualizada : o))
      )
    })

    return () => {
      socket.off('nueva-orden-cocina')
      socket.off('orden-actualizada')
    }
  }, [user, loading, navigate])

  const fetchPedidos = async () => {
    try {
      const { data } = await axios.get('/api/pedidos?estado=PENDIENTE,EN_PREPARACION')
      setPedidos(data)
    } catch (error) {
      console.error('Error fetching pedidos:', error)
    }
  }

  const actualizarEstado = async (id, estado) => {
    try {
      await axios.patch(`/api/pedidos/${id}/estado`, { estado })
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>

  const pedidosPendientes = pedidos.filter(p => p.estado === 'PENDIENTE')
  const pedidosEnPreparacion = pedidos.filter(p => p.estado === 'EN_PREPARACION')

  return (
    <div className="cocina-container">
      <header className="cocina-header">
        <h2>👨‍🍳 Monitor de Cocina</h2>
        <span className="user-info">{user?.nombre}</span>
      </header>

      <div className="cocina-columns">
        <div className="cocina-column">
          <h3>📋 Pendientes ({pedidosPendientes.length})</h3>
          {pedidosPendientes.map(pedido => (
            <PedidoCard
              key={pedido._id}
              pedido={pedido}
              onAction={() => actualizarEstado(pedido._id, 'EN_PREPARACION')}
              actionLabel="En Preparación"
              actionClass="btn-preparacion"
            />
          ))}
        </div>

        <div className="cocina-column">
          <h3>🔥 En Preparación ({pedidosEnPreparacion.length})</h3>
          {pedidosEnPreparacion.map(pedido => (
            <PedidoCard
              key={pedido._id}
              pedido={pedido}
              onAction={() => actualizarEstado(pedido._id, 'ENTREGADO')}
              actionLabel="Entregado"
              actionClass="btn-entregado"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PedidoCard({ pedido, onAction, actionLabel, actionClass }) {
  const tiempoTranscurrido = Math.floor(
    (Date.now() - new Date(pedido.createdAt).getTime()) / 60000
  )

  return (
    <div className={`pedido-card estado-${pedido.estado.toLowerCase()}`}>
      <div className="pedido-header">
        <span className="mesa-label">📍 {pedido.mesaId}</span>
        <span className="tiempo-label">{tiempoTranscurrido} min</span>
      </div>

      <ul className="pedido-items">
        {pedido.items.map((item, idx) => (
          <li key={idx}>
            <strong>{item.cantidad}x {item.nombre}</strong>
            {item.eleccionUsuario && item.eleccionUsuario.length > 0 && (
              <div className="elecciones">
                {item.eleccionUsuario.map((el, i) => (
                  <span key={i} className="eleccion-tag">
                    {el.grupo}: {el.seleccionado.join(', ')}
                  </span>
                ))}
              </div>
            )}
            {item.notasEspeciales && (
              <div className="notas">⚠️ {item.notasEspeciales}</div>
            )}
          </li>
        ))}
      </ul>

      <button className={`btn-action ${actionClass}`} onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  )
}
