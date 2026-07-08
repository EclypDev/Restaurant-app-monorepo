import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import io from 'socket.io-client'
import axios from 'axios'
import '../styles/OrderTracking.css'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000')

export default function OrderTracking() {
  const { orderId } = useParams()
  const [orden, setOrden] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()

    socket.on('orden-actualizada', (updated) => {
      if (updated._id === orderId) {
        setOrden(updated)
      }
    })

    return () => socket.off('orden-actualizada')
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/pedidos/${orderId}`)
      setOrden(data)
      if (data.mesaId) {
        socket.emit('join-table', data.mesaId)
      }
    } catch {
      console.error('Order not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>
  if (!orden) return <div className="error">Orden no encontrada</div>

  const steps = [
    { status: 'PENDIENTE', label: 'Recibido', icon: '📋' },
    { status: 'EN_PREPARACION', label: 'En Preparación', icon: '🔥' },
    { status: 'ENTREGADO', label: 'Entregado', icon: '✅' },
  ]

  const currentIndex = steps.findIndex(s => s.status === orden.estado)

  return (
    <div className="tracking-container">
      <div className="tracking-card">
        <h2>📍 Mesa {orden.mesaId}</h2>
        <p className="order-id">Orden #{orden._id.slice(-6)}</p>

        <div className="tracking-steps">
          {steps.map((step, idx) => (
            <div
              key={step.status}
              className={`tracking-step ${idx <= currentIndex ? 'completed' : ''} ${idx === currentIndex ? 'active' : ''}`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <h3>Resumen</h3>
          <ul>
            {orden.items.map((item, idx) => (
              <li key={idx}>
                {item.cantidad}x {item.nombre} - ${item.precioUnitario.toLocaleString()}
              </li>
            ))}
          </ul>
          <div className="order-total">
            <strong>Total: ${orden.totalPagar.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
