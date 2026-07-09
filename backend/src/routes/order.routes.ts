import { Router, Request, Response } from 'express'
import { Orden } from '../models/Orden'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { asyncHandler, AppError } from '../middleware/error.middleware'
import { OrderStatus } from '../../../shared/enums'
import { OrderService } from '../services/order.service'

const router = Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { mesaId, items, totalPagar } = req.body
  if (!mesaId || !items || !totalPagar) throw new AppError('Missing required fields', 400)
  
  const nuevaOrden = await OrderService.createOrder(req.body, req.app.get('io'))
  res.status(201).json({ success: true, orden: nuevaOrden })
}))

router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { estado, mesaId, page = '1', limit = '50' } = req.query
  const filter: Record<string, unknown> = {}
  if (estado) {
    const estados = (estado as string).split(',').map(s => s.trim()).filter(Boolean)
    if (estados.length > 1) filter.estado = { $in: estados }
    else filter.estado = estados[0]
  }
  if (mesaId) filter.mesaId = mesaId
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50))
  const skip = (pageNum - 1) * limitNum
  const [ordenes, total] = await Promise.all([
    Orden.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Orden.countDocuments(filter),
  ])
  res.json({ ordenes, total, page: pageNum, pages: Math.ceil(total / limitNum) })
}))

router.patch('/:id/estado', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { estado } = req.body
  const validStates = Object.values(OrderStatus)
  if (!validStates.includes(estado)) throw new AppError('Invalid status', 400)
  
  const orden = await OrderService.updateStatus(req.params.id, estado, req.app.get('io'))
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
