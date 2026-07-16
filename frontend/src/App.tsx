import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'
import Login from './pages/Login'
import VerificarCorreo from './pages/VerificarCorreo'
import RestablecerPassword from './pages/RestablecerPassword'
import Menu from './pages/Menu'
import Cocina from './pages/Cocina'
import Mesero from './pages/Mesero'
import Admin from './pages/Admin'
import OrderTracking from './pages/OrderTracking'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import { UserRole } from '@shared'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* === RUTAS PÚBLICAS SaaS === */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verificar-correo" element={<VerificarCorreo />} />
                <Route path="/restablecer-password" element={<RestablecerPassword />} />

                {/* === RUTA DEL CLIENTE (Menú QR - Sin Login) === */}
                <Route path="/n/:negocioId/mesa/:mesaId" element={<Menu />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/order/:orderId" element={<OrderTracking />} />

                {/* === RUTAS PROTEGIDAS DEL PERSONAL === */}
                <Route
                  path="/cocina"
                  element={
                    <ProtectedRoute rolesPermitidos={[UserRole.KITCHEN, UserRole.ADMIN]}>
                      <Cocina />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meseros"
                  element={
                    <ProtectedRoute rolesPermitidos={[UserRole.WAITER, UserRole.ADMIN]}>
                      <Mesero />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute rolesPermitidos={[UserRole.ADMIN]}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* === REDIRECCIÓN POR DEFECTO === */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
