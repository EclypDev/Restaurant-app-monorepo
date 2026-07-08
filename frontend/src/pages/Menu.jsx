import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import useCartStore from '../store/cartStore'
import Cart from '../components/Cart'
import PlatilloCard from '../components/PlatilloCard'
import PlatilloModal from '../components/PlatilloModal'
import '../styles/Menu.css'

export default function Menu() {
  const [searchParams] = useSearchParams()
  const [platillos, setPlatillos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [selectedPlatillo, setSelectedPlatillo] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const setMesaId = useCartStore((state) => state.setMesaId)
  const mesaId = useCartStore((state) => state.mesaId)

  useEffect(() => {
    const mesa = searchParams.get('mesa')
    if (mesa) {
      setMesaId(mesa)
    }
  }, [searchParams, setMesaId])

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

  const platillosFiltrados = categoriaActiva
    ? platillos.filter(p => p.categoria === categoriaActiva)
    : platillos

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
