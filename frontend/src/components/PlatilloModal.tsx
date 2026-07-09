import { useState, useMemo } from 'react'
import useCartStore from '../store/cartStore'
import { IPlatillo } from '@shared'
import '../styles/PlatilloModal.css'

interface PlatilloModalProps {
  platillo: IPlatillo
  onClose: () => void
}

interface Beverage {
  id: string
  nombre: string
  precio: number
}

interface Extra {
  id: string
  nombre: string
  precio: number
}

const BEVERAGES: Beverage[] = [
  { id: 'b1', nombre: 'Café Negro', precio: 3000 },
  { id: 'b2', nombre: 'Limonada de Coco', precio: 7000 },
  { id: 'b3', nombre: 'Limonada Cerezada', precio: 6500 },
  { id: 'b4', nombre: 'Jugo de Lulo', precio: 5000 }
]

export default function PlatilloModal({ platillo, onClose }: PlatilloModalProps) {
  const [bebidaId, setBebidaId] = useState<string>('b1')
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<Set<string>>(new Set())
  const [observacion, setObservacion] = useState('')
  const [cantidad, setCantidad] = useState(1)

  const addItem = useCartStore((state) => state.addItem)

  // AI suggestions based on dish name
  const aiExtras = useMemo<Extra[]>(() => {
    const name = platillo.nombre.toLowerCase()
    if (name.includes('paisa')) {
      return [
        { id: 'e1', nombre: 'Salsa de la Casa', precio: 1500 },
        { id: 'e2', nombre: 'Huevo Frito Extra', precio: 2000 }
      ]
    } else if (name.includes('posta')) {
      return [
        { id: 'e3', nombre: 'Patacón Adicional', precio: 3000 },
        { id: 'e4', nombre: 'Porción de Aguacate', precio: 2500 }
      ]
    } else if (name.includes('sancocho')) {
      return [
        { id: 'e5', nombre: 'Porción de Arroz', precio: 2000 },
        { id: 'e6', nombre: 'Aguacate Extra', precio: 2500 }
      ]
    } else {
      return [
        { id: 'e7', nombre: 'Queso Doble Crema', precio: 3000 },
        { id: 'e8', nombre: 'Salsa Fuego', precio: 1500 }
      ]
    }
  }, [platillo.nombre])

  const selectedBeverage = useMemo(() => BEVERAGES.find(b => b.id === bebidaId) || BEVERAGES[0], [bebidaId])

  const selectedExtrasPrice = useMemo(() => {
    let total = 0
    extrasSeleccionados.forEach(id => {
      const extra = aiExtras.find(e => e.id === id)
      if (extra) total += extra.precio
    })
    return total
  }, [extrasSeleccionados, aiExtras])

  const precioUnitario = useMemo(() => {
    return platillo.precioBase + selectedBeverage.precio + selectedExtrasPrice
  }, [platillo.precioBase, selectedBeverage, selectedExtrasPrice])

  const precioTotal = useMemo(() => {
    return precioUnitario * cantidad
  }, [precioUnitario, cantidad])

  const toggleExtra = (id: string) => {
    setExtrasSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAgregar = () => {
    const choices = [
      { grupo: 'Bebida', seleccionado: [selectedBeverage.nombre] }
    ]

    const activeExtrasList = aiExtras.filter(e => extrasSeleccionados.has(e.id)).map(e => e.nombre)
    if (activeExtrasList.length > 0) {
      choices.push({ grupo: 'Adicionales', seleccionado: activeExtrasList })
    }

    addItem({
      platilloId: platillo._id,
      nombre: platillo.nombre,
      cantidad,
      precioUnitario,
      eleccionUsuario: choices,
      notasEspeciales: observacion
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="platillo-modal dark-premium" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="modal-hero-image" style={{ backgroundImage: `url(${platillo.imagenUrl})` }}>
          <div className="modal-hero-overlay">
            <h2>{platillo.nombre}</h2>
            <p className="modal-base-price">Precio base: ${platillo.precioBase.toLocaleString()} COP</p>
          </div>
        </div>

        <div className="modal-body-content">
          <p className="modal-description-text">{platillo.descripcion}</p>

          {/* 1. Beverage Selection */}
          <div className="customization-section">
            <h3 className="section-title">Elegir Bebida</h3>
            <div className="beverage-options">
              {BEVERAGES.map(b => (
                <label key={b.id} className={`beverage-option-card ${bebidaId === b.id ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="beverage"
                    value={b.id}
                    checked={bebidaId === b.id}
                    onChange={() => setBebidaId(b.id)}
                    className="beverage-radio-hidden"
                  />
                  <div className="beverage-info">
                    <span className="beverage-name">{b.nombre}</span>
                    <span className="beverage-extra-price">+${b.precio.toLocaleString()} COP</span>
                  </div>
                  <div className="custom-radio-indicator"></div>
                </label>
              ))}
            </div>
          </div>

          {/* 2. AI Recommended */}
          <div className="customization-section">
            <h3 className="section-title">Los clientes suelen agregar</h3>
            <div className="ai-suggestions-grid">
              {aiExtras.map(extra => {
                const activo = extrasSeleccionados.has(extra.id)
                return (
                  <button
                    key={extra.id}
                    className={`ai-suggestion-btn ${activo ? 'activo' : ''}`}
                    onClick={() => toggleExtra(extra.id)}
                  >
                    <div className="suggestion-details">
                      <span className="suggestion-name">{extra.nombre}</span>
                      <span className="suggestion-price">+${extra.precio.toLocaleString()} COP</span>
                    </div>
                    <span className="suggestion-checkbox">{activo ? '✓' : '+'}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Observation Textarea */}
          <div className="customization-section">
            <h3 className="section-title">Observación</h3>
            <textarea
              className="observation-textarea-premium"
              placeholder="Escribe aquí cualquier indicación especial, como restricciones de alérgenos o términos de carne..."
              value={observacion}
              onChange={e => setObservacion(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer-premium">
          <div className="quantity-controls-premium">
            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>-</button>
            <span>{cantidad}</span>
            <button onClick={() => setCantidad(cantidad + 1)}>+</button>
          </div>
          <div className="modal-total-price">
            <span className="total-label">Total:</span>
            <span className="total-amount">${precioTotal.toLocaleString()} COP</span>
          </div>
          <button className="btn-add-to-order" onClick={handleAgregar}>
            Confirmar Pedido
          </button>
        </div>
      </div>
    </div>
  )
}
