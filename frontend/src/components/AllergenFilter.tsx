import { ALERGENOS, Alergeno } from '@shared'
import '../styles/AllergenFilter.css'

const ALERGENO_ICONS: Record<Alergeno, string> = {
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

interface AllergenFilterProps {
  alergenosActivos: Alergeno[]
  onChange: (alergenos: Alergeno[]) => void
}

export default function AllergenFilter({ alergenosActivos, onChange }: AllergenFilterProps) {
  const toggleAlergeno = (alergeno: Alergeno) => {
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
