import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],
  mesaId: null,

  setMesaId: (mesaId) => set({ mesaId }),

  addItem: (item) => set((state) => {
    const existingIndex = state.items.findIndex(
      (i) => i.platilloId === item.platilloId && JSON.stringify(i.eleccionUsuario) === JSON.stringify(item.eleccionUsuario)
    )

    if (existingIndex >= 0) {
      const newItems = [...state.items]
      newItems[existingIndex].cantidad += item.cantidad
      return { items: newItems }
    }

    return { items: [...state.items, item] })
  }),

  removeItem: (index) => set((state) => ({
    items: state.items.filter((_, i) => i !== index)
  })),

  updateCantidad: (index, cantidad) => set((state) => {
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
