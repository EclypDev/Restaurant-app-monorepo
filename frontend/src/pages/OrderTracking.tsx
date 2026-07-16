import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { IOrden, OrderStatus, PaymentMethod } from '@shared'
import ReviewModal from '../components/ReviewModal'
import { useSocket } from '../context/SocketContext'
import { useToast } from '../components/Toast'
import '../styles/OrderTracking.css'

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>()
  const [orden, setOrden] = useState<IOrden | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [tipoPago, setTipoPago] = useState<PaymentMethod>(PaymentMethod.CASH)
  const { socket } = useSocket()
  const { toast } = useToast()

  useEffect(() => {
    fetchOrder()

    if (!socket) return

    socket.on('orden-actualizada', (updated: IOrden) => {
      if (updated.id === orderId) {
        setOrden(updated)
        if (updated.pagado) {
          setShowReview(true)
        }
      }
    })

    return () => socket.off('orden-actualizada')
  }, [orderId, socket])

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get<IOrden>(`/api/pedidos/${orderId}`)
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
        mesaId: orden?.mesaId,
        tipoPago,
      })
      setShowPaymentModal(false)
      toast('Solicitud enviada. Un mesero se acercará pronto.', 'success')
    } catch {
      toast('Error al solicitar la cuenta', 'error')
    }
  }

  const llamarMesero = async () => {
    try {
      await axios.post('/api/pago/llamar-mesero', {
        mesaId: orden?.mesaId,
        motivo: 'Atención general',
      })
      toast('Mesero notificado', 'success')
    } catch {
      console.error('Error calling waiter')
    }
  }

  if (loading) return <div className="loading">Cargando...</div>
  if (!orden) return <div className="error">Orden no encontrada</div>

  const steps = [
    { status: OrderStatus.PENDING, label: 'Recibido', icon: '📋' },
    { status: OrderStatus.IN_PREPARATION, label: 'En Preparación', icon: '🔥' },
    { status: OrderStatus.DELIVERED, label: 'Entregado', icon: '✅' },
  ]

  const currentIndex = steps.findIndex(s => s.status === orden.estado)

  return (
    <div className="tracking-container">
      <div className="tracking-card">
        <h2>📍 Mesa {orden.mesaId}</h2>
        <p className="order-id">Orden #{orden.id.slice(-6)}</p>

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
                className={`payment-option ${tipoPago === PaymentMethod.CASH ? 'active' : ''}`}
                onClick={() => setTipoPago(PaymentMethod.CASH)}
              >
                💵 Efectivo
              </button>
              <button
                className={`payment-option ${tipoPago === PaymentMethod.CARD ? 'active' : ''}`}
                onClick={() => setTipoPago(PaymentMethod.CARD)}
              >
                💳 Tarjeta
              </button>
              <button
                className={`payment-option ${tipoPago === PaymentMethod.TRANSFER ? 'active' : ''}`}
                onClick={() => setTipoPago(PaymentMethod.TRANSFER)}
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
          ordenId={orden.id}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  )
}
