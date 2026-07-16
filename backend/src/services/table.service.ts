import { prisma } from '../config/prisma'
import { AppError } from '../middleware/error.middleware'

export class TableService {
  static async getAll(negocioId?: string) {
    return await prisma.mesa.findMany({
      where: { negocioId: negocioId || 'ce36eb74-8f9a-4256-9519-08fd14e5be28' },
      orderBy: { numero: 'asc' }
    })
  }

  static async create(numero: string, negocioId: string, nombre?: string, capacidad?: number) {
    const existing = await prisma.mesa.findFirst({
      where: { negocioId, numero }
    })
    if (existing) throw new AppError('Table number already exists in this business', 400)

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const mesa = await prisma.mesa.create({
      data: {
        negocioId,
        numero,
        nombre,
        capacidad,
        qrCode: null,
      }
    })

    // Update QR code with the table's UUID
    const qrCode = `${baseUrl}/n/${negocioId}/mesa/${mesa.id}`
    return await prisma.mesa.update({
      where: { id: mesa.id },
      data: { qrCode }
    })
  }

  static async bulkCreate(count: number, prefix: string, negocioId: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const mesas: Array<{ negocioId: string; numero: string; nombre: string; qrCode: string | null }> = []

    for (let i = 1; i <= count; i++) {
      const numero = `${prefix}_${String(i).padStart(2, '0')}`
      mesas.push({
        negocioId,
        numero,
        nombre: numero,
        qrCode: null,
      })
    }

    try {
      const created = await prisma.mesa.createMany({
        data: mesas,
        skipDuplicates: true,
      })

      const allCreated = await prisma.mesa.findMany({
        where: {
          negocioId,
          numero: { in: mesas.map(m => m.numero) }
        }
      })

      // Update QR codes with UUIDs
      for (const m of allCreated) {
        const qrCode = `${baseUrl}/n/${negocioId}/mesa/${m.id}`
        await prisma.mesa.update({
          where: { id: m.id },
          data: { qrCode }
        })
      }

      return { created: created.count, mesas: allCreated }
    } catch (error: any) {
      if (error.code === 'P2002') throw new AppError('Some tables already exist', 409)
      throw error
    }
  }

  static async update(id: string, data: any) {
    try {
      const mesa = await prisma.mesa.update({
        where: { id },
        data
      })
      return mesa
    } catch {
      throw new AppError('Table not found', 404)
    }
  }

  static async delete(id: string) {
    try {
      const mesa = await prisma.mesa.delete({
        where: { id }
      })
      return mesa
    } catch {
      throw new AppError('Table not found', 404)
    }
  }
}
