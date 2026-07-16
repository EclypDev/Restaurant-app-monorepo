import { prisma } from '../config/prisma'
import { OrderStatus } from '../../../shared/enums'
import { AppError } from '../middleware/error.middleware'
import { printTicket } from './printer'

const PRINTER_ENABLED = process.env.PRINTER_ENABLED === 'true'

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  [OrderStatus.PENDING]: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
  [OrderStatus.IN_PREPARATION]: [OrderStatus.LISTO, OrderStatus.CANCELLED],
  [OrderStatus.LISTO]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.PAGADO],
  [OrderStatus.PAGADO]: [],
  [OrderStatus.CANCELLED]: [],
}

export class OrderService {
  static async createOrder(data: any, io: any) {
    console.log('[OrderService] Iniciando createOrder', { mesaId: data.mesaId });
    const { mesaId, items, totalPagar, usuarioId, usuarioNombre, negocioId } = data

    const totalRecalculado = items.reduce((sum: number, item: any) => {
      if (item.estructuraPlatoFinal?.precioFinalCobrado) {
        return sum + item.estructuraPlatoFinal.precioFinalCobrado * item.cantidad
      }
      return sum + (item.precioUnitario || 0) * item.cantidad
    }, 0)

    if (Math.abs(totalRecalculado - totalPagar) > 1) {
      throw new AppError('Total amount mismatch; order rejected', 400)
    }

    // Generar orderNumber secuencial
    const count = await prisma.orden.count()
    const orderNumber = `#${String(count + 1).padStart(4, '0')}`
    const origen = usuarioId ? 'MESERO_APP' : 'QR_CLIENTE'

    console.log('[OrderService] Llamando a prisma.orden.create');
    const nuevaOrden = await prisma.orden.create({
      data: {
        negocioId: negocioId || 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
        mesaId,
        items: items as any,
        totalPagar: totalRecalculado,
        estado: OrderStatus.PENDING,
        origen,
        orderNumber,
        usuarioId: usuarioId || null,
        usuarioNombre: usuarioNombre || null,
      }
    })
    console.log('[OrderService] Prisma create exitoso, ID:', nuevaOrden.id, 'Order#:', orderNumber);

    // Emitir WebSocket en background
    setImmediate(() => {
      console.log('[OrderService] Intentando emitir WebSocket');
      try {
        io.to('kitchen').emit('nueva-orden-cocina', nuevaOrden)
        console.log('[OrderService] WebSocket emit exitoso');
      } catch (wsError) {
        console.warn('⚠️ WebSocket emit failed:', wsError)
      }
    })

    // Impresión en background
    setImmediate(() => {
      console.log('[OrderService] Intentando imprimir');
      this.handlePrinting(data, nuevaOrden.id).catch(console.warn)
    });

    console.log('[OrderService] createOrder finalizado');
    return nuevaOrden
  }

  private static async handlePrinting(data: any, ordenId: string) {
    if (PRINTER_ENABLED) {
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