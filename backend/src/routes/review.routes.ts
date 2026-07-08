import { Router, Request, Response } from 'express'
import { Resena } from '../models/Resena'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { mesaId, ordenId, estrellas, comentario, categoria } = req.body

  if (!mesaId || !estrellas) {
    throw new AppError('Missing required fields', 400)
  }

  const resena = new Resena({
    mesaId,
    ordenId,
    estrellas,
    comentario,
    categoria,
    esPublica: estrellas >= 4,
  })

  await resena.save()

  if (estrellas <= 2) {
    try {
      const io = req.app.get('io')
      io.emit('resena-nueva', {
        mesaId,
        estrellas,
        comentario,
        alerta: true,
      })
    } catch (wsError) {
      console.warn('⚠️ WebSocket emit failed (non-critical):', wsError)
    }
  }

  res.status(201).json({
    success: true,
    resena,
    esPositiva: estrellas >= 4,
  })
}))

router.get('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { estrellas, resuelto } = req.query
  const filter: Record<string, unknown> = {}

  if (estrellas) filter.estrellas = Number(estrellas)
  if (resuelto !== undefined) filter.resuelto = resuelto === 'true'

  const resenas = await Resena.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)

  res.json(resenas)
}))

router.patch('/:id/resolver', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { respuestaAdmin } = req.body

  const resena = await Resena.findByIdAndUpdate(
    req.params.id,
    { resuelto: true, respuestaAdmin },
    { new: true }
  )

  if (!resena) {
    throw new AppError('Review not found', 404)
  }

  res.json({ success: true, resena })
}))

router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = await Resena.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        promedio: { $avg: '$estrellas' },
        positivas: { $sum: { $cond: [{ $gte: ['$estrellas', 4] }, 1, 0] } },
        negativas: { $sum: { $cond: [{ $lte: ['$estrellas', 2] }, 1, 0] } },
      },
    },
  ])

  res.json(stats[0] || { total: 0, promedio: 0, positivas: 0, negativas: 0 })
}))

export default router
