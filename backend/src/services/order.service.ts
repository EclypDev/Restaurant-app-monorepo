import { Orden } from '../models/Orden'
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

    const nuevaOrden = new Orden({
      mesaId,
      items,
      totalPagar: totalRecalculado,
      estado: OrderStatus.PENDING,
    })

    await nuevaOrden.save()

    try {
      io.to('kitchen').emit('nueva-orden-cocina', nuevaOrden)
    } catch (wsError) {
      console.warn('⚠️ WebSocket emit failed:', wsError)
    }

    this.handlePrinting(data, nuevaOrden._id.toString()).catch(console.warn)

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
    const orden = await Orden.findById(id)
    if (!orden) throw new AppError('Order not found', 404)

    const transicionesPermitidas = TRANSICIONES_VALIDAS[orden.estado]
    if (!transicionesPermitidas || !transicionesPermitidas.includes(nuevoEstado)) {
      throw new AppError(`Invalid transition: ${orden.estado} → ${nuevoEstado}`, 400)
    }

    orden.estado = nuevoEstado
    if (nuevoEstado === OrderStatus.DELIVERED) {
      orden.entregadoAt = new Date()
    }
    await orden.save()

    try {
        io.emit('orden-actualizada', orden)
        io.to(`table-${orden.mesaId}`).emit('orden-actualizada', orden)
    } catch (wsError) {
        console.warn('⚠️ WebSocket emit failed:', wsError)
    }
    
    return orden
  }
}
