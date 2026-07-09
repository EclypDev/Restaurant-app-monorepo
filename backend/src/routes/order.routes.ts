import { Router, Request, Response } from 'express'
import { prisma } from '../config/prisma'
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
  const where: any = {}
  
  if (estado) {
    const estados = (estado as string).split(',').map(s => s.trim()).filter(Boolean)
    if (estados.length > 1) {
      where.estado = { in: estados }
    } else {
      where.estado = estados[0]
    }
  }
  
  if (mesaId) {
    where.mesaId = mesaId as string
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50))
  const skip = (pageNum - 1) * limitNum

  const [ordenes, total] = await Promise.all([
    prisma.orden.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    }),
    prisma.orden.count({ where })
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
  const orden = await prisma.orden.findUnique({ where: { id: req.params.id } })
  if (!orden) {
    throw new AppError('Order not found', 404)
  }
  res.json(orden)
}))

export default router