import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { IOrden, OrderStatus } from '@shared'
import '../styles/Cocina.css'

export default function Cocina() {
  const { user, loading } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState<IOrden[]>([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!loading && (!user || (user.rol !== 'cocina' && user.rol !== 'admin'))) {
      navigate('/login')
      return
    }

    if (!socket) return

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
  }, [user, loading, navigate, socket])

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
            
            {item.estructuraPlatoFinal && (
              <div className="kitchen-instructions">
                {item.estructuraPlatoFinal.instruccionesCocina.QUITAR.length > 0 && (
                  <div className="instruction-block instruction-remove">
                    <strong>🛑 SIN:</strong>
                    {item.estructuraPlatoFinal.instruccionesCocina.QUITAR.map((q, i) => (
                      <span key={i} className="instruction-item">{q.nombre}</span>
                    ))}
                  </div>
                )}
                {item.estructuraPlatoFinal.instruccionesCocina.ANADIR_O_EXTRA.length > 0 && (
                  <div className="instruction-block instruction-add">
                    <strong>🟢 EXTRA:</strong>
                    {item.estructuraPlatoFinal.instruccionesCocina.ANADIR_O_EXTRA.map((a, i) => (
                      <span key={i} className="instruction-item">{a.nombre}</span>
                    ))}
                  </div>
                )}
                {item.estructuraPlatoFinal.instruccionesCocina.MANTENER_BASE.length > 0 && (
                  <div className="instruction-block instruction-keep">
                    <strong>✅ MANTENER:</strong>
                    {item.estructuraPlatoFinal.instruccionesCocina.MANTENER_BASE.map((m, i) => (
                      <span key={i} className="instruction-item">{m.nombre}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {!item.estructuraPlatoFinal && item.eleccionUsuario && item.eleccionUsuario.length > 0 && (
              <div className="elecciones">
                {item.eleccionUsuario.map((el, i) => (
                  <span key={i} className="eleccion-tag">
                    {el.grupo}: {el.seleccionado.join(', ')}
                  </span>
                ))}
              </div>
            )}
            
            {item.notasEspeciales && (
              <div className="notas">️ {item.notasEspeciales}</div>
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
