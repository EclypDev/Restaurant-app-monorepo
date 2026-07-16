import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'
import { UserRole } from '../../../shared/enums'

export interface AuthRequest extends Request {
  user?: {
    id: string
    nombre?: string
    email: string
    rol: UserRole
    negocioId?: string
  }
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({ success: false, message: 'Token requerido' })
      return
    }

    // Dev bypass
    if (token === 'dev-bypass-token') {
      req.user = {
        id: 'dev-bypass-id',
        email: 'hectoraderfer123421@gmail.com',
        rol: UserRole.ADMIN,
        negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
      }
      return next()
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      rol: UserRole
    }

    req.user = decoded
    next()
  } catch (error) {
    // Error de JWT (token expirado, malformado, firma inválida)
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Token inválido o expirado' })
      return
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expirado' })
      return
    }
    // Error interno del servidor (no enmascarar como 401)
    console.error('[AuthMiddleware] Error inesperado:', error)
    res.status(500).json({ success: false, message: 'Error de autenticación interno' })
  }
}

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ success: false, message: 'Acceso denegado' })
      return
    }
    next()
  }
}
