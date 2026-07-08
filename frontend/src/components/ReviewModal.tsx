import { useState } from 'react'
import axios from 'axios'
import { ReviewCategory } from '../../shared/enums'
import '../styles/ReviewModal.css'

interface ReviewModalProps {
  mesaId: string
  ordenId?: string
  onClose: () => void
}

export default function ReviewModal({ mesaId, ordenId, onClose }: ReviewModalProps) {
  const [estrellas, setEstrellas] = useState(0)
  const [comentario, setComentario] = useState('')
  const [categoria, setCategoria] = useState<ReviewCategory>(ReviewCategory.SERVICE)
  const [submitted, setSubmitted] = useState(false)
  const [esPositiva, setEsPositiva] = useState(false)

  const handleSubmit = async () => {
    if (!estrellas) return

    try {
      const { data } = await axios.post('/api/resenas', {
        mesaId,
        ordenId,
        estrellas,
        comentario,
        categoria,
      })

      setEsPositiva(data.esPositiva)
      setSubmitted(true)
    } catch {
      console.error('Error submitting review')
    }
  }

  if (submitted) {
    if (esPositiva) {
      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="review-modal review-success" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>✕</button>
            <h2>🎉 ¡Gracias!</h2>
            <p>Nos alegra que hayas tenido una excelente experiencia.</p>
            <p>¿Nos ayudas con una reseña en Google?</p>
            <a
              href="https://g.page/r/TU_RESENA_GOOGLE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-google"
            >
              ⭐ Calificar en Google Maps
            </a>
            <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      )
    }

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="review-modal review-feedback" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>✕</button>
          <h2>💬 Gracias por tu feedback</h2>
          <p>Tu comentario ha sido enviado directamente al equipo de gestión.</p>
          <p>Nos tomamos muy en serio tu experiencia y trabajaremos para mejorar.</p>
          <button className="btn-primary" onClick={onClose}>Entendido</button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>¿Cómo fue tu experiencia?</h2>
        <p className="review-subtitle">Tu opinión nos ayuda a mejorar</p>

        <div className="star-rating">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              className={`star ${num <= estrellas ? 'active' : ''}`}
              onClick={() => setEstrellas(num)}
            >
              ★
            </button>
          ))}
        </div>

        {estrellas > 0 && (
          <>
            <div className="review-categories">
              <label>Categoría:</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value as ReviewCategory)}>
                <option value={ReviewCategory.SERVICE}>Servicio</option>
                <option value={ReviewCategory.FOOD}>Comida</option>
                <option value={ReviewCategory.CLEANLINESS}>Limpieza</option>
                <option value={ReviewCategory.AMBIANCE}>Ambiente</option>
                <option value={ReviewCategory.OTHER}>Otro</option>
              </select>
            </div>

            <textarea
              placeholder="Cuéntanos más sobre tu experiencia..."
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              rows={4}
            />

            <button
              className="btn-primary btn-submit-review"
              onClick={handleSubmit}
            >
              Enviar Reseña
            </button>
          </>
        )}
      </div>
    </div>
  )
}
