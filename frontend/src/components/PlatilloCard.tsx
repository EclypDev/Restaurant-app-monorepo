import { IPlatillo } from '@shared'
import '../styles/PlatilloCard.css'

interface PlatilloCardProps {
  platillo: IPlatillo
  onClick: () => void
}

export default function PlatilloCard({ platillo, onClick }: PlatilloCardProps) {
  return (
    <div className="platillo-card" onClick={onClick}>
      {platillo.imagenUrl && (
        <img src={platillo.imagenUrl} alt={platillo.nombre} className="platillo-img" />
      )}
      <div className="platillo-content">
        <h3>{platillo.nombre}</h3>
        <p className="platillo-desc">{platillo.descripcion}</p>
        <div className="platillo-footer">
          <span className="platillo-price">${platillo.precioBase.toLocaleString()}</span>
          {platillo.personalizable && <span className="badge-custom">Personalizable</span>}
        </div>
      </div>
    </div>
  )
}
