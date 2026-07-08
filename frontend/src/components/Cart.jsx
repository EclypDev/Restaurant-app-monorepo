import { useState } from 'react'
import useCartStore from '../store/cartStore'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/Cart.css'

export default function Cart() {
  const items = useCartStore((state) => state.items)
  const mesaId = useCartStore((state) => state.mesaId)
  const getTotal = useCartStore((state) => state.getTotal)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateCantidad = useCartStore((state) => state.updateCantidad)
  const clearCart = useCartStore((state) => state.clearCart)
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)

  const handleCheckout = async () => {
    if (!mesaId) {
      alert('Error: No se detectó el número de mesa. Escanee el QR nuevamente.')
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
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error al crear el pedido')
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
