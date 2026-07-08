import { create } from 'zustand'
import { IOrderItem } from '../../shared/interfaces'

interface CartState {
  items: IOrderItem[]
  mesaId: string | null
  setMesaId: (mesaId: string) => void
  addItem: (item: IOrderItem) => void
  removeItem: (index: number) => void
  updateCantidad: (index: number, cantidad: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  mesaId: null,

  setMesaId: (mesaId: string) => set({ mesaId }),

  addItem: (item: IOrderItem) => set((state) => {
    const existingIndex = state.items.findIndex(
      (i) => i.platilloId === item.platilloId && JSON.stringify(i.eleccionUsuario) === JSON.stringify(item.eleccionUsuario)
    )

    if (existingIndex >= 0) {
      const newItems = [...state.items]
      newItems[existingIndex].cantidad += item.cantidad
      return { items: newItems }
    }

    return { items: [...state.items, item] }
  }),

  removeItem: (index: number) => set((state) => ({
    items: state.items.filter((_, i) => i !== index)
  })),

  updateCantidad: (index: number, cantidad: number) => set((state) => {
    if (cantidad <= 0) {
      return { items: state.items.filter((_, i) => i !== index) }
    }
    const newItems = [...state.items]
    newItems[index].cantidad = cantidad
    return { items: newItems }
  }),

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    const state = get()
    return state.items.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0)
  },

  getItemCount: () => {
    const state = get()
    return state.items.reduce((sum, item) => sum + item.cantidad, 0)
  },
}))

export default useCartStore
