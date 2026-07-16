import { useNavigate } from 'react-router-dom'
import '../styles/LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-container">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-icon">🔥</span>
          <span className="logo-text">Galaxy<span className="logo-highlight">Pos</span></span>
        </div>
        <div className="nav-buttons">
          <button className="nav-btn-secondary" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </button>
          <button className="nav-btn-primary" onClick={() => navigate('/register')}>
            Registrar mi Negocio
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">+430 restaurantes en Colombia ya facturan con GalaxyPos</div>
          <h1 className="hero-title">
            Aumenta tus ganancias <span className="hero-highlight">hasta un 30%</span><br />
            en los primeros 30 días
          </h1>
          <p className="hero-subtitle">
            Tus clientes escanean un código QR, piden desde la mesa y pagan sin esperar al mesero. 
            Tú recibes el pedido al instante en cocina, controlas el inventario en tiempo real 
            y facturas más en menos tiempo. Sin apps, sin comisiones, sin dolor de cabeza.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">43%</span>
              <span className="stat-label">más pedidos por mesa</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">12min</span>
              <span className="stat-label">tiempo promedio de servicio</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">97%</span>
              <span className="stat-label">satisfacción al cliente</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => navigate('/register')}>
              Quiero aumentar mis ventas
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate('/login')}>
              Ya tengo cuenta
            </button>
          </div>
          <p className="hero-guarantee">❌ No requiere tarjeta de crédito. Cancelas cuando quieras.</p>
        </div>
        <div className="hero-visual">
          <div className="hero-mockup">
            <div className="mockup-screen">
              <span className="mockup-qr">📱</span>
              <span className="mockup-text">Cliente escanea QR</span>
              <span className="mockup-sub">Pide desde su celular</span>
            </div>
            <div className="mockup-arrow">→</div>
            <div className="mockup-screen">
              <span className="mockup-fire">🔥</span>
              <span className="mockup-text">Cocina recibe al instante</span>
              <span className="mockup-sub">Sin gritos, sin papel</span>
            </div>
            <div className="mockup-arrow">→</div>
            <div className="mockup-screen">
              <span className="mockup-fire">📊</span>
              <span className="mockup-text">Tú ves las métricas</span>
              <span className="mockup-sub">Ganancias en tiempo real</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust-bar">
        <div className="trust-item">
          <span className="trust-icon">🏆</span>
          <span className="trust-text">Premio Mejor SaaS 2025</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">🔒</span>
          <span className="trust-text">Datos seguros en la nube</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">💳</span>
          <span className="trust-text">Sin comisiones por pedido</span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">📞</span>
          <span className="trust-text">Soporte 7/24</span>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="problem-section">
        <h2 className="section-title">¿Por qué tu restaurante está perdiendo dinero?</h2>
        <div className="problem-grid">
          <div className="problem-card problem-bad">
            <span className="problem-icon">❌</span>
            <h3>Meseros olvidan tomar pedidos</h3>
            <p>Clientes esperando 15+ minutos para pedir. Meseros saturados en hora pico.</p>
          </div>
          <div className="problem-card problem-bad">
            <span className="problem-icon">❌</span>
            <h3>Errores en la cocina</h3>
            <p>Notas mal entendidas, platos que regresan, comida desperdiciada.</p>
          </div>
          <div className="problem-card problem-bad">
            <span className="problem-icon">❌</span>
            <h3>Ingredientes agotados</h3>
            <p>Te enteras cuando el cliente pide algo que ya no tienes. Ventas perdidas.</p>
          </div>
          <div className="problem-card problem-good">
            <span className="problem-icon">✅</span>
            <h3>Con GalaxyPos todo fluye</h3>
            <p>QR en la mesa → Cliente pide solo → Cocina recibe digital → Tú facturas más.</p>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="features-section">
        <h2 className="section-title">Todo en un solo panel</h2>
        <div className="features-grid">
          <div className="feature-card feature-accent">
            <span className="feature-icon">📱</span>
            <h3>Menú QR Digital</h3>
            <p>Clientes escanean y piden desde su celular. Sin apps, sin registro, sin esperas. Los meseros se enfocan en servir, no en tomar órdenes.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👨‍🍳</span>
            <h3>Monitor de Cocina Inteligente</h3>
            <p>Los pedidos llegan en tiempo real con semáforo de urgencia. Alertas cuando un plato lleva más de 15 minutos. Cocina organizada, platos perfectos.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Dashboard de Ventas en Vivo</h3>
            <p>Facturación del día, plato más vendido, hora pico, ticket promedio. Todo actualizado al segundo desde cualquier dispositivo.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🗺️</span>
            <h3>Mapa de Calor de Mesas</h3>
            <p>Ves en tiempo real qué mesas están ocupadas, cuáles llevan más tiempo sin pedir y dónde se concentran tus ventas. Optimiza la rotación.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📦</span>
            <h3>Control de Inventario Automático</h3>
            <p>Los ingredientes se descuentan solos con cada pedido. Recibe alertas cuando algo está por agotarse. Nunca más vendas lo que no tienes.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🧑‍🍳</span>
            <h3>Panel del Mesero con Alertas</h3>
            <p>Los meseros reciben notificaciones de solicitudes de pago, atención y cambios en tiempo real. Sin radios, sin gritos, sin carreras.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📈</span>
            <h3>Reportes de Rentabilidad</h3>
            <p>Margen por plato, costo de ingredientes, ganancia neta por mesa. Sabes exactamente qué te deja dinero y qué no.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3>Encuesta de Satisfacción</h3>
            <p>Después del pago, el cliente califica su experiencia. Recibe alertas si algo salió mal y resuélvelo al instante.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <h2 className="section-title">Lo que dicen nuestros clientes</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"Desde que implementamos GalaxyPos, el tiempo de espera de los clientes bajó de 25 minutos a 8. Las ventas subieron un 35% en el primer mes."</p>
            <div className="testimonial-author">
              <strong>Carlos Mendoza</strong>
              <span>Dueño de El Sabor Costeño, Cartagena</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"Lo mejor es el mapa de calor. Ahora sé exactamente qué mesas rentan más y cómo distribuir a mis meseros. Recuperé la inversión en 2 semanas."</p>
            <div className="testimonial-author">
              <strong>María Fernanda López</strong>
              <span>Gerente de La Parilla de María, Medellín</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"El control de inventario me salvó. Antes perdía 2 millones de pesos al mes en ingredientes vencidos. Ahora sé exactamente qué comprar."</p>
            <div className="testimonial-author">
              <strong>Andrés Restrepo</strong>
              <span>Chef ejecutivo, Fuego Latino, Cali</span>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="plans-section">
        <h2 className="section-title">Planes para tu negocio</h2>
        <p className="plans-subtitle">Todos los planes incluyen 7 días de prueba gratuita. Sin tarjeta de crédito.</p>
        <div className="plans-grid">
          <div className="plan-card plan-basic">
            <h3>Básico</h3>
            <p className="plan-price">$50,000<small>/mes</small></p>
            <p className="plan-description">Para restaurantes pequeños que quieren empezar su transformación digital.</p>
            <ul>
              <li>1 negocio</li>
              <li>Hasta 10 mesas</li>
              <li>Menú QR ilimitado</li>
              <li>Monitor de cocina en tiempo real</li>
              <li>Dashboard de ventas básico</li>
              <li>Soporte por correo</li>
            </ul>
            <button className="plan-btn" onClick={() => navigate('/register')}>Comenzar Prueba</button>
          </div>
          <div className="plan-card plan-pro">
            <div className="plan-badge">RECOMENDADO</div>
            <h3>Pro</h3>
            <p className="plan-price">$120,000<small>/mes</small></p>
            <p className="plan-description">La opción más elegida. Todo lo que necesitas para escalar tu operación.</p>
            <ul>
              <li>1 negocio</li>
              <li>Mesas ilimitadas</li>
              <li>Menú QR con fotos y categorías</li>
              <li>Monitor de cocina con semáforo</li>
              <li>🗺️ Mapa de calor de rotación de mesas</li>
              <li>📊 Dashboard de rentabilidad por plato</li>
              <li>📦 Control de inventario automático</li>
              <li>🧑‍🍳 Panel del mesero con notificaciones</li>
              <li>⭐ Encuestas de satisfacción</li>
              <li>Soporte prioritario 7/24</li>
            </ul>
            <button className="plan-btn plan-btn-pro" onClick={() => navigate('/register')}>Comenzar Prueba</button>
          </div>
          <div className="plan-card plan-enterprise">
            <h3>Empresarial</h3>
            <p className="plan-price">$250,000<small>/mes</small></p>
            <p className="plan-description">Para grupos de restaurantes que necesitan control total y métricas avanzadas.</p>
            <ul>
              <li>Múltiples negocios (sucursales)</li>
              <li>Mesas ilimitadas por sucursal</li>
              <li>Todo lo de Pro para cada sucursal</li>
              <li>📈 Reportes consolidados globales</li>
              <li>🗺️ Mapa de calor por sucursal</li>
              <li>🔗 API personalizada para integraciones</li>
              <li>📋 Onboarding y capacitación dedicada</li>
              <li>🏷️ Precios personalizados por volumen</li>
              <li>📞 Gerente de cuenta asignado</li>
              <li>✅ SLA 99.9% de disponibilidad</li>
            </ul>
            <button className="plan-btn" onClick={() => navigate('/register')}>Contactar</button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <h2>¿Listo para transformar tu restaurante?</h2>
        <p>Únete a +430 restaurantes en Colombia que ya facturan más con GalaxyPos.</p>
        <div className="cta-stats">
          <div className="cta-stat">
            <span className="cta-number">+2.3M</span>
            <span className="cta-label">pedidos procesados</span>
          </div>
          <div className="cta-stat">
            <span className="cta-number">4.9★</span>
            <span className="cta-label">calificación promedio</span>
          </div>
          <div className="cta-stat">
            <span className="cta-number">98%</span>
            <span className="cta-label">retención de clientes</span>
          </div>
        </div>
        <button className="cta-btn" onClick={() => navigate('/register')}>
          Prueba Gratis por 7 Días
        </button>
        <p className="cta-note">No requerimos tarjeta de crédito. Cancela cuando quieras.</p>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>© 2026 GalaxyPos. Todos los derechos reservados.</p>
        <p className="footer-tagline">Hecho con 🔥 para restaurantes de Colombia y Latinoamérica</p>
      </footer>
    </div>
  )
}
