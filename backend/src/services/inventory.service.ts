import { prisma } from '../config/prisma'
import { AppError } from '../middleware/error.middleware'

export class InventoryService {
  static async getAll(categoria?: unknown, stockDisponible?: unknown) {
    const where: any = {}
    if (categoria) where.categoria = categoria as string
    if (stockDisponible !== undefined) where.stockDisponible = stockDisponible === 'true'

    return await prisma.ingrediente.findMany({
      where,
      orderBy: [
        { categoria: 'asc' },
        { nombre: 'asc' }
      ]
    })
  }

  static async getById(id: string) {
    const item = await prisma.ingrediente.findUnique({ where: { id } })
    if (!item) throw new AppError('Ingredient not found', 404)
    return item
  }

  static async toggleDisponibilidad(id: string, disponible: boolean, io: any) {
    const ingrediente = await prisma.ingrediente.update({
      where: { id },
      data: { stockDisponible: disponible }
    })
    if (!ingrediente) throw new AppError('Ingredient not found', 404)

    try {
      const evento = ingrediente.stockDisponible ? 'ingrediente-disponible' : 'ingrediente-agotado'
      io.emit(evento, {
        id: ingrediente.id,
        nombre: ingrediente.nombre,
        disponible: ingrediente.stockDisponible,
      })
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }

    return ingrediente
  }

  static async bulkUpdate(updates: Array<{ id: string; stockDisponible: boolean }>, io: any) {
    const results: any[] = []
    const settled = await Promise.allSettled(
      updates.map(update =>
        prisma.ingrediente.update({
          where: { id: update.id },
          data: { stockDisponible: update.stockDisponible }
        })
      )
    )
    settled.forEach(r => { if (r.status === 'fulfilled') results.push(r.value) })

    try {
      results.forEach(ing => {
        const evento = ing.stockDisponible ? 'ingrediente-disponible' : 'ingrediente-agotado'
        io.emit(evento, {
          id: ing.id,
          nombre: ing.nombre,
          disponible: ing.stockDisponible,
        })
      })
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }

    return results.length
  }

  static async create(data: any) {
    return await prisma.ingrediente.create({ data })
  }
}