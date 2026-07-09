import { Router, Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { categoria, disponible } = req.query
  const where: any = {
    disponible: disponible !== 'false',
  }
  
  if (categoria) {
    where.categoria = categoria as string
  }

  const platillos = await prisma.platillo.findMany({
    where,
    orderBy: [
      { categoria: 'asc' },
      { nombre: 'asc' }
    ]
  })
  res.json(platillos)
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const platillo = await prisma.platillo.findUnique({ where: { id: req.params.id } })
  if (!platillo) {
    throw new AppError('Platillo not found', 404)
  }
  res.json(platillo)
}))

router.post('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const platillo = await prisma.platillo.create({
    data: {
      ...req.body,
      personalizable: false
    }
  })
  res.status(201).json(platillo)
}))

router.put('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const platillo = await prisma.platillo.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(platillo)
  } catch {
    throw new AppError('Platillo not found', 404)
  }
}))

router.delete('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    await prisma.platillo.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Platillo deleted' })
  } catch {
    throw new AppError('Platillo not found', 404)
  }
}))

export default router