import { useState, useMemo, useEffect } from 'react'
import useCartStore from '../store/cartStore'
import useInventoryStore from '../store/inventoryStore'
import axios from 'axios'
import { IPlatillo, IIngrediente } from '@shared'
import '../styles/PlatilloModal.css'

interface PlatilloModalProps {
  platillo: IPlatillo
  onClose: () => void
}

export default function PlatilloModal({ platillo, onClose }: PlatilloModalProps) {
  const [cantidad, setCantidad] = useState(1)
  const [notasEspeciales, setNotasEspeciales] = useState('')
  const [quitados, setQuitados] = useState<Set<string>>(new Set())
  const [anadidos, setAnadidos] = useState<Set<string>>(new Set())
  const [todosIngredientes, setTodosIngredientes] = useState<IIngrediente[]>([])

  const addItem = useCartStore((state) => state.addItem)
  const ingredientesAgotados = useInventoryStore((state) => state.agotados)

  useEffect(() => {
    axios.get<IIngrediente[]>('/api/inventario').then(res => {
      setTodosIngredientes(res.data)
    }).catch(() => {})
  }, [])

  const ingredienteMap = useMemo(() => {
    const map = new Map<string, IIngrediente>()
    todosIngredientes.forEach(i => map.set(i.id, i))
    return map
  }, [todosIngredientes])

  const getIng = (id: string) => ingredienteMap.get(id)

  const composicion = platillo.composicionPorDefecto || []
  const adicionesIds = platillo.adicionesPermitidas || []

  const ingredientesDisponibles = useMemo(() =>
    adicionesIds
      .map(id => getIng(id))
      .filter((i): i is IIngrediente => i !== undefined && !ingredientesAgotados.has(i.id))
      .filter(i => !anadidos.has(i.id)),
  [adicionesIds, getIng, ingredientesAgotados, anadidos])

  const precioTotal = useMemo(() => {
    let total = platillo.precioBase

    composicion.forEach(comp => {
      if (quitados.has(comp.ingredienteId) && comp.descuento) {
        total -= comp.descuento
      }
    })

    anadidos.forEach(id => {
      const ing = getIng(id)
      if (ing) total += ing.precioAdicional
    })

    return Math.max(0, total) * cantidad
  }, [platillo.precioBase, composicion, quitados, anadidos, getIng, cantidad])

  const toggleQuitar = (ingredienteId: string) => {
    setQuitados(prev => {
      const next = new Set(prev)
      if (next.has(ingredienteId)) next.delete(ingredienteId)
      else next.add(ingredienteId)
      return next
    })
  }

  const toggleAnadir = (ingredienteId: string) => {
    setAnadidos(prev => {
      const next = new Set(prev)
      if (next.has(ingredienteId)) next.delete(ingredienteId)
      else next.add(ingredienteId)
      return next
    })
  }

  const handleAgregar = () => {
    addItem({
      platilloId: platillo._id,
      nombre: platillo.nombre,
      cantidad,
      precioUnitario: precioTotal / cantidad,
      eleccionUsuario: [
        { grupo: 'QUITAR', seleccionado: Array.from(quitados).map(id => getIng(id)?.nombre || id) },
        { grupo: 'AÑADIR', seleccionado: Array.from(anadidos).map(id => getIng(id)?.nombre || id) },
      ],
      notasEspeciales,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="platillo-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>{platillo.nombre}</h2>
        <p className="modal-desc">{platillo.descripcion}</p>
        <p className="modal-base-price">Precio base: ${platillo.precioBase.toLocaleString()}</p>

        {composicion.length > 0 && (
          <div className="opciones-section">
            <h3>Ingredientes incluidos</h3>
            <div className="ingredientes-comp-grid">
              {composicion.map(comp => {
                const ing = getIng(comp.ingredienteId)
                if (!ing) return null
                const quitado = quitados.has(comp.ingredienteId)
                return (
                  <div
                    key={comp.ingredienteId}
                    className={`ing-row ${quitado ? 'quitado' : ''}`}
                  >
                    <span className="ing-emoji">{ing.emoji}</span>
                    <span className="ing-nombre">{ing.nombre}</span>
                    <button
                      className={`btn-sin ${quitado ? 'activo' : ''}`}
                      onClick={() => toggleQuitar(comp.ingredienteId)}
                    >
                      {quitado ? 'SIN ✓' : 'SIN'}
                    </button>
                    {quitado && comp.descuento ? (
                      <span className="ahorro-label">-${comp.descuento.toLocaleString()}</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {adicionesIds.length > 0 && (
          <div className="opciones-section">
            <h3>Extras</h3>
            <div className="ingredientes-comp-grid">
              {adicionesIds.map(id => {
                const ing = getIng(id)
                if (!ing) return null
                if (ingredientesAgotados.has(ing.id)) return null
                const anadido = anadidos.has(id)
                return (
                  <button
                    key={id}
                    className={`btn-extra ${anadido ? 'anadido' : ''}`}
                    onClick={() => toggleAnadir(id)}
                  >
                    <span>{ing.emoji} {ing.nombre}</span>
                    <span className="extra-price">+${ing.precioAdicional.toLocaleString()}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="notas-section">
          <label>Observación:</label>
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
