import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import useCartStore from '../store/cartStore'

type Negocio = {
  id: string
  nombre: string
  slug: string
}

export default function NegocioSwitcher({ onSwitch }: { onSwitch?: () => void }) {
  const { user } = useAuth()
  const setNegocioId = useCartStore((state) => state.setNegocioId)
  const [negocios, setNegocios] = useState<Negocio[]>([])
  const [current, setCurrent] = useState('')

  useEffect(() => {
    // Cargar lista de negocios disponibles
    axios.get<Negocio[]>('/api/negocios')
      .then(({ data }) => {
        setNegocios(data)
        // Auto-detectar el negocio actual desde el header
        const currentId = axios.defaults.headers.common['x-negocio-id'] as string || ''
        setCurrent(currentId || data[0]?.id || '')
      })
      .catch(() => {})
  }, [])

  const handleChange = (negocioId: string) => {
    setCurrent(negocioId)
    setNegocioId(negocioId)
    if (onSwitch) onSwitch()
  }

  if (!user) return null

  return (
    <select
      value={current}
      onChange={e => handleChange(e.target.value)}
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#f1f3f5',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {negocios.map(n => (
        <option key={n.id} value={n.id} style={{ background: '#111827', color: '#f1f3f5' }}>
          🏪 {n.nombre}
        </option>
      ))}
    </select>
  )
}
