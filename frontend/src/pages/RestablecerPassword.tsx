import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/Auth.css'

export default function RestablecerPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado. Verifica el enlace de recuperación.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (nuevaPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/auth/restablecer-password', { token, nuevaPassword }, { timeout: 10000 })
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al restablecer la contraseña. El token puede haber expirado.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-error">Token no proporcionado. Verifica el enlace de recuperación.</div>
          <div className="auth-footer">
            <Link to="/login">Volver a Iniciar Sesión</Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-success">
            <span className="success-icon">✅</span>
            <h2>Contraseña Actualizada</h2>
            <p>Tu contraseña se ha restablecido exitosamente.</p>
            <button className="auth-btn" onClick={() => navigate('/login')} style={{ marginTop: '20px' }}>
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Restablecer Contraseña</h2>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              value={nuevaPassword}
              onChange={e => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Volver a Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  )
}
