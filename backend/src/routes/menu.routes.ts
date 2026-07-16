import { Router, Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { TenantRequest } from '../middleware/tenant.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const tenantReq = req as TenantRequest
  const { categoria, disponible } = req.query
  const where: any = {
    negocioId: tenantReq.negocioId || 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
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
  const { nombre, descripcion, precioBase, imagenUrl, categoria } = req.body
  if (!nombre || !precioBase || !categoria) {
    throw new AppError('nombre, precioBase y categoria son obligatorios', 400)
  }
  const platillo = await prisma.platillo.create({
    data: {
      nombre,
      descripcion,
      precioBase: parseFloat(precioBase),
      imagenUrl,
      categoria,
      negocioId: req.user!.negocioId || 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
      personalizable: false,
      disponible: true,
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