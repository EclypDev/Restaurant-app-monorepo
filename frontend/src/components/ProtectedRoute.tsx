import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserRole } from '@shared'

interface ProtectedRouteProps {
  children: React.ReactNode
  rolesPermitidos?: UserRole[]
}

export default function ProtectedRoute({ children, rolesPermitidos }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
