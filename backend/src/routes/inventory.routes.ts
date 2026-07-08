import { Router, Response } from 'express'
import { Ingrediente } from '../models/Ingrediente'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { categoria, disponible } = req.query
  const filter: Record<string, unknown> = {}
  
  if (categoria) filter.categoria = categoria
  if (disponible !== undefined) filter.disponible = disponible === 'true'

  const ingredientes = await Ingrediente.find(filter).sort({ categoria: 1, nombre: 1 })
  res.json(ingredientes)
}))

router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const ingrediente = await Ingrediente.findById(req.params.id)
  if (!ingrediente) {
    throw new AppError('Ingredient not found', 404)
  }
  res.json(ingrediente)
}))

router.patch('/:id/disponibilidad', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { disponible, stock } = req.body
  
  const ingrediente = await Ingrediente.findByIdAndUpdate(
    req.params.id,
    { 
      disponible,
      ...(stock !== undefined && { stock }),
    },
    { new: true }
  )

  if (!ingrediente) {
    throw new AppError('Ingredient not found', 404)
  }

  try {
    const io = req.app.get('io')
    const evento = disponible ? 'ingrediente-disponible' : 'ingrediente-agotado'
    io.emit(evento, {
      id: ingrediente._id.toString(),
      nombre: ingrediente.nombre,
      disponible: ingrediente.disponible,
      stock: ingrediente.stock,
    })
  } catch (wsError) {
    console.warn('⚠️ WebSocket emit failed (non-critical):', wsError)
  }

  res.json({ success: true, ingrediente })
}))

router.patch('/bulk', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { updates } = req.body
  const results = []

  for (const update of updates) {
    const ingrediente = await Ingrediente.findByIdAndUpdate(
      update.id,
      { disponible: update.disponible, stock: update.stock },
      { new: true }
    )
    if (ingrediente) results.push(ingrediente)
  }

  try {
    const io = req.app.get('io')
    results.forEach(ing => {
      const evento = ing.disponible ? 'ingrediente-disponible' : 'ingrediente-agotado'
      io.emit(evento, { id: ing._id.toString(), nombre: ing.nombre, disponible: ing.disponible, stock: ing.stock })
    })
  } catch (wsError) {
    console.warn('⚠️ WebSocket emit failed (non-critical):', wsError)
  }

  res.json({ success: true, updated: results.length })
}))

router.post('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const ingrediente = new Ingrediente(req.body)
  await ingrediente.save()
  res.status(201).json(ingrediente)
}))

export default router
