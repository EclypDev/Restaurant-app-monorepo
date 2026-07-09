import { useState, useMemo } from 'react'
import useCartStore from '../store/cartStore'
import useInventoryStore from '../store/inventoryStore'
import { IPlatillo } from '@shared'
import '../styles/PlatilloModal.css'

interface PlatilloModalProps {
  platillo: IPlatillo
  onClose: () => void
}

export default function PlatilloModal({ platillo, onClose }: PlatilloModalProps) {
  const [cantidad, setCantidad] = useState(1)
  const [notasEspeciales, setNotasEspeciales] = useState('')
  const [selecciones, setSelecciones] = useState<Record<string, string[]>>({})

  const addItem = useCartStore((state) => state.addItem)
  const ingredientesAgotados = useInventoryStore((state) => state.agotados)

  const precioTotal = useMemo(() => {
    let total = platillo.precioBase

    if (platillo.personalizable && platillo.opcionesSeleccionables) {
      platillo.opcionesSeleccionables.forEach(grupo => {
        const seleccionados = selecciones[grupo.grupo] || []
        seleccionados.forEach(itemNombre => {
          const item = grupo.items.find(i => i.nombre === itemNombre)
          if (item) total += item.precioExtra
        })
      })
    }

    return total * cantidad
  }, [platillo, selecciones, cantidad])

  const capasActivas = useMemo(() => {
    if (!platillo.capasVisuales) return []
    
    const nombresSeleccionados = new Set(Object.values(selecciones).flat())
    const idsSeleccionados = new Set<string>()
    if (platillo.opcionesSeleccionables) {
      platillo.opcionesSeleccionables.forEach(grupo => {
        grupo.items.forEach(item => {
          if (nombresSeleccionados.has(item.nombre) && item.ingredienteId) {
            idsSeleccionados.add(item.ingredienteId)
          }
        })
      })
    }
    return platillo.capasVisuales.filter(capa => {
      return idsSeleccionados.has(capa.ingredienteId)
    }).sort((a, b) => a.posicion.z - b.posicion.z)
  }, [platillo.capasVisuales, selecciones, platillo.opcionesSeleccionables])

  const handleSeleccion = (grupo: string, itemNombre: string) => {
    setSelecciones(prev => {
      const current = prev[grupo] || []
      const maxSeleccion = platillo.opcionesSeleccionables?.find(g => g.grupo === grupo)?.maxSeleccion || 1

      if (current.includes(itemNombre)) {
        return { ...prev, [grupo]: current.filter(n => n !== itemNombre) }
      }

      if (current.length >= maxSeleccion) {
        return prev
      }

      return { ...prev, [grupo]: [...current, itemNombre] }
    })
  }

  const esIngredienteAgotado = (item: { ingredienteId?: string }) => {
    if (!item.ingredienteId) return false
    return ingredientesAgotados.has(item.ingredienteId)
  }

  const handleAgregar = () => {
    const eleccionUsuario = platillo.opcionesSeleccionables
      ? platillo.opcionesSeleccionables.map(grupo => ({
          grupo: grupo.grupo,
          seleccionado: selecciones[grupo.grupo] || [],
        }))
      : []

    addItem({
      platilloId: platillo._id,
      nombre: platillo.nombre,
      cantidad,
      precioUnitario: precioTotal / cantidad,
      eleccionUsuario,
      notasEspeciales,
    })

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="platillo-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="dish-visual">
          {platillo.imagenBase && (
            <img src={platillo.imagenBase} alt={platillo.nombre} className="dish-base" />
          )}
          {capasActivas.map((capa, idx) => (
            <img
              key={idx}
              src={capa.imagenUrl}
              alt=""
              className="dish-layer"
              style={{
                left: `${capa.posicion.x}%`,
                top: `${capa.posicion.y}%`,
                transform: `scale(${capa.escala || 1})`,
                zIndex: capa.posicion.z,
              }}
            />
          ))}
          {!platillo.imagenBase && platillo.imagenUrl && (
            <img src={platillo.imagenUrl} alt={platillo.nombre} className="dish-base" />
          )}
        </div>

        <h2>{platillo.nombre}</h2>
        <p className="modal-desc">{platillo.descripcion}</p>
        <p className="modal-base-price">Precio base: ${platillo.precioBase.toLocaleString()}</p>

        {platillo.personalizable && platillo.opcionesSeleccionables && (
          <div className="opciones-section">
            <h3>Personaliza tu plato</h3>
            {platillo.opcionesSeleccionables.map(grupo => (
              <div key={grupo.grupo} className="opcion-grupo">
                <h4>
                  {grupo.grupo}
                  <span className="max-seleccion">
                    (máx {grupo.maxSeleccion})
                  </span>
                </h4>
                <div className="opcion-items">
                  {grupo.items.map(item => {
                    const isSelected = (selecciones[grupo.grupo] || []).includes(item.nombre)
                    const agotado = esIngredienteAgotado(item)
                    return (
                      <button
                        key={item.nombre}
                        className={`opcion-item ${isSelected ? 'selected' : ''} ${agotado ? 'agotado' : ''}`}
                        onClick={() => !agotado && handleSeleccion(grupo.grupo, item.nombre)}
                        disabled={agotado}
                      >
                        <span>{item.nombre}</span>
                        {agotado && <span className="agotado-badge">Agotado</span>}
                        {!agotado && item.precioExtra > 0 && (
                          <span className="extra-price">+${item.precioExtra.toLocaleString()}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="notas-section">
          <label>Notas especiales:</label>
          <textarea
            placeholder="Ej: Sin cebolla, salsa aparte..."
            value={notasEspeciales}
            onChange={e => setNotasEspeciales(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <div className="cantidad-selector">
            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>-</button>
            <span>{cantidad}</span>
            <button onClick={() => setCantidad(cantidad + 1)}>+</button>
          </div>
          <div className="modal-total">
            <span>Total:</span>
            <strong>${precioTotal.toLocaleString()}</strong>
          </div>
          <button className="btn-agregar" onClick={handleAgregar}>
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  )
}
