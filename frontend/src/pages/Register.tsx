import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    negocioNombre: '',
    slug: '',
    adminNombre: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'negocioNombre'
        ? {
            slug: value
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, ''),
          }
        : {}),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.post('/api/auth/registro-saas', form, { timeout: 15000 })
      setSuccess(true)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Error al registrar. Verifica tu conexión e intenta de nuevo.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-success">
            <span className="success-icon">✅</span>
            <h2>Registro Exitoso</h2>
            <p>
              Hemos enviado un correo de verificación a <strong>{form.email}</strong>.
            </p>
            <p>Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.</p>
            <p className="auth-dev-note" style={{ fontSize: '0.8rem', color: '#8892a0', marginTop: '16px' }}>
              💡 Modo desarrollo: Revisa la terminal del backend para ver el token de verificación.
            </p>
            <button className="auth-btn" onClick={() => navigate('/login')}>
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
          <h2>Registrar mi Negocio</h2>
          <p>Únete a GalaxyPos y digitaliza tu restaurante</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nombre del Negocio</label>
            <input
              type="text"
              name="negocioNombre"
              value={form.negocioNombre}
              onChange={handleChange}
              placeholder="Ej: La Esquina del Sabor"
              required
            />
          </div>

          <div className="form-group">
            <label>Identificador (slug)</label>
            <div className="slug-input">
              <span className="slug-prefix">galaxypos.com/n/</span>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="la-esquina-del-sabor"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tu Nombre</label>
            <input
              type="text"
              name="adminNombre"
              value={form.adminNombre}
              onChange={handleChange}
              placeholder="Nombre del administrador"
              required
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@turestaurante.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Negocio'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  )
}
