import { prisma } from '../config/prisma'
import { AppError } from '../middleware/error.middleware'

export class TableService {
  static async getAll() {
    return await prisma.mesa.findMany({
      orderBy: { numero: 'asc' }
    })
  }

  static async create(numero: string, nombre?: string, capacidad?: number) {
    const existing = await prisma.mesa.findUnique({ where: { numero } })
    if (existing) throw new AppError('Table number already exists', 400)

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const qrCode = `${baseUrl}/menu?mesa=${encodeURIComponent(numero)}`

    const mesa = await prisma.mesa.create({
      data: { numero, nombre, capacidad, qrCode }
    })
    return mesa
  }

  static async bulkCreate(count: number, prefix: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const mesas = []

    for (let i = 1; i <= count; i++) {
      const numero = `${prefix}_${String(i).padStart(2, '0')}`
      mesas.push({
        numero,
        nombre: numero,
        qrCode: `${baseUrl}/menu?mesa=${encodeURIComponent(numero)}`,
      })
    }

    try {
      const created = await prisma.mesa.createMany({
        data: mesas,
        skipDuplicates: true,
      })
      
      const allCreated = await prisma.mesa.findMany({
        where: {
          numero: { in: mesas.map(m => m.numero) }
        }
      })

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