import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { UserRole } from '@shared'

interface User {
  id: string
  nombre: string
  email: string
  rol: UserRole
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      autoLogin()
    }
  }, [token])

  const autoLogin = async () => {
    // Si ya hay un token en localStorage (de un login real), intentar usarlo
    const existingToken = localStorage.getItem('token')
    if (existingToken) {
      setToken(existingToken)
      return
    }

    // Modo desarrollo: usamos token especial bypass
    localStorage.setItem('token', 'dev-bypass-token')
    setToken('dev-bypass-token')
    
    // Simular usuario
    setUser({ id: 'dev-bypass-id', nombre: 'Hector (Dev)', email: 'hectoraderfer123421@gmail.com', rol: UserRole.ADMIN })
    setLoading(false)
  }

  const fetchUser = async () => {
    try {
      const { data } = await axios.get<User>('/api/auth/me')
      setUser(data)
    } catch (err: any) {
      // Solo cerrar sesión si el backend responde con 401 (token inválido)
      if (err?.response?.status === 401) {
        logout()
      }
      // Si el backend está caído (reload), mantener sesión actual
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await axios.post<{ token: string; user: User }>('/api/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
