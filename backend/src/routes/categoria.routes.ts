import { Router, Response } from 'express'
import { prisma } from '../config/prisma'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

// GET /api/categorias - listar categorías del negocio
router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const negocioId = req.user?.negocioId || 'ce36eb74-8f9a-4256-9519-08fd14e5be28'
  const categorias = await prisma.categoria.findMany({
    where: { negocioId },
    orderBy: { orden: 'asc' },
  })
  res.json(categorias)
}))

// POST /api/categorias - crear categoría
router.post('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nombre, orden } = req.body
  const negocioId = req.user?.negocioId || 'ce36eb74-8f9a-4256-9519-08fd14e5be28'
  if (!nombre) throw new AppError('Nombre es obligatorio', 400)

  const categoria = await prisma.categoria.create({
    data: { nombre, orden: orden || 0, negocioId }
  })
  res.status(201).json(categoria)
}))

// PUT /api/categorias/:id
router.put('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nombre, orden } = req.body
  const categoria = await prisma.categoria.update({
    where: { id: req.params.id },
    data: { nombre, orden }
  })
  res.json(categoria)
}))

// DELETE /api/categorias/:id
router.delete('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.categoria.delete({ where: { id: req.params.id } })
  res.json({ success: true })
}))

export default router
