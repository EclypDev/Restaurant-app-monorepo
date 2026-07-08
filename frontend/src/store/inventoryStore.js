import { create } from 'zustand'
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000')

const useInventoryStore = create((set) => ({
  ingredientes: [],
  agotados: new Set(),
  loading: true,

  fetchInventory: async () => {
    try {
      const response = await fetch('/api/inventario')
      const data = await response.json()
      const agotados = new Set(
        data.filter(i => !i.disponible).map(i => i._id)
      )
      set({ ingredientes: data, agotados, loading: false })
    } catch (error) {
      console.error('Error fetching inventory:', error)
      set({ loading: false })
    }
  },

  initSocket: () => {
    socket.on('ingrediente-agotado', (data) => {
      set((state) => {
        const newAgotados = new Set(state.agotados)
        newAgotados.add(data.id)
        return { agotados: newAgotados }
      })
    })

    socket.on('ingrediente-disponible', (data) => {
      set((state) => {
        const newAgotados = new Set(state.agotados)
        newAgotados.delete(data.id)
        return { agotados: newAgotados }
      })
    })
  },

  cleanup: () => {
    socket.off('ingrediente-agotado')
    socket.off('ingrediente-disponible')
  },
}))

export default useInventoryStore
