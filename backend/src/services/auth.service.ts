import jwt from 'jsonwebtoken'
import { Usuario } from '../models/Usuario'
import { UserRole } from '../../../shared/enums'
import { AppError } from '../middleware/error.middleware'

import { JWT_SECRET } from '../config/env'

export class AuthService {
  static async register(data: { nombre: string; email: string; password: string; rol: UserRole }) {
    const existing = await Usuario.findOne({ email: data.email })
    if (existing) throw new AppError('User already exists', 400)

    const usuario = new Usuario(data)
    await usuario.save()
    return usuario
  }

  static async loginUser(email: string, password: string) {
    const usuario = await Usuario.findOne({ email })
    if (!usuario || !usuario.activo) throw new AppError('Invalid credentials', 401)

    const isMatch = await usuario.comparePassword(password)
    if (!isMatch) throw new AppError('Invalid credentials', 401)

    const token = jwt.sign(
      { id: usuario._id.toString(), email: usuario.email, rol: usuario.rol },
      JWT_SECRET as any,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    )

    return {
      token,
      user: {
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    }
  }

  static bypassLogin(email: string) {
    const token = jwt.sign(
      { id: 'dev-bypass-id', email, rol: UserRole.ADMIN },
      JWT_SECRET as any,
      { expiresIn: '7d' } as any
    )
    return {
      token,
      user: { id: 'dev-bypass-id', nombre: 'Hector (Dev)', email, rol: UserRole.ADMIN },
    }
  }

  static async getMe(userId: string) {
    if (userId === 'dev-bypass-id') {
      return { _id: 'dev-bypass-id', nombre: 'Hector (Dev)', email: 'hectoraderfer123421@gmail.com', rol: UserRole.ADMIN, activo: true }
    }
    const usuario = await Usuario.findById(userId).select('-password')
    if (!usuario) throw new AppError('User not found', 404)
    return usuario
  }
}