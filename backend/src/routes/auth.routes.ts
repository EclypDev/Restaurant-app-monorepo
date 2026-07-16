import { Router, Response } from 'express'
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { UserRole } from '../../../shared/enums'
import { asyncHandler, AppError } from '../middleware/error.middleware'
import { AuthService } from '../services/auth.service'

const router = Router()

// POST /api/auth/registro-saas - Registro completo de negocio + admin
router.post('/registro-saas', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { negocioNombre, slug, adminNombre, email, password } = req.body

  if (!negocioNombre || !slug || !adminNombre || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios: negocioNombre, slug, adminNombre, email, password'
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres'
    })
  }

  await AuthService.registroSaas({ negocioNombre, slug, adminNombre, email, password })

  res.status(201).json({
    success: true,
    message: 'Negocio registrado exitosamente. Revisa tu correo para verificar la cuenta.'
  })
}))

// GET /api/auth/verificar-correo?token=XYZ
router.get('/verificar-correo', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token } = req.query

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: 'Token requerido' })
  }

  const result = await AuthService.verificarCorreo(token)
  res.json({ success: true, ...result })
}))

// POST /api/auth/recuperar-password
router.post('/recuperar-password', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ success: false, message: 'El correo es obligatorio' })
  }

  const result = await AuthService.solicitarRecuperacion(email)
  res.json({ success: true, ...result })
}))

// POST /api/auth/restablecer-password
router.post('/restablecer-password', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, nuevaPassword } = req.body

  if (!token || !nuevaPassword) {
    return res.status(400).json({ success: false, message: 'Token y nueva contraseña son obligatorios' })
  }

  if (nuevaPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' })
  }

  const result = await AuthService.restablecerPassword(token, nuevaPassword)
  res.json({ success: true, ...result })
}))

// POST /api/auth/login
router.post('/login', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' })
  }

  // Dev bypass - acepta cualquier contraseña para la cuenta de desarrollo
  if (email === 'hectoraderfer123421@gmail.com') {
    console.log('[Login] Dev bypass para:', email)
    return res.json(AuthService.bypassLogin(email))
  }

  try {
    const result = await AuthService.loginUser(email, password)
    res.json(result)
  } catch (err: any) {
    // Errores de negocio (credenciales, verificación, etc.) → 4xx
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      })
    }
    // Errores del sistema (BD, red, etc.) → 500 con mensaje claro
    console.error('[Login] Error de sistema:', err)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor. Verifica la conexión a la base de datos.',
    })
  }
}))

// GET /api/auth/me
router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userData = await AuthService.getMe(req.user!.id)
  res.json(userData)
}))

// POST /api/auth/register (crear empleados - solo admin)
router.post('/register', authMiddleware, requireRole(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res: Response) => {
  await AuthService.register(req.body)
  res.status(201).json({ success: true, message: 'Usuario creado exitosamente' })
}))

export default router
