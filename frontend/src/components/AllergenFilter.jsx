import { ALERGENOS } from '../../../shared/index.js'
import '../styles/AllergenFilter.css'

const ALERGENO_ICONS = {
  gluten: '🌾',
  lactosa: '🥛',
  huevos: '🥚',
  frutos_secos: '🥜',
  soja: '🫘',
  mariscos: '🦐',
  pescado: '🐟',
  mostaza: '🟡',
  sesamo: '⚫',
  sulfitos: '🍷',
}

export default function AllergenFilter({ alergenosActivos, onChange }) {
  const toggleAlergeno = (alergeno) => {
    if (alergenosActivos.includes(alergeno)) {
      onChange(alergenosActivos.filter(a => a !== alergeno))
    } else {
      onChange([...alergenosActivos, alergeno])
    }
  }

  return (
    <div className="allergen-filter">
      <div className="container">
        <div className="allergen-header">
          <span>🚫 Filtros de Alérgenos</span>
          {alergenosActivos.length > 0 && (
            <button className="clear-filters" onClick={() => onChange([])}>
              Limpiar
            </button>
          )}
        </div>
        <div className="allergen-tags">
          {ALERGENOS.map(alergeno => (
            <button
              key={alergeno}
              className={`allergen-tag ${alergenosActivos.includes(alergeno) ? 'active' : ''}`}
              onClick={() => toggleAlergeno(alergeno)}
            >
              {ALERGENO_ICONS[alergeno]} {alergeno.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
