import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'
import PlateCreator from './pages/PlateCreator'
import Cocina from './pages/Cocina'
import Mesero from './pages/Mesero'
import Admin from './pages/Admin'
import Login from './pages/Login'
import OrderTracking from './pages/OrderTracking'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/menu" element={<Menu />} />
                <Route path="/crear-plato" element={<PlateCreator />} />
                <Route path="/order/:orderId" element={<OrderTracking />} />
                <Route path="/cocina" element={<Cocina />} />
                <Route path="/meseros" element={<Mesero />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Menu />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
