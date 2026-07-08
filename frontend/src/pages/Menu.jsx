import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import useCartStore from '../store/cartStore'
import useInventoryStore from '../store/inventoryStore'
import Cart from '../components/Cart'
import PlatilloCard from '../components/PlatilloCard'
import PlatilloModal from '../components/PlatilloModal'
import AllergenFilter from '../components/AllergenFilter'
import '../styles/Menu.css'

export default function Menu() {
  const [searchParams] = useSearchParams()
  const [platillos, setPlatillos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [selectedPlatillo, setSelectedPlatillo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alergenosActivos, setAlergenosActivos] = useState([])
  
  const setMesaId = useCartStore((state) => state.setMesaId)
  const mesaId = useCartStore((state) => state.mesaId)
  const fetchInventory = useInventoryStore((state) => state.fetchInventory)
  const initSocket = useInventoryStore((state) => state.initSocket)
  const ingredientesAgotados = useInventoryStore((state) => state.agotados)

  useEffect(() => {
    const mesa = searchParams.get('mesa')
    if (mesa) {
      setMesaId(mesa)
    }
    fetchInventory()
    initSocket()

    return () => {
      useInventoryStore.getState().cleanup()
    }
  }, [searchParams, setMesaId, fetchInventory, initSocket])

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const { data } = await axios.get('/api/menu')
      setPlatillos(data)
      const uniqueCategorias = [...new Set(data.map(p => p.categoria))]
      setCategorias(uniqueCategorias)
      if (uniqueCategorias.length > 0) {
        setCategoriaActiva(uniqueCategorias[0])
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const platillosFiltrados = platillos.filter(p => {
    if (categoriaActiva && p.categoria !== categoriaActiva) return false
    
    if (alergenosActivos.length > 0) {
      const tieneAlergeno = p.alergenos?.some(a => alergenosActivos.includes(a))
      if (tieneAlergeno) return false
    }

    if (p.personalizable && p.opcionesSeleccionables) {
      const tieneOpcionesDisponibles = p.opcionesSeleccionables.some(grupo =>
        grupo.items.some(item => !ingredientesAgotados.has(item.ingredienteId))
      )
      return tieneOpcionesDisponibles
    }

    return true
  })

  if (loading) {
    return <div className="loading">Cargando menú...</div>
  }

  return (
    <div className="menu-container">
      <header className="menu-header">
        <div className="container">
          <h1>🍽️ Nuestro Menú</h1>
          {mesaId && <span className="mesa-badge">📍 {mesaId}</span>}
        </div>
      </header>

      <AllergenFilter
        alergenosActivos={alergenosActivos}
        onChange={setAlergenosActivos}
      />

      <nav className="categorias-nav">
        <div className="container">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`categoria-btn ${categoriaActiva === cat ? 'active' : ''}`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <main className="menu-grid container">
        {platillosFiltrados.map(platillo => (
          <PlatilloCard
            key={platillo._id}
            platillo={platillo}
            onClick={() => setSelectedPlatillo(platillo)}
          />
        ))}
        {platillosFiltrados.length === 0 && (
          <div className="no-results">
            No hay platillos disponibles con los filtros seleccionados
          </div>
        )}
      </main>

      {selectedPlatillo && (
        <PlatilloModal
          platillo={selectedPlatillo}
          onClose={() => setSelectedPlatillo(null)}
        />
      )}

      <Cart />
    </div>
  )
}
