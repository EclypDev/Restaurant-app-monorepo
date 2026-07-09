import { PrismaClient } from '@prisma/client'
import { IOrderRepository } from '../interfaces/IOrderRepository'
import { IOrden } from '../../../../shared/interfaces'

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<IOrden | null> {
    const orden = await this.prisma.orden.findUnique({ where: { id } })
    return orden ? (orden as unknown as IOrden) : null
  }

  async findAll(page: number, limit: number): Promise<{ ordenes: IOrden[], total: number }> {
    const skip = (page - 1) * limit
    const [ordenes, total] = await Promise.all([
      this.prisma.orden.findMany({ skip, take: limit }),
      this.prisma.orden.count()
    ])
    return { ordenes: ordenes as unknown as IOrden[], total }
  }

  async create(data: Omit<IOrden, '_id'>): Promise<IOrden> {
    const orden = await this.prisma.orden.create({ data: data as any })
    return orden as unknown as IOrden
  }

  async update(id: string, data: Partial<IOrden>): Promise<IOrden> {
    const orden = await this.prisma.orden.update({ where: { id }, data: data as any })
    return orden as unknown as IOrden
  }
}
