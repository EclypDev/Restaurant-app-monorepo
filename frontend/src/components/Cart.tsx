import { useState, useEffect } from 'react'
import useCartStore from '../store/cartStore'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { IRecomendacion } from '@shared'
import { useToast } from './Toast'
import '../styles/Cart.css'

export default function Cart() {
  const items = useCartStore((state) => state.items)
  const mesaId = useCartStore((state) => state.mesaId)
  const getTotal = useCartStore((state) => state.getTotal)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateCantidad = useCartStore((state) => state.updateCantidad)
  const clearCart = useCartStore((state) => state.clearCart)
  const addItem = useCartStore((state) => state.addItem)
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [recomendaciones, setRecomendaciones] = useState<IRecomendacion[]>([])

  useEffect(() => {
    if (items.length > 0) {
      fetchRecomendaciones()
    }
  }, [items])

  const fetchRecomendaciones = async () => {
    try {
      const { data } = await axios.post<IRecomendacion[]>('/api/recomendaciones', {
        cartItems: items.map(i => ({ platilloId: i.platilloId })),
        mesaId,
      })
      setRecomendaciones(data)
    } catch {
      setRecomendaciones([])
    }
  }

  const handleAddRecomendacion = (platillo: IRecomendacion) => {
    addItem({
      platilloId: platillo._id,
      nombre: platillo.nombre,
      cantidad: 1,
      precioUnitario: platillo.precioBase,
      eleccionUsuario: [],
      notasEspeciales: '',
    })
  }

  const handleCheckout = async () => {
    if (!mesaId) {
      toast('No se detectó el número de mesa. Escanee el QR nuevamente.', 'error')
      return
    }

    try {
      const { data } = await axios.post('/api/pedidos', {
        mesaId,
        items,
        totalPagar: getTotal(),
      })

      clearCart()
      navigate(`/order/${data.orden._id}`)
    } catch {
      toast('Error al crear el pedido', 'error')
    }
  }

  if (items.length === 0) return null

  return (
    <>
      <button className="cart-toggle" onClick={() => setIsOpen(!isOpen)}>
        🛒 {getItemCount()} items - ${getTotal().toLocaleString()}
      </button>

      {isOpen && (
        <div className="cart-overlay" onClick={() => setIsOpen(false)}>
          <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Tu Pedido</h3>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="cart-items">
              {items.map((item, idx) => (
                <div key={idx} className="cart-item">
                  <div className="cart-item-info">
                    <strong>{item.nombre}</strong>
                    {item.eleccionUsuario && item.eleccionUsuario.length > 0 && (
                      <div className="cart-item-options">
                        {item.eleccionUsuario.map((el, i) => (
                          <span key={i}>{el.seleccionado.join(', ')}</span>
                        ))}
                      </div>
                    )}
                    <div className="cart-item-price">${item.precioUnitario.toLocaleString()}</div>
                  </div>
                  <div className="cart-item-actions">
                    <button onClick={() => updateCantidad(idx, item.cantidad - 1)}>-</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => updateCantidad(idx, item.cantidad + 1)}>+</button>
                    <button className="btn-remove" onClick={() => removeItem(idx)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            {recomendaciones.length > 0 && (
              <div className="cart-recommendations">
                <h4>¿Quieres agregar algo más?</h4>
                <div className="recommendation-list">
                  {recomendaciones.map(rec => (
                    <div key={rec._id} className="recommendation-item">
                      <div className="rec-info">
                        <strong>{rec.nombre}</strong>
                        <span className="rec-motivo">{rec.motivo}</span>
                      </div>
                      <div className="rec-actions">
                        <span className="rec-price">${rec.precioBase.toLocaleString()}</span>
                        <button onClick={() => handleAddRecomendacion(rec)}>+ Agregar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <strong>${getTotal().toLocaleString()}</strong>
              </div>
              <button className="btn-checkout" onClick={handleCheckout}>
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
