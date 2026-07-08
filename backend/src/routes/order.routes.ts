import { Router, Request, Response } from 'express'
import { Orden } from '../models/Orden'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { asyncHandler, AppError } from '../middleware/error.middleware'
import { OrderStatus } from '../../../shared/enums'

const router = Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { mesaId, items, totalPagar } = req.body

  if (!mesaId || !items || !totalPagar) {
    throw new AppError('Missing required fields', 400)
  }

  const nuevaOrden = new Orden({
    mesaId,
    items,
    totalPagar,
    estado: OrderStatus.PENDING,
  })

  await nuevaOrden.save()

  try {
    const io = req.app.get('io')
    io.to('kitchen').emit('nueva-orden-cocina', nuevaOrden)
  } catch (wsError) {
    console.warn('⚠️ WebSocket emit failed (non-critical):', wsError)
  }

  try {
    if (process.env.PRINTER_ENABLED === 'true') {
      const { printTicket } = await import('../services/printer')
      await printTicket({
        mesaId,
        ordenId: nuevaOrden._id.toString(),
        items,
        total: totalPagar,
        tipo: 'COMANDA',
      })
    }
  } catch (printError) {
    console.warn('⚠️ Print failed (non-critical):', printError)
  }

  res.status(201).json({ success: true, orden: nuevaOrden })
}))

router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { estado, mesaId } = req.query
  const filter: Record<string, unknown> = {}

  if (estado) filter.estado = estado
  if (mesaId) filter.mesaId = mesaId

  const ordenes = await Orden.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)

  res.json(ordenes)
}))

router.patch('/:id/estado', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { estado } = req.body
  
  const validStates = Object.values(OrderStatus)
  if (!validStates.includes(estado)) {
    throw new AppError('Invalid status', 400)
  }

  const orden = await Orden.findByIdAndUpdate(
    req.params.id,
    { 
      estado,
      ...(estado === OrderStatus.DELIVERED && { entregadoAt: new Date() })
    },
    { new: true }
  )

  if (!orden) {
    throw new AppError('Order not found', 404)
  }

  try {
    const io = req.app.get('io')
    io.emit('orden-actualizada', orden)
    io.to(`table-${orden.mesaId}`).emit('orden-actualizada', orden)
  } catch (wsError) {
    console.warn('⚠️ WebSocket emit failed (non-critical):', wsError)
  }

  res.json({ success: true, orden })
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const orden = await Orden.findById(req.params.id)
  if (!orden) {
    throw new AppError('Order not found', 404)
  }
  res.json(orden)
}))

export default router
