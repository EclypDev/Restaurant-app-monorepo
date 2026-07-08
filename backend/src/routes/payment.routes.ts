import { Router, Request, Response } from 'express'
import { Orden } from '../models/Orden'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { PaymentMethod } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

router.post('/solicitar', asyncHandler(async (req: Request, res: Response) => {
  const { mesaId, tipoPago } = req.body

  if (!mesaId || !tipoPago) {
    throw new AppError('Missing required fields', 400)
  }

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
    tipo: tipoPago,
    solicitadoAt: new Date(),
  }

  await ordenActiva.save()

  try {
    const io = req.app.get('io')
    io.emit('solicitud-pago', {
      mesaId,
      tipoPago,
      ordenId: ordenActiva._id.toString(),
      total: ordenActiva.totalPagar,
    })
  } catch (wsError) {
    console.warn('⚠️ WebSocket emit failed (non-critical):', wsError)
  }

  try {
    if (process.env.PRINTER_ENABLED === 'true') {
      const { printTicket } = await import('../services/printer')
      await printTicket({
        mesaId,
        ordenId: ordenActiva._id.toString(),
        items: ordenActiva.items,
        total: ordenActiva.totalPagar,
        tipo: 'SOLICITUD_PAGO',
      })
    }
  } catch (printError) {
    console.warn('⚠️ Print failed (non-critical):', printError)
  }

  res.json({ success: true, orden: ordenActiva })
}))

router.post('/llamar-mesero', asyncHandler(async (req: Request, res: Response) => {
  const { mesaId, motivo } = req.body

  if (!mesaId) {
    throw new AppError('Missing table ID', 400)
  }

  try {
    const io = req.app.get('io')
    io.emit('solicitud-mesero', {
      mesaId,
      motivo: motivo || 'Atención general',
      timestamp: new Date(),
    })
  } catch (wsError) {
    console.warn('⚠️ WebSocket emit failed (non-critical):', wsError)
  }

  res.json({ success: true, message: 'Waiter notified' })
}))

router.patch('/:id/pagar', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { metodoPago } = req.body

  const orden = await Orden.findByIdAndUpdate(
    req.params.id,
    {
      pagado: true,
      pagadoAt: new Date(),
      metodoPago,
      'solicitudPago.activo': false,
      'solicitudPago.atendidoAt': new Date(),
    },
    { new: true }
  )

  if (!orden) {
    throw new AppError('Order not found', 404)
  }

  try {
    if (process.env.PRINTER_ENABLED === 'true') {
      const { printTicket } = await import('../services/printer')
      await printTicket({
        mesaId: orden.mesaId,
        ordenId: orden._id.toString(),
        items: orden.items,
        total: orden.totalPagar,
        metodoPago,
        tipo: 'RECIBO',
      })
    }
  } catch (printError) {
    console.warn('⚠️ Print failed (non-critical):', printError)
  }

  try {
    const io = req.app.get('io')
    io.emit('orden-actualizada', orden)
  } catch (wsError) {
    console.warn('⚠️ WebSocket emit failed (non-critical):', wsError)
  }

  res.json({ success: true, orden })
}))

export default router
