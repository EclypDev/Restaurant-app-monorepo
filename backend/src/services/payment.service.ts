import { prisma } from '../config/prisma'
import { AppError } from '../middleware/error.middleware'

export class PaymentService {
  static async solicitarPago(mesaId: string, tipoPago: string, io: any) {
    const ordenActiva = await prisma.orden.findFirst({
      where: {
        mesaId,
        estado: { in: ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO'] },
        pagado: false,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!ordenActiva) {
      throw new AppError('No active order found for this table', 404)
    }

    const solicitudPagoObj = {
      activo: true,
      tipo: tipoPago,
      solicitadoAt: new Date().toISOString(),
    }

    const updatedOrden = await prisma.orden.update({
      where: { id: ordenActiva.id },
      data: {
        solicitudPago: solicitudPagoObj as any
      }
    })

    try {
      io.emit('solicitud-pago', {
        mesaId,
        tipoPago,
        ordenId: updatedOrden.id,
        total: updatedOrden.totalPagar,
      })
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }

    return updatedOrden
  }

  static async llamarMesero(mesaId: string, motivo: string | undefined, io: any) {
    try {
      io.emit('solicitud-mesero', {
        mesaId,
        motivo: motivo || 'Atención general',
        timestamp: new Date().toISOString(),
      })
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }
  }

  static async pagarOrden(id: string, metodoPago: string, io: any) {
    const orden = await prisma.orden.findUnique({ where: { id } })
    if (!orden) throw new AppError('Order not found', 404)

    const currentSolicitud = orden.solicitudPago as any || {}
    const updatedSolicitud = {
      ...currentSolicitud,
      activo: false,
      atendidoAt: new Date().toISOString()
    }

    const updatedOrden = await prisma.orden.update({
      where: { id },
      data: {
        pagado: true,
        solicitudPago: updatedSolicitud as any
      }
    })

    try {
      io.emit('orden-actualizada', updatedOrden)
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }

    return updatedOrden
  }
}