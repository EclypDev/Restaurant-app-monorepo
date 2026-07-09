import { Orden } from '../models/Orden'
import { AppError } from '../middleware/error.middleware'

export class PaymentService {
  static async solicitarPago(mesaId: string, tipoPago: string, io: any) {
    const ordenActiva = await Orden.findOne({
      mesaId,
      estado: { $in: ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO'] },
      pagado: false,
    }).sort({ createdAt: -1 })

    if (!ordenActiva) {
      throw new AppError('No active order found for this table', 404)
    }

    ordenActiva.solicitudPago = {
      activo: true,
      tipo: tipoPago as any,
      solicitadoAt: new Date(),
    }
    await ordenActiva.save()

    try {
      io.emit('solicitud-pago', {
        mesaId,
        tipoPago,
        ordenId: ordenActiva._id.toString(),
        total: ordenActiva.totalPagar,
      })
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }

    return ordenActiva
  }

  static async llamarMesero(mesaId: string, motivo: string | undefined, io: any) {
    try {
      io.emit('solicitud-mesero', {
        mesaId,
        motivo: motivo || 'Atención general',
        timestamp: new Date(),
      })
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }
  }

  static async pagarOrden(id: string, metodoPago: string, io: any) {
    const orden = await Orden.findByIdAndUpdate(
      id,
      {
        pagado: true,
        pagadoAt: new Date(),
        metodoPago: metodoPago as any,
        'solicitudPago.activo': false,
        'solicitudPago.atendidoAt': new Date(),
      },
      { new: true }
    )

    if (!orden) throw new AppError('Order not found', 404)

    try {
      io.emit('orden-actualizada', orden)
    } catch {
      console.warn('⚠️ WebSocket emit failed')
    }

    return orden
  }
}