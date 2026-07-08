import { Router, Request, Response } from 'express'
import { Platillo } from '../models/Platillo'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { categoria, disponible } = req.query
  const filter: Record<string, unknown> = { disponible: disponible !== 'false' }
  
  if (categoria) {
    filter.categoria = categoria
  }

  const platillos = await Platillo.find(filter).sort({ categoria: 1, nombre: 1 })
  res.json(platillos)
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const platillo = await Platillo.findById(req.params.id)
  if (!platillo) {
    throw new AppError('Platillo not found', 404)
  }
  res.json(platillo)
}))

router.post('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const platillo = new Platillo(req.body)
  await platillo.save()
  res.status(201).json(platillo)
}))

router.put('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const platillo = await Platillo.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
  if (!platillo) {
    throw new AppError('Platillo not found', 404)
  }
  res.json(platillo)
}))

router.delete('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const platillo = await Platillo.findByIdAndDelete(req.params.id)
  if (!platillo) {
    throw new AppError('Platillo not found', 404)
  }
  res.json({ success: true, message: 'Platillo deleted' })
}))

export default router
