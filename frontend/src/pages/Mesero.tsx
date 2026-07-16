import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { ISolicitudPagoEvent, ISolicitudMeseroEvent, PaymentMethod } from '@shared'
import '../styles/Mesero.css'

interface Solicitud {
  id: number
  tipo: 'PAGO' | 'MESERO'
  mesaId: string
  timestamp: Date
  atendida: boolean
  tipoPago?: PaymentMethod
  ordenId?: string
  total?: number
  motivo?: string
}

export default function Mesero() {
  const { user, loading } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [pedidos, setPedidos] = useState<IOrden[]>([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!loading && (!user || !['mesero', 'cocina', 'admin'].includes(user.rol))) {
      navigate('/login')
      return
    }

    const interval = setInterval(() => setNow(Date.now()), 60000)
    fetchPedidos()

    if (!socket) return

    socket.emit('join-meseros')

    socket.on('solicitud-pago', (data: ISolicitudPagoEvent) => {
      setSolicitudes(prev => [{
        id: Date.now(),
        tipo: 'PAGO',
        ...data,
        timestamp: new Date(),
        atendida: false,
      }, ...prev])
    })

    socket.on('solicitud-mesero', (data: ISolicitudMeseroEvent) => {
      setSolicitudes(prev => [{
        id: Date.now(),
        tipo: 'MESERO',
        ...data,
        timestamp: new Date(),
        atendida: false,
      }, ...prev])
    })

    socket.on('orden-actualizada', (updated: IOrden) => {
      setPedidos(prev => prev.map(o => o.id === updated.id ? updated : o))
    })

    return () => {
      socket.off('solicitud-pago')
      socket.off('solicitud-mesero')
      socket.off('orden-actualizada')
      clearInterval(interval)
    }
  }, [user, loading, navigate, socket])

  const fetchPedidos = async () => {
    try {
      const { data } = await axios.get<{ ordenes: IOrden[] }>('/api/pedidos')
      setPedidos(data.ordenes)
    } catch (e) {
      console.error('Error fetching pedidos', e)
    }
  }

  const marcarAtendida = (id: number) => {
    setSolicitudes(prev =>
      prev.map(s => s.id === id ? { ...s, atendida: true } : s)
    )
  }

  const eliminarSolicitud = (id: number) => {
    setSolicitudes(prev => prev.filter(s => s.id !== id))
  }

  if (loading) return <div className="loading">Cargando...</div>

  const activas = solicitudes.filter(s => !s.atendida)
  const atendidas = solicitudes.filter(s => s.atendida)

  return (
    <div className="mesero-container">
      <header className="mesero-header">
        <h2>🧑‍🍳 Panel del Mesero</h2>
        <span className="user-info">{user?.nombre}</span>
      </header>

      <div className="mesero-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="mesero-column">
          <h3>🔔 Solicitudes ({activas.length})</h3>
          {activas.map(solicitud => (
            <SolicitudCard
              key={solicitud.id}
              solicitud={solicitud}
              onAtender={() => marcarAtendida(solicitud.id)}
              onEliminar={() => eliminarSolicitud(solicitud.id)}
            />
          ))}
          
          <h3 style={{ marginTop: '30px' }}>📋 Pedidos</h3>
          {pedidos.map(pedido => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              now={now}
            />
          ))}
        </div>

        <div className="mesero-column">
          <h3>✅ Atendidas ({atendidas.length})</h3>
          {atendidas.map(solicitud => (
            <SolicitudCard
              key={solicitud.id}
              solicitud={solicitud}
              atendida
              onEliminar={() => eliminarSolicitud(solicitud.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SolicitudCard({ solicitud, atendida, onAtender, onEliminar }: {
  solicitud: Solicitud
  atendida?: boolean
  onAtender?: () => void
  onEliminar: () => void
}) {
  const minutos = Math.floor((Date.now() - new Date(solicitud.timestamp).getTime()) / 60000)

  return (
    <div className={`solicitud-card ${atendida ? 'atendida' : ''} tipo-${solicitud.tipo.toLowerCase()}`}>
      <div className="solicitud-header">
        <span className="mesa-label">📍 {solicitud.mesaId}</span>
        <span className="tiempo">{minutos} min</span>
      </div>

      <div className="solicitud-body">
        {solicitud.tipo === 'PAGO' ? (
          <>
            <span className="tipo-badge tipo-pago">💳 Pago - {solicitud.tipoPago}</span>
            {solicitud.total && <span className="monto">Total: ${solicitud.total.toLocaleString()}</span>}
          </>
        ) : (
          <span className="tipo-badge tipo-mesero">🙋 {solicitud.motivo}</span>
        )}
      </div>

      <div className="solicitud-actions">
        {!atendida && onAtender && (
          <button className="btn-atender" onClick={onAtender}>
            ✓ Atender
          </button>
        )}
        <button className="btn-eliminar" onClick={onEliminar}>
          ✕
        </button>
      </div>
    </div>
  )
}
