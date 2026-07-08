import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '../../../shared/enums'
import { AppError } from './error.middleware'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    rol: UserRole
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
      throw new AppError('No token, authorization denied', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      id: string
      email: string
      rol: UserRole
    }

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Token is not valid' })
      return
    }
    res.status(401).json({ success: false, message: 'Authorization failed' })
  }
}

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ success: false, message: 'Access denied' })
      return
    }
    next()
  }
}
