import { Resena } from '../models/Resena'
import { AppError } from '../middleware/error.middleware'

export class ReviewService {
  static async create(data: {
    mesaId: string
    ordenId?: string
    estrellas: number
    comentario?: string
    categoria?: string
  }, io: any) {
    const resena = new Resena({
      ...data,
      esPublica: data.estrellas >= 4,
    })
    await resena.save()

    if (data.estrellas <= 2) {
      try {
        io.emit('resena-nueva', {
          mesaId: data.mesaId,
          estrellas: data.estrellas,
          comentario: data.comentario,
          alerta: true,
        })
      } catch {
        console.warn('⚠️ WebSocket emit failed')
      }
    }

    return resena
  }

  static async getAll(estrellas?: unknown, resuelto?: unknown) {
    const filter: Record<string, unknown> = {}
    if (estrellas) filter.estrellas = Number(estrellas)
    if (resuelto !== undefined) filter.resuelto = resuelto === 'true'
    return Resena.find(filter).sort({ createdAt: -1 }).limit(100)
  }

  static async resolve(id: string, respuestaAdmin?: string) {
    const resena = await Resena.findByIdAndUpdate(
      id,
      { resuelto: true, respuestaAdmin },
      { new: true }
    )
    if (!resena) throw new AppError('Review not found', 404)
    return resena
  }

  static async getStats() {
    const stats = await Resena.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          promedio: { $avg: '$estrellas' },
          positivas: { $sum: { $cond: [{ $gte: ['$estrellas', 4] }, 1, 0] } },
          negativas: { $sum: { $cond: [{ $lte: ['$estrellas', 2] }, 1, 0] } },
        },
      },
    ])
    return stats[0] || { total: 0, promedio: 0, positivas: 0, negativas: 0 }
  }
}