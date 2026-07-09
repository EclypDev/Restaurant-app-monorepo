import { prisma } from '../config/prisma'
import { OrderStatus } from '../../../shared/enums'
import { AppError } from '../middleware/error.middleware'

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  [OrderStatus.PENDING]: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
  [OrderStatus.IN_PREPARATION]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
}

export class OrderService {
  static async createOrder(data: any, io: any) {
    const { mesaId, items, totalPagar } = data

    const totalRecalculado = items.reduce((sum: number, item: any) => {
      if (item.estructuraPlatoFinal?.precioFinalCobrado) {
        return sum + item.estructuraPlatoFinal.precioFinalCobrado * item.cantidad
      }
      return sum + (item.precioUnitario || 0) * item.cantidad
    }, 0)

    if (Math.abs(totalRecalculado - totalPagar) > 1) {
      throw new AppError('Total amount mismatch; order rejected', 400)
    }

    const nuevaOrden = await prisma.orden.create({
      data: {
        mesaId,
        items: items as any,
        totalPagar: totalRecalculado,
        estado: OrderStatus.PENDING,
      }
    })

    try {
      io.to('kitchen').emit('nueva-orden-cocina', nuevaOrden)
    } catch (wsError) {
      console.warn('⚠️ WebSocket emit failed:', wsError)
    }

    this.handlePrinting(data, nuevaOrden.id).catch(console.warn)

    return nuevaOrden
  }

  private static async handlePrinting(data: any, ordenId: string) {
    if (process.env.PRINTER_ENABLED === 'true') {
      const { printTicket } = await import('../services/printer')
      await printTicket({
        ...data,
        ordenId,
        tipo: 'COMANDA',
      })
    }
  }

  static async updateStatus(id: string, nuevoEstado: OrderStatus, io: any) {
    const orden = await prisma.orden.findUnique({ where: { id } })
    if (!orden) throw new AppError('Order not found', 404)

    const transicionesPermitidas = TRANSICIONES_VALIDAS[orden.estado]
    if (!transicionesPermitidas || !transicionesPermitidas.includes(nuevoEstado)) {
      throw new AppError(`Invalid transition: ${orden.estado} → ${nuevoEstado}`, 400)
    }

    const updateData: any = { estado: nuevoEstado }
    if (nuevoEstado === OrderStatus.DELIVERED) {
      updateData.entregadoAt = new Date()
    }

    const updatedOrden = await prisma.orden.update({
      where: { id },
      data: updateData
    })

    try {
      io.emit('orden-actualizada', updatedOrden)
      io.to(`table-${updatedOrden.mesaId}`).emit('orden-actualizada', updatedOrden)
    } catch (wsError) {
      console.warn('⚠️ WebSocket emit failed:', wsError)
    }
    
    return updatedOrden
  }
}