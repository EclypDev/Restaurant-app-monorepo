import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../config/prisma'
import { UserRole, TokenType } from '../../../shared/enums'
import { AppError } from '../middleware/error.middleware'
import { JWT_SECRET } from '../config/env'
import { sendVerificationEmail, sendRecoveryEmail } from './email.service'

export class AuthService {
  static async registroSaas(data: {
    negocioNombre: string
    slug: string
    adminNombre: string
    email: string
    password: string
  }) {
    const slugExists = await prisma.negocio.findUnique({ where: { slug: data.slug } })
    if (slugExists) throw new AppError('El identificador del negocio ya está en uso', 400)

    const userExists = await prisma.usuario.findFirst({ where: { email: data.email } })
    if (userExists) throw new AppError('El correo ya está registrado', 400)

    if (data.password.length < 6) throw new AppError('La contraseña debe tener al menos 6 caracteres', 400)

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const negocio = await prisma.$transaction(async (tx) => {
      const n = await tx.negocio.create({
        data: {
          nombre: data.negocioNombre,
          slug: data.slug,
        }
      })

      const usuario = await tx.usuario.create({
        data: {
          nombre: data.adminNombre,
          email: data.email,
          password: hashedPassword,
          rol: UserRole.ADMIN,
          negocioId: n.id,
          emailVerificado: false,
        }
      })

      await tx.token.create({
        data: {
          token: verificationToken,
          tipo: TokenType.VERIFICACION_EMAIL,
          expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          usuarioId: usuario.id,
        }
      })

      return n
    })

    // Enviar correo en background (no bloqueante)
    sendVerificationEmail(data.email, data.adminNombre, verificationToken)

    return negocio
  }

  static async verificarCorreo(token: string) {
    const tokenRecord = await prisma.token.findUnique({ where: { token } })
    if (!tokenRecord) throw new AppError('Token inválido o expirado', 400)
    if (tokenRecord.usado) throw new AppError('Este token ya fue utilizado', 400)
    if (tokenRecord.tipo !== TokenType.VERIFICACION_EMAIL) throw new AppError('Token inválido', 400)
    if (new Date() > tokenRecord.expiraEn) throw new AppError('El token ha expirado', 400)

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: tokenRecord.usuarioId },
        data: { emailVerificado: true },
      }),
      prisma.token.update({
        where: { id: tokenRecord.id },
        data: { usado: true },
      }),
    ])

    return { message: 'Correo verificado exitosamente' }
  }

  static async solicitarRecuperacion(email: string) {
    const usuario = await prisma.usuario.findFirst({ where: { email } })
    if (!usuario) {
      // No revelar si el email existe o no por seguridad
      return { message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña' }
    }

    const recoveryToken = crypto.randomBytes(32).toString('hex')

    await prisma.token.create({
      data: {
        token: recoveryToken,
        tipo: TokenType.RECUPERACION_PASSWORD,
        expiraEn: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
        usuarioId: usuario.id,
      }
    })

    sendRecoveryEmail(email, usuario.nombre, recoveryToken)

    return { message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña' }
  }

  static async restablecerPassword(token: string, nuevaPassword: string) {
    if (nuevaPassword.length < 6) throw new AppError('La contraseña debe tener al menos 6 caracteres', 400)

    const tokenRecord = await prisma.token.findUnique({ where: { token } })
    if (!tokenRecord) throw new AppError('Token inválido o expirado', 400)
    if (tokenRecord.usado) throw new AppError('Este token ya fue utilizado', 400)
    if (tokenRecord.tipo !== TokenType.RECUPERACION_PASSWORD) throw new AppError('Token inválido', 400)
    if (new Date() > tokenRecord.expiraEn) throw new AppError('El token ha expirado. Solicita uno nuevo.', 400)

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10)

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: tokenRecord.usuarioId },
        data: { password: hashedPassword },
      }),
      prisma.token.update({
        where: { id: tokenRecord.id },
        data: { usado: true },
      }),
    ])

    return { message: 'Contraseña actualizada exitosamente' }
  }

  static async loginUser(email: string, password: string) {
    const usuario = await prisma.usuario.findFirst({
      where: { email },
      include: { negocio: { select: { id: true, nombre: true, activo: true } } },
    })

    if (!usuario || !usuario.activo) throw new AppError('Credenciales inválidas', 401)
    if (!usuario.negocio?.activo) throw new AppError('El negocio está suspendido. Contacta al soporte.', 403)

    const isMatch = await bcrypt.compare(password, usuario.password)
    if (!isMatch) throw new AppError('Credenciales inválidas', 401)

    // Auto-verificar si el usuario no está verificado (desarrollo)
    if (!usuario.emailVerificado) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { emailVerificado: true },
      })
      usuario.emailVerificado = true
      console.log(`[Auth] Usuario ${usuario.email} auto-verificado al iniciar sesión`)
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        negocioId: usuario.negocioId,
      },
      JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
    )

    return {
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        negocioId: usuario.negocioId,
        emailVerificado: usuario.emailVerificado,
      },
    }
  }

  static async register(data: { nombre: string; email: string; password: string; rol: UserRole; negocioId?: string }) {
    const existing = await prisma.usuario.findFirst({ where: { email: data.email } })
    if (existing) throw new AppError('El usuario ya existe', 400)

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const usuario = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: hashedPassword,
        rol: data.rol,
        negocioId: data.negocioId || 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
        emailVerificado: true,
      }
    })
    return usuario
  }

  static bypassLogin(email: string) {
    const token = jwt.sign(
      { id: 'dev-bypass-id', email, rol: UserRole.ADMIN, negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28' },
      JWT_SECRET as string,
      { expiresIn: '7d' }
    )
    return {
      token,
      user: {
        id: 'dev-bypass-id',
        nombre: 'Hector (Dev)',
        email,
        rol: UserRole.ADMIN,
        negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
        emailVerificado: true,
      },
    }
  }

  static async getMe(userId: string) {
    if (userId === 'dev-bypass-id') {
      return {
        id: 'dev-bypass-id',
        nombre: 'Hector (Dev)',
        email: 'hectoraderfer123421@gmail.com',
        rol: UserRole.ADMIN,
        negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
        emailVerificado: true,
      }
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        emailVerificado: true,
        negocioId: true,
        negocio: { select: { nombre: true, activo: true } },
      }
    })

    if (!usuario) throw new AppError('Usuario no encontrado', 404)
    return usuario
  }
}
