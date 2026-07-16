import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/Auth.css'

export default function VerificarCorreo() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verificando' | 'exitoso' | 'error'>('verificando')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Token no proporcionado')
      return
    }

    axios.get(`/api/auth/verificar-correo?token=${token}`, { timeout: 10000 })
      .then(() => {
        setStatus('exitoso')
        setMessage('Correo verificado exitosamente. Ya puedes iniciar sesión.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err?.response?.data?.message || 'Error al verificar el correo. El token puede haber expirado.')
      })
  }, [searchParams])

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-success">
          {status === 'verificando' && (
            <>
              <span className="success-icon" style={{ fontSize: '2rem' }}>⏳</span>
              <h2>Verificando...</h2>
              <p>Estamos verificando tu correo electrónico.</p>
            </>
          )}
          {status === 'exitoso' && (
            <>
              <span className="success-icon">✅</span>
              <h2>Correo Verificado</h2>
              <p>{message}</p>
              <button className="auth-btn" onClick={() => navigate('/login')} style={{ marginTop: '20px' }}>
                Ir a Iniciar Sesión
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <span className="success-icon" style={{ fontSize: '2rem' }}>❌</span>
              <h2>Error de Verificación</h2>
              <p>{message}</p>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button className="auth-btn" onClick={() => navigate('/login')}>
                  Ir a Iniciar Sesión
                </button>
                <Link to="/login" style={{ textAlign: 'center', color: '#ff6b35', fontSize: '0.9rem' }}>
                  Solicitar nuevo correo de verificación
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
