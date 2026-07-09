import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import useCartStore from '../store/cartStore'
import useInventoryStore from '../store/inventoryStore'
import { IPlatillo, IMesa } from '@shared'
import Cart from '../components/Cart'
import PlatilloModal from '../components/PlatilloModal'
import '../styles/Menu.css'

interface MockCategory {
  id: string
  nombre: string
  imageUrl: string
}

const CATEGORIES: MockCategory[] = [
  { id: 'c1', nombre: 'Ajiaco', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=120&auto=format&fit=crop&q=80' },
  { id: 'c2', nombre: 'Potato', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=120&auto=format&fit=crop&q=80' },
  { id: 'c3', nombre: 'Arepa', imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=120&auto=format&fit=crop&q=80' },
  { id: 'c4', nombre: 'Corn', imageUrl: 'https://images.unsplash.com/photo-1551754625-e020980ca774?w=120&auto=format&fit=crop&q=80' },
  { id: 'c5', nombre: 'Prorcanta', imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=120&auto=format&fit=crop&q=80' },
  { id: 'c6', nombre: 'Morcilla', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=120&auto=format&fit=crop&q=80' },
  { id: 'c7', nombre: 'Klenszo', imageUrl: 'https://images.unsplash.com/photo-1564093490129-74f10449f265?w=120&auto=format&fit=crop&q=80' },
  { id: 'c8', nombre: 'Hononrida', imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=120&auto=format&fit=crop&q=80' },
  { id: 'c9', nombre: 'Cantarcera', imageUrl: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=120&auto=format&fit=crop&q=80' },
  { id: 'c10', nombre: 'Hienvenito', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80' }
]

const PREMIUM_PRODUCTS: IPlatillo[] = [
  {
    _id: 'paisa-01',
    nombre: 'Bandeja Paisa FuegoRojo',
    descripcion: 'A grand feast with chicharrón, carne molida, fried egg, beans, arepa, plantain, and avocado.',
    precioBase: 38000,
    imagenUrl: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
    categoria: 'Platos Fuertes',
    disponible: true,
    personalizable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'posta-02',
    nombre: 'Posta Negra Cartagenera',
    descripcion: 'Slow-cooked beef in a dark, rich sauce with rice and plantains.',
    precioBase: 34000,
    imagenUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    categoria: 'Platos Fuertes',
    disponible: true,
    personalizable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'sancocho-03',
    nombre: 'Sancocho Vallecaucano',
    descripcion: 'A hearty chicken and vegetable soup in a traditional pot.',
    precioBase: 30000,
    imagenUrl: 'https://images.unsplash.com/photo-1608500218890-c5f31df14ee1?w=600&auto=format&fit=crop&q=80',
    categoria: 'Sopas',
    disponible: true,
    personalizable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'arepa-04',
    nombre: 'Arepa Rellena Especial',
    descripcion: 'A thick, cheesy corn arepa stuffed with shredded beef.',
    precioBase: 18000,
    imagenUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
    categoria: 'Entradas',
    disponible: true,
    personalizable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

interface InteractiveMesa {
  id: string
  numero: string
  estado: 'OCUPADA' | 'DISPONIBLE'
}

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedPlatillo, setSelectedPlatillo] = useState<IPlatillo | null>(null)
  
  const setMesaId = useCartStore((state) => state.setMesaId)
  const mesaId = useCartStore((state) => state.mesaId)
  const fetchInventory = useInventoryStore((state) => state.fetchInventory)
  const initSocket = useInventoryStore((state) => state.initSocket)

  const defaultMesa = searchParams.get('mesa') || 'Mesa 2'

  const [mesasStatus, setMesasStatus] = useState<InteractiveMesa[]>([
    { id: 'm1', numero: 'Mesa 1', estado: 'OCUPADA' },
    { id: 'm2', numero: 'Mesa 2', estado: 'DISPONIBLE' },
    { id: 'm3', numero: 'Mesa 3', estado: 'OCUPADA' },
    { id: 'm4', numero: 'Mesa 4', estado: 'DISPONIBLE' },
    { id: 'm5', numero: 'Mesa 5', estado: 'OCUPADA' }
  ])

  useEffect(() => {
    if (defaultMesa) {
      setMesaId(defaultMesa)
    }
    fetchInventory()
    initSocket()

    return () => {
      useInventoryStore.getState().cleanup()
    }
  }, [defaultMesa, setMesaId, fetchInventory, initSocket])

  const currentSelectedMesa = useMemo(() => {
    return mesasStatus.find(m => m.numero === mesaId) || mesasStatus[1]
  }, [mesaId, mesasStatus])

  const selectMesa = (mesa: InteractiveMesa) => {
    if (mesa.estado === 'OCUPADA') {
      return // Can block selection or show feedback if clicked an occupied table
    }
    setMesaId(mesa.numero)
    setSearchParams({ mesa: mesa.numero })
  }

  return (
    <div className="menu-container dark-premium-theme">
      {/* 1. Header with orange top bar */}
      <header className="menu-header-premium">
        <div className="container header-flex">
          <div className="logo-group">
            <img 
              src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=50&auto=format&fit=crop&q=80" 
              alt="Plato y Cubiertos" 
              className="header-icon-image"
            />
            <h1>Nuestro Menú</h1>
          </div>
        </div>
      </header>

      <main className="menu-main-content container">
        {/* Left main column: Categories Carousel, Banner, Products Grid */}
        <div className="menu-left-column">
          
          {/* Nuestros Sabores Heading */}
          <div className="section-title-premium-wrapper">
            <h2 className="script-title">Nuestros Sabores</h2>
          </div>

          {/* 2. Category carousel with circles and terracotta leather border */}
          <div className="categories-carousel-premium">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="category-carousel-item">
                <div 
                  className="category-circle-premium" 
                  style={{ backgroundImage: `url(${cat.imageUrl})` }}
                />
                <span className="category-circle-label">{cat.nombre}</span>
              </div>
            ))}
          </div>

          {/* 3. Centralized fine-border FuegoRojo Welcome Banner */}
          <div className="welcome-banner-premium">
            <h3 className="banner-title-glow">FuegoRojo</h3>
            <p className="banner-subtitle">
              ¡Bienvenido a FuegoRojo! El auténtico sabor de nuestra tierra colombiana directamente a tu mesa. Disfruta de un 10% de descuento en tu primer pedido online.
            </p>
          </div>

          {/* 4. Products grid with exact 4 plates */}
          <div className="products-grid-premium">
            {PREMIUM_PRODUCTS.map(platillo => (
              <div key={platillo._id} className="product-card-premium">
                <div 
                  className="product-card-image" 
                  style={{ backgroundImage: `url(${platillo.imagenUrl})` }}
                />
                <div className="product-card-body">
                  <h4 className="product-card-title">{platillo.nombre}</h4>
                  <p className="product-card-description">{platillo.descripcion}</p>
                  <div className="product-card-footer">
                    <span className="product-card-price">${platillo.precioBase.toLocaleString()} COP</span>
                    <button 
                      className="btn-order-premium"
                      onClick={() => setSelectedPlatillo(platillo)}
                    >
                      Pedir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right column: Interactive Isometric Map of Tables */}
        <aside className="menu-right-column">
          <div className="isometric-map-wrapper">
            <h3 className="sidebar-section-title">Distribución del Restaurante</h3>
            
            {/* Perspective Isometric Map Canvas */}
            <div className="isometric-canvas">
              <div className="isometric-floor">
                {/* Isometric Table 5 (Ocupada, Top Left) */}
                <div 
                  className={`isometric-table-element table-5-pos status-ocupada`}
                  onClick={() => selectMesa(mesasStatus[4])}
                >
                  <span className="table-number-label">5</span>
                  <span className="table-badge-map status-red">OCUPADA</span>
                </div>

                {/* Isometric Table 1 (Ocupada, Center Left) */}
                <div 
                  className={`isometric-table-element table-1-pos status-ocupada`}
                  onClick={() => selectMesa(mesasStatus[0])}
                >
                  <span className="table-number-label">1</span>
                  <span className="table-badge-map status-red">OCUPADA</span>
                </div>

                {/* Isometric Table 3 (Ocupada, Top Right) */}
                <div 
                  className={`isometric-table-element table-3-pos status-ocupada`}
                  onClick={() => selectMesa(mesasStatus[2])}
                >
                  <span className="table-number-label">3</span>
                  <span className="table-badge-map status-red">OCUPADA</span>
                </div>

                {/* Isometric Table 4 (Disponible, Center Right) */}
                <div 
                  className={`isometric-table-element table-4-pos ${mesaId === 'Mesa 4' ? 'active-selection' : ''}`}
                  onClick={() => selectMesa(mesasStatus[3])}
                >
                  <span className="table-number-label">4</span>
                  <span className="table-badge-map status-green">DISPONIBLE</span>
                </div>

                {/* Isometric Table 2 (Disponible, Bottom Center) */}
                <div 
                  className={`isometric-table-element table-2-pos ${mesaId === 'Mesa 2' ? 'active-selection' : ''}`}
                  onClick={() => selectMesa(mesasStatus[1])}
                >
                  <span className="table-number-label">2</span>
                  <span className="table-badge-map status-green">DISPONIBLE</span>
                </div>
              </div>
            </div>

            {/* Dynamic Status Display Below Map */}
            <div className="selected-table-status-box">
              <p className={`table-status-message ${currentSelectedMesa.estado === 'OCUPADA' ? 'text-red' : 'text-green'}`}>
                {currentSelectedMesa.numero} - {currentSelectedMesa.estado === 'OCUPADA' ? 'Mesa Ocupada' : 'Disponible para ti'}
              </p>
            </div>
          </div>
        </aside>
      </main>

      {selectedPlatillo && (
        <PlatilloModal
          platillo={selectedPlatillo}
          onClose={() => setSelectedPlatillo(null)}
        />
      )}

      {/* Floating cart bar is rendered from Cart component */}
      <Cart />
    </div>
  )
}
