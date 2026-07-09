import { useState, useCallback, useEffect, createContext, useContext } from 'react'

interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  toast: (text: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  let nextId = 0

  const toast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = nextId++
    setMessages(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {messages.map(m => (
          <div key={m.id} className={`toast toast-${m.type}`}>
            {m.type === 'success' && '✅ '}
            {m.type === 'error' && '❌ '}
            {m.type === 'info' && 'ℹ️ '}
            {m.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}