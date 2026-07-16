import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'

export interface TenantRequest extends Request {
  negocioId?: string
}

export function tenantMiddleware(req: TenantRequest, _res: Response, next: NextFunction) {
  // 1. Header explícito (x-negocio-id) - usado por clientes QR
  let negocioId = req.headers['x-negocio-id'] as string

  // 2. Query param (para depuración)
  if (!negocioId) {
    negocioId = req.query.negocioId as string
  }

  // 3. Body param
  if (!negocioId) {
    negocioId = req.body?.negocioId as string
  }

  // 4. Extraer del JWT (para empleados autenticados)
  if (!negocioId) {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (token && token !== 'dev-bypass-token') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        if (decoded.negocioId) {
          negocioId = decoded.negocioId
        }
      } catch {
        // Token inválido, ignorar
      }
    }
  }

  // 5. Fallback: si el usuario ya fue autenticado por authMiddleware
  if (!negocioId) {
    const authReq = req as any
    if (authReq.user?.negocioId) {
      negocioId = authReq.user.negocioId
    }
  }

  if (negocioId) {
    req.negocioId = negocioId
  }

  next()
}
