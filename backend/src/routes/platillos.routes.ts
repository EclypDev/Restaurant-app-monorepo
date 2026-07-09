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
    personalizable: true // PlatillosPredefinidos are personalizable!
  }
  
  if (categoria) where.categoria = categoria as string

  const platillos = await prisma.platillo.findMany({
    where,
    orderBy: [
      { categoria: 'asc' },
      { nombre: 'asc' }
    ]
  })

  // Simulate populate composicionPorDefecto ingrediente details
  const decoratedPlatillos = await Promise.all(platillos.map(async (plat: any) => {
    if (plat.composicionPorDefecto) {
      const composicion = plat.composicionPorDefecto as any[]
      const ingredienteIds = composicion.map(c => c.ingredienteId).filter(Boolean)
      const ingredientes = await prisma.ingrediente.findMany({
        where: { id: { in: ingredienteIds } }
      })
      const populatedComposicion = composicion.map(c => {
        const ing = ingredientes.find(i => i.id === c.ingredienteId)
        return {
          ...c,
          ingredienteId: ing || c.ingredienteId
        }
      })
      return {
        ...plat,
        composicionPorDefecto: populatedComposicion
      }
    }
    return plat
  }))

  res.json(decoratedPlatillos)
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const platillo = await prisma.platillo.findUnique({ where: { id: req.params.id } })
  if (!platillo || !platillo.personalizable) {
    throw new AppError('Platillo predefinido not found', 404)
  }

  // Populate ingredients
  let populatedComposicion = platillo.composicionPorDefecto as any[] || []
  const ingredienteIds = populatedComposicion.map(c => c.ingredienteId).filter(Boolean)
  const ingredientes = await prisma.ingrediente.findMany({
    where: { id: { in: ingredienteIds } }
  })
  populatedComposicion = populatedComposicion.map(c => {
    const ing = ingredientes.find(i => i.id === c.ingredienteId)
    return {
      ...c,
      ingredienteId: ing || c.ingredienteId
    }
  })

  const adicionesPermitidasList = platillo.adicionesPermitidas as string[] || []
  const ingredientesDisponibles = await prisma.ingrediente.findMany({
    where: {
      id: { in: adicionesPermitidasList },
      stockDisponible: true,
    }
  })

  res.json({
    ...platillo,
    composicionPorDefecto: populatedComposicion,
    ingredientesDisponibles,
  })
}))

router.post('/', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const platillo = await prisma.platillo.create({
    data: {
      ...req.body,
      personalizable: true
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
    throw new AppError('Platillo predefinido not found', 404)
  }
}))

router.delete('/:id', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    await prisma.platillo.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Platillo predefinido deleted' })
  } catch {
    throw new AppError('Platillo predefinido not found', 404)
  }
}))

export default router