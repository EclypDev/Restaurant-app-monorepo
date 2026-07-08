import { Router, Response } from 'express'
import { Mesa } from '../models/Mesa'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const mesas = await Mesa.find().sort({ numero: 1 })
  res.json(mesas)
}))

router.post('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { numero, nombre, capacidad } = req.body

  const existingMesa = await Mesa.findOne({ numero })
  if (existingMesa) {
    throw new AppError('Table number already exists', 400)
  }

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const qrCode = `${baseUrl}/menu?mesa=${encodeURIComponent(numero)}`

  const mesa = new Mesa({
    numero,
    nombre,
    capacidad,
    qrCode,
  })

  await mesa.save()
  res.status(201).json(mesa)
}))

router.post('/bulk', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { count, prefix = 'Mesa' } = req.body

  if (!count || count < 1) {
    throw new AppError('Invalid count', 400)
  }

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const mesas = []

  for (let i = 1; i <= count; i++) {
    const numero = `${prefix}_${String(i).padStart(2, '0')}`
    const qrCode = `${baseUrl}/menu?mesa=${encodeURIComponent(numero)}`

    mesas.push({
      numero,
      nombre: numero,
      qrCode,
    })
  }

  try {
    const created = await Mesa.insertMany(mesas, { ordered: false })
    res.status(201).json({ created: created.length, mesas: created })
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError('Some tables already exist', 409)
    }
    throw error
  }
}))

router.put('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const mesa = await Mesa.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )

  if (!mesa) {
    throw new AppError('Table not found', 404)
  }

  res.json(mesa)
}))

router.delete('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const mesa = await Mesa.findByIdAndDelete(req.params.id)
  if (!mesa) {
    throw new AppError('Table not found', 404)
  }
  res.json({ success: true, message: 'Table deleted' })
}))

export default router
