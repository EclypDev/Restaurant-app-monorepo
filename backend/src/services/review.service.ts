import { prisma } from '../config/prisma'
import { AppError } from '../middleware/error.middleware'

export class ReviewService {
  static async create(data: {
    mesaId: string
    ordenId?: string
    estrellas: number
    comentario?: string
    categoria?: string
    negocioId?: string
  }, io: any) {
    const resena = await prisma.resena.create({
      data: {
        ...data,
        negocioId: data.negocioId || 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
        esPublica: data.estrellas >= 4,
      }
    })

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
    const where: any = {}
    if (estrellas) where.estrellas = Number(estrellas)
    if (resuelto !== undefined) where.resuelto = resuelto === 'true'

    return await prisma.resena.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    })
  }

  static async resolve(id: string, respuestaAdmin?: string) {
    try {
      const resena = await prisma.resena.update({
        where: { id },
        data: {
          resuelto: true,
          respuestaAdmin
        }
      })
      return resena
    } catch {
      throw new AppError('Review not found', 404)
    }
  }

  static async getStats() {
    const [total, aggregate, positivas, negativas] = await Promise.all([
      prisma.resena.count(),
      prisma.resena.aggregate({
        _avg: { estrellas: true }
      }),
      prisma.resena.count({ where: { estrellas: { gte: 4 } } }),
      prisma.resena.count({ where: { estrellas: { lte: 2 } } })
    ])

    return {
      total,
      promedio: aggregate._avg.estrellas || 0,
      positivas,
      negativas
    }
  }
}