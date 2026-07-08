import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import io from 'socket.io-client'
import axios from 'axios'
import ReviewModal from '../components/ReviewModal'
import '../styles/OrderTracking.css'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000')

export default function OrderTracking() {
  const { orderId } = useParams()
  const [orden, setOrden] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [tipoPago, setTipoPago] = useState('EFECTIVO')

  useEffect(() => {
    fetchOrder()

    socket.on('orden-actualizada', (updated) => {
      if (updated._id === orderId) {
        setOrden(updated)
        if (updated.pagado) {
          setShowReview(true)
        }
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

  const solicitarPago = async () => {
    try {
      await axios.post('/api/pago/solicitar', {
        mesaId: orden.mesaId,
        tipoPago,
      })
      setShowPaymentModal(false)
      alert('✅ Solicitud enviada. Un mesero se acercará pronto.')
    } catch (error) {
      console.error('Error requesting payment:', error)
      alert('Error al solicitar la cuenta')
    }
  }

  const llamarMesero = async () => {
    try {
      await axios.post('/api/pago/llamar-mesero', {
        mesaId: orden.mesaId,
        motivo: 'Atención general',
      })
      alert('✅ Mesero notificado')
    } catch (error) {
      console.error('Error calling waiter:', error)
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

        {!orden.pagado && (
          <div className="tracking-actions">
            <button className="btn-action btn-pay" onClick={() => setShowPaymentModal(true)}>
              💳 Pedir Cuenta
            </button>
            <button className="btn-action btn-waiter" onClick={llamarMesero}>
              🙋 Llamar Mesero
            </button>
          </div>
        )}

        {orden.pagado && !showReview && (
          <div className="tracking-actions">
            <button className="btn-action btn-review" onClick={() => setShowReview(true)}>
              ⭐ Calificar Experiencia
            </button>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={e => e.stopPropagation()}>
            <h3>💳 Solicitar Cuenta</h3>
            <p>¿Cómo deseas pagar?</p>
            <div className="payment-options">
              <button
                className={`payment-option ${tipoPago === 'EFECTIVO' ? 'active' : ''}`}
                onClick={() => setTipoPago('EFECTIVO')}
              >
                💵 Efectivo
              </button>
              <button
                className={`payment-option ${tipoPago === 'TARJETA' ? 'active' : ''}`}
                onClick={() => setTipoPago('TARJETA')}
              >
                💳 Tarjeta
              </button>
              <button
                className={`payment-option ${tipoPago === 'TRANSFERENCIA' ? 'active' : ''}`}
                onClick={() => setTipoPago('TRANSFERENCIA')}
              >
                📱 Transferencia
              </button>
            </div>
            <div className="payment-actions">
              <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={solicitarPago}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showReview && (
        <ReviewModal
          mesaId={orden.mesaId}
          ordenId={orden._id}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  )
}
