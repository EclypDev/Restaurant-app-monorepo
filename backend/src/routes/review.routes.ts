import { Router, Request, Response } from 'express'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'
import { ReviewService } from '../services/review.service'

const router = Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { mesaId, estrellas } = req.body
  if (!mesaId || !estrellas) throw new AppError('Missing required fields', 400)
  const resena = await ReviewService.create(req.body, req.app.get('io'))
  res.status(201).json({ success: true, resena, esPositiva: estrellas >= 4 })
}))

router.get('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json(await ReviewService.getAll(req.query.estrellas, req.query.resuelto))
}))

router.patch('/:id/resolver', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { respuestaAdmin } = req.body
  res.json({ success: true, resena: await ReviewService.resolve(req.params.id, respuestaAdmin) })
}))

router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  res.json(await ReviewService.getStats())
}))

export default router