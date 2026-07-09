import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import useCartStore from '../store/cartStore'
import { IPlatilloPredefinido, IIngrediente, IEstructuraPlatoFinal } from '@shared/interfaces'
import '../styles/PlateCreator.css'

const ALERGENO_ICONS: Record<string, string> = {
  gluten: '🌾',
  lactosa: '🥛',
  huevos: '🥚',
  frutos_secos: '🥜',
  soja: '',
  mariscos: '🦐',
  pescado: '🐟',
  mostaza: '🟡',
  sesamo: '⚫',
  sulfitos: '🍷',
}

function usePlateEngine(platilloPredefinido: IPlatilloPredefinido | null, ingredientesGlobales: IIngrediente[]) {
  const [ingredientesActuales, setIngredientesActuales] = useState<IIngrediente[]>([])
  const [alergenosRestringidos, setAlergenosRestringidos] = useState<string[]>([])

  useEffect(() => {
    if (platilloPredefinido) {
      const ingredientesBase = platilloPredefinido.composicionPorDefecto
        .map(comp => ingredientesGlobales.find(i => i._id === comp.ingredienteId))
        .filter((i): i is IIngrediente => i !== undefined)
      setIngredientesActuales(ingredientesBase)
    }
  }, [platilloPredefinido, ingredientesGlobales])

  const precioTotalCalculado = useMemo(() => {
    if (!platilloPredefinido) return 0
    let total = platilloPredefinido.precioBase

    ingredientesActuales.forEach(ing => {
      const vieneEnRecetaBase = platilloPredefinido.composicionPorDefecto.some(b => b.ingredienteId === ing._id)
      if (!vieneEnRecetaBase) {
        total += ing.precioAdicional
      }
    })
    return total
  }, [ingredientesActuales, platilloPredefinido])

  const alergenosActivosEnPantalla = useMemo(() => {
    const todosLosAlergenos = new Set<string>()
    ingredientesActuales.forEach(ing => {
      ing.alergenos.forEach(a => todosLosAlergenos.add(a))
    })
    return Array.from(todosLosAlergenos)
  }, [ingredientesActuales])

  const sugerenciasDeVentaCruzada = useMemo((): IIngrediente[] => {
    if (!platilloPredefinido) return []
    return ingredientesGlobales.filter(ing =>
      platilloPredefinido.adicionesPermitidas.includes(ing._id) &&
      !ingredientesActuales.some(act => act._id === ing._id) &&
      !ing.alergenos.some(al => alergenosRestringidos.includes(al)) &&
      ing.stockDisponible === true
    ).slice(0, 5)
  }, [ingredientesActuales, alergenosRestringidos, platilloPredefinido, ingredientesGlobales])

  const quitarIngredientePorDefecto = useCallback((idIngrediente: string) => {
    setIngredientesActuales(prev => prev.filter(ing => ing._id !== idIngrediente))
  }, [])

  const agregarAdicion = useCallback((nuevoIngrediente: IIngrediente) => {
    setIngredientesActuales(prev => {
      if (prev.some(ing => ing._id === nuevoIngrediente._id)) return prev
      return [...prev, nuevoIngrediente]
    })
  }, [])

  const toggleAlergeno = useCallback((alergeno: string) => {
    setAlergenosRestringidos(prev =>
      prev.includes(alergeno) ? prev.filter(a => a !== alergeno) : [...prev, alergeno]
    )
  }, [])

  const generarEstructuraPlatoFinal = useCallback((): IEstructuraPlatoFinal | null => {
    if (!platilloPredefinido) return null

    const idsBase = new Set(platilloPredefinido.composicionPorDefecto.map(c => c.ingredienteId))
    const idsActuales = new Set(ingredientesActuales.map(i => i._id))

    const QUITAR = platilloPredefinido.composicionPorDefecto
      .filter(comp => !idsActuales.has(comp.ingredienteId))
      .map(comp => {
        const ing = ingredientesGlobales.find(i => i._id === comp.ingredienteId)
        return { ingredienteId: comp.ingredienteId, nombre: ing?.nombre || '' }
      })

    const AÑADIR_EXTRA = ingredientesActuales
      .filter(ing => !idsBase.has(ing._id))
      .map(ing => ({
        ingredienteId: ing._id,
        nombre: ing.nombre,
        precioCobrado: ing.precioAdicional,
      }))

    const MANTENER_BASE = ingredientesActuales
      .filter(ing => idsBase.has(ing._id))
      .map(ing => ({
        ingredienteId: ing._id,
        nombre: ing.nombre,
      }))

    return {
      platilloOriginalId: platilloPredefinido._id,
      nombreMenu: `${platilloPredefinido.nombre} (Personalizada)`,
      precioFinalCobrado: precioTotalCalculado,
      instruccionesCocina: { QUITAR, AÑADIR_EXTRA, MANTENER_BASE },
    }
  }, [platilloPredefinido, ingredientesActuales, ingredientesGlobales, precioTotalCalculado])

  return {
    ingredientesActuales,
    precioTotalCalculado,
    alergenosActivosEnPantalla,
    sugerenciasDeVentaCruzada,
    quitarIngredientePorDefecto,
    agregarAdicion,
    toggleAlergeno,
    alergenosRestringidos,
    generarEstructuraPlatoFinal,
  }
}

export default function PlateCreator() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mesaId = searchParams.get('mesa') || 'Mesa_01'
  const platilloId = searchParams.get('platillo')

  const [platillos, setPlatillos] = useState<IPlatilloPredefinido[]>([])
  const [platilloSeleccionado, setPlatilloSeleccionado] = useState<IPlatilloPredefinido | null>(null)
  const [ingredientes, setIngredientes] = useState<IIngrediente[]>([])
  const [loading, setLoading] = useState(true)

  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    Promise.all([
      axios.get<IPlatilloPredefinido[]>('/api/platillos'),
      axios.get<IIngrediente[]>('/api/inventario'),
    ]).then(([platRes, ingRes]) => {
      setPlatillos(platRes.data)
      setIngredientes(ingRes.data)
      if (platilloId) {
        const found = platRes.data.find(p => p._id === platilloId)
        if (found) setPlatilloSeleccionado(found)
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [platilloId])

  const engine = usePlateEngine(platilloSeleccionado, ingredientes)

  if (loading) return <div className="loading">Cargando creador...</div>

  if (!platilloSeleccionado) {
    return (
      <div className="plate-creator plate-creator-select">
        <header className="creator-header">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate(`/menu?mesa=${mesaId}`)}>← Menú</button>
            <h1>🍽️ Crear Tu Plato</h1>
          </div>
          <span className="mesa-badge"> {mesaId}</span>
        </header>
        <div className="platillo-select-grid">
          {platillos.map(plat => (
            <button
              key={plat._id}
              className="platillo-select-card"
              onClick={() => setPlatilloSeleccionado(plat)}
            >
              <span className="platillo-emoji">{plat.categoria === 'Hamburguesas' ? '🍔' : plat.categoria === 'Sandwiches' ? '🥪' : plat.categoria === 'Tacos' ? '🌮' : '🥗'}</span>
              <h3>{plat.nombre}</h3>
              <p>{plat.descripcion}</p>
              <div className="platillo-ingredientes-info">
                <strong>Incluye:</strong>
                <div className="ingredientes-chips">
                  {plat.composicionPorDefecto.map(comp => {
                    const ing = ingredientes.find(i => i._id === comp.ingredienteId)
                    return ing ? (
                      <span key={comp.ingredienteId} className="ing-chip incluye">
                        {ing.emoji} {ing.nombre}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
              <div className="platillo-adiciones-info">
                <strong>Puedes añadir:</strong>
                <div className="ingredientes-chips">
                  {plat.adicionesPermitidas.slice(0, 6).map(id => {
                    const ing = ingredientes.find(i => i._id === id)
                    return ing ? (
                      <span key={id} className="ing-chip adicion">
                        {ing.emoji} +${ing.precioAdicional.toLocaleString()}
                      </span>
                    ) : null
                  })}
                  {plat.adicionesPermitidas.length > 6 && (
                    <span className="ing-chip mas">+{plat.adicionesPermitidas.length - 6} más</span>
                  )}
                </div>
              </div>
              <span className="platillo-price">Desde ${plat.precioBase.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    const estructura = engine.generarEstructuraPlatoFinal()
    if (!estructura) return

    addItem({
      platilloId: estructura.platilloOriginalId,
      nombre: estructura.nombreMenu,
      cantidad: 1,
      precioUnitario: estructura.precioFinalCobrado,
      eleccionUsuario: [
        { grupo: 'QUITAR', seleccionado: estructura.instruccionesCocina.QUITAR.map(i => i.nombre) },
        { grupo: 'AÑADIR', seleccionado: estructura.instruccionesCocina.AÑADIR_EXTRA.map(i => i.nombre) },
        { grupo: 'MANTENER', seleccionado: estructura.instruccionesCocina.MANTENER_BASE.map(i => i.nombre) },
      ],
      notasEspeciales: engine.alergenosActivosEnPantalla.length > 0
        ? `Alérgenos: ${engine.alergenosActivosEnPantalla.join(', ')}`
        : '',
      estructuraPlatoFinal: estructura,
    })

    navigate(`/menu?mesa=${mesaId}`)
  }

  const renderPlate = () => {
    const layers: React.ReactNode[] = []
    const baseItems = engine.ingredientesActuales.filter(i =>
      platilloSeleccionado.composicionPorDefecto.some(c => c.ingredienteId === i._id && c.esBase)
    )
    const proteinaItems = engine.ingredientesActuales.filter(i =>
      platilloSeleccionado.composicionPorDefecto.some(c => c.ingredienteId === i._id && c.esProteina)
    )
    const defaultItems = engine.ingredientesActuales.filter(i =>
      platilloSeleccionado.composicionPorDefecto.some(c => c.ingredienteId === i._id && !c.esBase && !c.esProteina)
    )
    const extraItems = engine.ingredientesActuales.filter(i =>
      !platilloSeleccionado.composicionPorDefecto.some(c => c.ingredienteId === i._id)
    )

    baseItems.forEach((ing, idx) => {
      layers.push(
        <div key={`base-${idx}`} className="plate-layer plate-base" style={{ fontSize: '80px' }}>
          {ing.emoji}
        </div>
      )
    })

    proteinaItems.forEach((ing, idx) => {
      layers.push(
        <div key={`prot-${idx}`} className="plate-layer plate-proteina" style={{ fontSize: '60px' }}>
          {ing.emoji}
        </div>
      )
    })

    defaultItems.forEach((ing, idx) => {
      layers.push(
        <div key={`def-${idx}`} className="plate-layer plate-default" style={{
          fontSize: '40px',
          left: `${15 + (idx * 12)}%`,
          top: `${15 + (idx * 5)}%`,
        }}>
          {ing.emoji}
        </div>
      )
    })

    extraItems.forEach((ing, idx) => {
      layers.push(
        <div key={`ext-${idx}`} className="plate-layer plate-extra" style={{
          fontSize: '35px',
          right: `${10 + (idx * 10)}%`,
          bottom: `${15 + (idx * 5)}%`,
        }}>
          {ing.emoji}
        </div>
      )
    })

    return layers
  }

  const renderBaseIngredient = (ing: IIngrediente) => {
    const isPresent = engine.ingredientesActuales.some(i => i._id === ing._id)
    const isDisabled = engine.alergenosRestringidos.some(a => ing.alergenos.includes(a)) || !ing.stockDisponible

    return (
      <button
        key={ing._id}
        className={`base-ingredient-btn ${isPresent ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={() => {
          if (isDisabled) return
          if (isPresent) {
            engine.quitarIngredientePorDefecto(ing._id)
          } else {
            engine.agregarAdicion(ing)
          }
        }}
        disabled={isDisabled}
      >
        <span className="ingredient-emoji">{ing.emoji}</span>
        <span className="ingredient-name">{ing.nombre}</span>
        {isPresent && <span className="check-mark">✓</span>}
        {!isPresent && <span className="remove-mark">✕</span>}
        {ing.alergenos.length > 0 && (
          <span className="ingredient-allergens">
            {ing.alergenos.map(a => ALERGENO_ICONS[a]).join('')}
          </span>
        )}
      </button>
    )
  }

  const renderAddOnIngredient = (ing: IIngrediente) => {
    const isPresent = engine.ingredientesActuales.some(i => i._id === ing._id)
    const isDisabled = engine.alergenosRestringidos.some(a => ing.alergenos.includes(a)) || !ing.stockDisponible

    return (
      <button
        key={ing._id}
        className={`addon-ingredient-btn ${isPresent ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={() => {
          if (isDisabled) return
          if (isPresent) {
            engine.quitarIngredientePorDefecto(ing._id)
          } else {
            engine.agregarAdicion(ing)
          }
        }}
        disabled={isDisabled}
      >
        <div className="addon-info">
          <span className="ingredient-emoji">{ing.emoji}</span>
          <span className="ingredient-name">{ing.nombre}</span>
        </div>
        <div className="addon-price">
          {isPresent ? <span className="added-label">Añadido</span> : <span>+${ing.precioAdicional.toLocaleString()}</span>}
        </div>
        {ing.alergenos.length > 0 && (
          <span className="ingredient-allergens">
            {ing.alergenos.map(a => ALERGENO_ICONS[a]).join('')}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="plate-creator">
      <header className="creator-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(`/menu?mesa=${mesaId}`)}>← Menú</button>
          <h1>🍽️ {platilloSeleccionado.nombre}</h1>
        </div>
        <span className="mesa-badge"> {mesaId}</span>
      </header>

      <div className="allergen-filters">
        <span className="filter-label"> Filtros Inteligentes</span>
        <div className="allergen-chips">
          {['gluten', 'lactosa', 'huevos', 'frutos_secos', 'soja', 'mariscos', 'pescado', 'mostaza', 'sesamo', 'sulfitos'].map(alergeno => (
            <button
              key={alergeno}
              className={`allergen-chip ${engine.alergenosRestringidos.includes(alergeno) ? 'active' : ''}`}
              onClick={() => engine.toggleAlergeno(alergeno)}
            >
              {ALERGENO_ICONS[alergeno]} {alergeno.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="creator-layout">
        <div className="sidebar-left">
          <div className="ingredient-group">
            <h3>Ingredientes Base</h3>
            <p className="group-desc">Desmarca para quitar (sin descuento)</p>
            <div className="ingredient-grid">
              {platilloSeleccionado.composicionPorDefecto.map(comp => {
                const ing = ingredientes.find(i => i._id === comp.ingredienteId)
                if (!ing) return null
                return renderBaseIngredient(ing)
              })}
            </div>
          </div>
        </div>

        <div className="plate-area">
          <div className="plate-container">
            <div className="plate">
              {renderPlate()}
            </div>
          </div>

          <div className="plate-indicators">
            <div className="price-total">
              Tu Precio Total: <strong>${engine.precioTotalCalculado.toLocaleString()}</strong>
            </div>
            {engine.alergenosActivosEnPantalla.length > 0 && (
              <div className="active-allergens">
                Contiene: {engine.alergenosActivosEnPantalla.map(a => `${ALERGENO_ICONS[a]} ${a}`).join(', ')}
              </div>
            )}
          </div>

          {engine.sugerenciasDeVentaCruzada.length > 0 && (
            <div className="upselling-bar">
              <span>Mejora Tu Plato:</span>
              <div className="upselling-items">
                {engine.sugerenciasDeVentaCruzada.map(ing => (
                  <button
                    key={ing._id}
                    className="upselling-item"
                    onClick={() => engine.agregarAdicion(ing)}
                  >
                    <span>{ing.emoji}</span>
                    <span className="upselling-name">{ing.nombre}</span>
                    <span className="upselling-price">+${ing.precioAdicional.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-right">
          <div className="ingredient-group">
            <h3>Adiciones Premium</h3>
            <p className="group-desc">Selecciona para añadir (+ precio)</p>
            <div className="ingredient-grid">
              {platilloSeleccionado.adicionesPermitidas.map(id => {
                const ing = ingredientes.find(i => i._id === id)
                if (!ing) return null
                return renderAddOnIngredient(ing)
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="creator-footer">
        <button className="btn-add-cart" onClick={handleAddToCart}>
          Añadir al Carrito ${engine.precioTotalCalculado.toLocaleString()}
        </button>
      </div>
    </div>
  )
}
