import { Ingrediente } from '../models/Ingrediente'
import { AppError } from '../middleware/error.middleware'

export class InventoryService {
  static async getAll(categoria?: unknown, stockDisponible?: unknown) {
    const filter: Record<string, unknown> = {}
    if (categoria) filter.categoria = categoria
    if (stockDisponible !== undefined) filter.stockDisponible = stockDisponible === 'true'
    return Ingrediente.find(filter).sort({ categoria: 1, nombre: 1 })
  }

  static async getById(id: string) {
    const item = await Ingrediente.findById(id)
    if (!item) throw new AppError('Ingredient not found', 404)
    return item
  }

  static async toggleDisponibilidad(id: string, disponible: boolean, io: any) {
    const ingrediente = await Ingrediente.findByIdAndUpdate(
      id,
      { stockDisponible: disponible },
      { new: true }
    )
    if (!ingrediente) throw new AppError('Ingredient not found', 404)

    try {
      const evento = ingrediente.stockDisponible ? 'ingrediente-disponible' : 'ingrediente-agotado'
      io.emit(evento, {
        id: ingrediente._id.toString(),
        nombre: ingrediente.nombre,
        disponible: ingrediente.stockDisponible,
      })
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }

    return ingrediente
  }

  static async bulkUpdate(updates: Array<{ id: string; stockDisponible: boolean }>, io: any) {
    const results: typeof Ingrediente[] = []
    for (const update of updates) {
      const ing = await Ingrediente.findByIdAndUpdate(
        update.id,
        { stockDisponible: update.stockDisponible },
        { new: true }
      )
      if (ing) results.push(ing as any)
    }

    try {
      results.forEach(ing => {
        const evento = (ing as any).stockDisponible ? 'ingrediente-disponible' : 'ingrediente-agotado'
        io.emit(evento, {
          id: (ing as any)._id.toString(),
          nombre: (ing as any).nombre,
          disponible: (ing as any).stockDisponible,
        })
      })
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }

    return results.length
  }

  static async create(data: any) {
    const item = new Ingrediente(data)
    await item.save()
    return item
  }
}