import { Mesa } from '../models/Mesa'
import { AppError } from '../middleware/error.middleware'

export class TableService {
  static async getAll() {
    return Mesa.find().sort({ numero: 1 })
  }

  static async create(numero: string, nombre?: string, capacidad?: number) {
    const existing = await Mesa.findOne({ numero })
    if (existing) throw new AppError('Table number already exists', 400)

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const qrCode = `${baseUrl}/menu?mesa=${encodeURIComponent(numero)}`

    const mesa = new Mesa({ numero, nombre, capacidad, qrCode })
    await mesa.save()
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
      const created = await Mesa.insertMany(mesas, { ordered: false })
      return { created: created.length, mesas: created }
    } catch (error: any) {
      if (error.code === 11000) throw new AppError('Some tables already exist', 409)
      throw error
    }
  }

  static async update(id: string, data: any) {
    const mesa = await Mesa.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    if (!mesa) throw new AppError('Table not found', 404)
    return mesa
  }

  static async delete(id: string) {
    const mesa = await Mesa.findByIdAndDelete(id)
    if (!mesa) throw new AppError('Table not found', 404)
    return mesa
  }
}