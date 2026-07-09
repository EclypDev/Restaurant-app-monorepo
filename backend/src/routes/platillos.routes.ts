import { Router, Request, Response } from 'express'
import { PlatilloPredefinido } from '../models/PlatilloPredefinido'
import { Ingrediente } from '../models/Ingrediente'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { categoria, disponible } = req.query
  const filter: Record<string, unknown> = { disponible: disponible !== 'false' }
  
  if (categoria) filter.categoria = categoria

  const platillos = await PlatilloPredefinido.find(filter)
    .sort({ categoria: 1, nombre: 1 })
    .populate('composicionPorDefecto.ingredienteId')

  res.json(platillos)
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const platillo = await PlatilloPredefinido.findById(req.params.id)
    .populate('composicionPorDefecto.ingredienteId')
    .lean()

  if (!platillo) {
    throw new AppError('Platillo predefinido not found', 404)
  }

  const ingredientesDisponibles = await Ingrediente.find({
    _id: { $in: platillo.adicionesPermitidas },
    stockDisponible: true,
  })

  res.json({
    ...platillo.toObject(),
    ingredientesDisponibles,
  })
}))

router.post('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const platillo = new PlatilloPredefinido(req.body)
  await platillo.save()
  res.status(201).json(platillo)
}))

router.put('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const platillo = await PlatilloPredefinido.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!platillo) {
    throw new AppError('Platillo predefinido not found', 404)
  }

  res.json(platillo)
}))

router.delete('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const platillo = await PlatilloPredefinido.findByIdAndDelete(req.params.id)
  if (!platillo) {
    throw new AppError('Platillo predefinido not found', 404)
  }
  res.json({ success: true, message: 'Platillo predefinido deleted' })
}))

export default router
