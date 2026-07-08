import { Router, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Usuario } from '../models/Usuario'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'

const router = Router()

router.post('/register', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nombre, email, password, rol } = req.body

  const existingUser = await Usuario.findOne({ email })
  if (existingUser) {
    throw new AppError('User already exists', 400)
  }

  const usuario = new Usuario({ nombre, email, password, rol })
  await usuario.save()

  res.status(201).json({ success: true, message: 'User created successfully' })
}))

router.post('/login', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body

  const usuario = await Usuario.findOne({ email })
  if (!usuario || !usuario.activo) {
    throw new AppError('Invalid credentials', 401)
  }

  const isMatch = await usuario.comparePassword(password)
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401)
  }

  const token = jwt.sign(
    {
      id: usuario._id.toString(),
      email: usuario.email,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  res.json({
    token,
    user: {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  })
}))

router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const usuario = await Usuario.findById(req.user?.id).select('-password')
  if (!usuario) {
    throw new AppError('User not found', 404)
  }
  res.json(usuario)
}))

export default router
