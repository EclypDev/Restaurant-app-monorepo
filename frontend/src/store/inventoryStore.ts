import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { IIngredienteUpdateEvent, IIngrediente } from '@shared/interfaces'

interface InventoryState {
  ingredientes: IIngrediente[]
  agotados: Set<string>
  loading: boolean
  socket: Socket | null
  fetchInventory: () => Promise<void>
  initSocket: () => void
  cleanup: () => void
}

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000')

const useInventoryStore = create<InventoryState>((set) => ({
  ingredientes: [],
  agotados: new Set(),
  loading: true,
  socket,

  fetchInventory: async () => {
    try {
      const response = await fetch('/api/inventario')
      const data = await response.json()
      const agotados = new Set(
        data.filter((i: any) => !i.stockDisponible).map((i: any) => i._id)
      )
      set({ ingredientes: data, agotados, loading: false })
    } catch (error) {
      console.error('Error fetching inventory:', error)
      set({ loading: false })
    }
  },

  initSocket: () => {
    socket.on('ingrediente-agotado', (data: IIngredienteUpdateEvent) => {
      set((state) => {
        const newAgotados = new Set(state.agotados)
        newAgotados.add(data.id)
        return { agotados: newAgotados }
      })
    })

    socket.on('ingrediente-disponible', (data: IIngredienteUpdateEvent) => {
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
