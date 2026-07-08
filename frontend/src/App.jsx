import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'
import Cocina from './pages/Cocina'
import Admin from './pages/Admin'
import Login from './pages/Login'
import OrderTracking from './pages/OrderTracking'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/menu" element={<Menu />} />
          <Route path="/order/:orderId" element={<OrderTracking />} />
          <Route path="/cocina" element={<Cocina />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Menu />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
