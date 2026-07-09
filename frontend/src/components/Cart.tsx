import { useState, useEffect, useRef } from 'react'
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
  const prevItemCount = useRef(0)

  useEffect(() => {
    const currentCount = getItemCount()
    if (currentCount > 0 && currentCount !== prevItemCount.current) {
      fetchRecomendaciones()
    }
    prevItemCount.current = currentCount
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
      toast('No se detectó el número de mesa. Por favor, selecciona una mesa disponible en el mapa.', 'error')
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

  const itemCount = getItemCount()

  return (
    <>
      <button className="cart-toggle premium-gradient-btn" onClick={() => setIsOpen(!isOpen)}>
        {itemCount} {itemCount === 1 ? 'item' : 'items'} - ${getTotal().toLocaleString()} COP
      </button>

      {isOpen && (
        <div className="cart-overlay premium-blur" onClick={() => setIsOpen(false)}>
          <div className="cart-sidebar dark-premium" onClick={e => e.stopPropagation()}>
            <div className="cart-header-premium">
              <h3>Tu Pedido</h3>
              <button className="close-cart-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="cart-items-premium">
              {items.map((item, idx) => (
                <div key={idx} className="cart-item-premium">
                  <div className="cart-item-info">
                    <strong className="item-name">{item.nombre}</strong>
                    {item.eleccionUsuario && item.eleccionUsuario.length > 0 && (
                      <div className="cart-item-options">
                        {item.eleccionUsuario.map((el, i) => (
                          <div key={i} className="option-row">
                            <span className="option-group-label">{el.grupo}:</span>{' '}
                            <span className="option-values">{el.seleccionado.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.notasEspeciales && (
                      <div className="cart-item-notes">
                        <span className="notes-label">Obs:</span> {item.notasEspeciales}
                      </div>
                    )}
                    <div className="cart-item-price">${item.precioUnitario.toLocaleString()} COP</div>
                  </div>
                  <div className="cart-item-actions-premium">
                    <div className="quantity-adjuster">
                      <button onClick={() => updateCantidad(idx, item.cantidad - 1)}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => updateCantidad(idx, item.cantidad + 1)}>+</button>
                    </div>
                    <button className="btn-remove-premium" onClick={() => removeItem(idx)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {recomendaciones.length > 0 && (
              <div className="cart-recommendations dark-premium">
                <h4>Sugerencias de la Casa</h4>
                <div className="recommendation-list">
                  {recomendaciones.map(rec => (
                    <div key={rec._id} className="recommendation-item dark-card">
                      <div className="rec-info">
                        <strong>{rec.nombre}</strong>
                        <span className="rec-motivo">{rec.motivo}</span>
                      </div>
                      <div className="rec-actions">
                        <span className="rec-price">${rec.precioBase.toLocaleString()} COP</span>
                        <button className="add-rec-btn" onClick={() => handleAddRecomendacion(rec)}>Agregar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="cart-footer-premium">
              <div className="cart-total-premium">
                <span>Total:</span>
                <strong>${getTotal().toLocaleString()} COP</strong>
              </div>
              <button className="btn-checkout-premium" onClick={handleCheckout}>
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
