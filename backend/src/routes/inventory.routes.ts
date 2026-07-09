import { Router, Request, Response } from 'express'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler } from '../middleware/error.middleware'
import { InventoryService } from '../services/inventory.service'

const router = Router()

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json(await InventoryService.getAll(req.query.categoria, req.query.stockDisponible))
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.json(await InventoryService.getById(req.params.id))
}))

router.patch('/:id/disponibilidad', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { stockDisponible } = req.body
  const ingrediente = await InventoryService.toggleDisponibilidad(req.params.id, stockDisponible, req.app.get('io'))
  res.json({ success: true, ingrediente })
}))

router.patch('/bulk', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { updates } = req.body
  const updated = await InventoryService.bulkUpdate(updates, req.app.get('io'))
  res.json({ success: true, updated })
}))

router.post('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const ingrediente = await InventoryService.create(req.body)
  res.status(201).json(ingrediente)
}))

export default router