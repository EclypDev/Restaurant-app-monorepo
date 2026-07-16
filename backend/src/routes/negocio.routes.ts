import { Router, Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

// GET /api/negocios - Listar todos los negocios (para el selector)
router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const negocios = await prisma.negocio.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, slug: true },
    orderBy: { nombre: 'asc' },
  })
  res.json(negocios)
}))

// GET /api/negocios/:slug - Configuración pública del negocio (sin auth)
router.get('/:slug', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { slug } = req.params
  const negocio = await prisma.negocio.findUnique({
    where: { slug },
    select: {
      id: true,
      nombre: true,
      slug: true,
      logo: true,
      colorPrimario: true,
      colorFondo: true,
      activo: true,
    }
  })

  if (!negocio || !negocio.activo) {
    throw new AppError('Negocio no encontrado', 404)
  }

  res.json(negocio)
}))

// GET /api/negocios/id/:id - Configuración por ID (para QR)
router.get('/id/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const negocio = await prisma.negocio.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      slug: true,
      logo: true,
      colorPrimario: true,
      colorFondo: true,
      activo: true,
    }
  })

  if (!negocio || !negocio.activo) {
    throw new AppError('Negocio no encontrado', 404)
  }

  res.json(negocio)
}))

export default router
