import { Router, Response } from 'express'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'
import { TableService } from '../services/table.service'

const router = Router()

router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await TableService.getAll())
}))

router.post('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { numero, nombre, capacidad } = req.body
  const mesa = await TableService.create(numero, nombre, capacidad)
  res.status(201).json(mesa)
}))

router.post('/bulk', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { count, prefix = 'Mesa' } = req.body
  if (!count || count < 1) throw new AppError('Invalid count', 400)
  const result = await TableService.bulkCreate(count, prefix)
  res.status(201).json(result)
}))

router.put('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await TableService.update(req.params.id, req.body))
}))

router.delete('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  await TableService.delete(req.params.id)
  res.json({ success: true, message: 'Table deleted' })
}))

export default router