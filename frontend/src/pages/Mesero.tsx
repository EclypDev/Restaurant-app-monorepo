import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { ISolicitudPagoEvent, ISolicitudMeseroEvent, PaymentMethod } from '../../shared/interfaces'
import '../styles/Mesero.css'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000')

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
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])

  useEffect(() => {
    if (!loading && (!user || !['mesero', 'cocina', 'admin'].includes(user.rol))) {
      navigate('/login')
      return
    }

    socket.emit('join-meseros')

    socket.on('solicitud-pago', (data: ISolicitudPagoEvent) => {
      setSolicitudes(prev => [{
        id: Date.now(),
        tipo: 'PAGO',
        ...data,
        timestamp: new Date(),
        atendida: false,
      }, ...prev])
      playNotificationSound()
    })

    socket.on('solicitud-mesero', (data: ISolicitudMeseroEvent) => {
      setSolicitudes(prev => [{
        id: Date.now(),
        tipo: 'MESERO',
        ...data,
        timestamp: new Date(),
        atendida: false,
      }, ...prev])
      playNotificationSound()
    })

    return () => {
      socket.off('solicitud-pago')
      socket.off('solicitud-mesero')
    }
  }, [user, loading, navigate])

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(() => {})
    } catch {
      // Audio not available
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
        <h2>🧑‍🍳 Solicitudes de Meseros</h2>
        <span className="user-info">{user?.nombre}</span>
      </header>

      <div className="mesero-columns">
        <div className="mesero-column">
          <h3>🔔 Activas ({activas.length})</h3>
          {activas.map(solicitud => (
            <SolicitudCard
              key={solicitud.id}
              solicitud={solicitud}
              onAtender={() => marcarAtendida(solicitud.id)}
              onEliminar={() => eliminarSolicitud(solicitud.id)}
            />
          ))}
        </div>

        {atendidas.length > 0 && (
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
        )}
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
