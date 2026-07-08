import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { IOrden, OrderStatus } from '../../shared/interfaces'
import '../styles/Cocina.css'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000')

export default function Cocina() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState<IOrden[]>([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!loading && (!user || (user.rol !== 'cocina' && user.rol !== 'admin'))) {
      navigate('/login')
      return
    }

    socket.emit('join-kitchen')

    fetchPedidos()

    socket.on('nueva-orden-cocina', (nuevaOrden: IOrden) => {
      setPedidos((prev) => [nuevaOrden, ...prev])
    })

    socket.on('orden-actualizada', (ordenActualizada: IOrden) => {
      setPedidos((prev) =>
        prev.map((o) => (o._id === ordenActualizada._id ? ordenActualizada : o))
      )
    })

    return () => {
      socket.off('nueva-orden-cocina')
      socket.off('orden-actualizada')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const fetchPedidos = useCallback(async () => {
    try {
      const { data } = await axios.get<IOrden[]>('/api/pedidos?estado=PENDIENTE,EN_PREPARACION')
      setPedidos(data)
    } catch {
      console.error('Error fetching pedidos')
    }
  }, [])

  const actualizarEstado = async (id: string, estado: OrderStatus) => {
    try {
      await axios.patch(`/api/pedidos/${id}/estado`, { estado })
    } catch {
      console.error('Error updating order')
    }
  }

  if (loading) return <div className="loading">Cargando...</div>

  const pedidosPendientes = pedidos.filter(p => p.estado === OrderStatus.PENDING)
  const pedidosEnPreparacion = pedidos.filter(p => p.estado === OrderStatus.IN_PREPARATION)

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
              now={now}
              onAction={() => actualizarEstado(pedido._id, OrderStatus.IN_PREPARATION)}
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
              now={now}
              onAction={() => actualizarEstado(pedido._id, OrderStatus.DELIVERED)}
              actionLabel="Entregado"
              actionClass="btn-entregado"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type SemaphoreColor = 'verde' | 'amarillo' | 'rojo'

function PedidoCard({ pedido, now, onAction, actionLabel, actionClass }: {
  pedido: IOrden
  now: number
  onAction: () => void
  actionLabel: string
  actionClass: string
}) {
  const minutosTranscurridos = Math.floor(
    (now - new Date(pedido.createdAt).getTime()) / 60000
  )

  let estadoColor: SemaphoreColor = 'verde'
  if (minutosTranscurridos >= 20) {
    estadoColor = 'rojo'
  } else if (minutosTranscurridos >= 10) {
    estadoColor = 'amarillo'
  }

  return (
    <div className={`pedido-card estado-${pedido.estado.toLowerCase()} semaforo-${estadoColor}`}>
      <div className="pedido-header">
        <span className="mesa-label">📍 {pedido.mesaId}</span>
        <span className={`tiempo-label tiempo-${estadoColor}`}>
          {minutosTranscurridos} min
        </span>
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
