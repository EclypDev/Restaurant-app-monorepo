import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import { UserRole } from '../../../shared/enums'
import { IUsuario } from '../../../shared/interfaces'

export interface IUsuarioDoc extends IUsuario, Document {
  password: string
  comparePassword(candidatePassword: string): Promise<boolean>
}

const usuarioSchema = new Schema<IUsuarioDoc>({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  rol: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.ADMIN,
  },
  restauranteId: { type: Schema.Types.ObjectId, ref: 'Restaurante' },
  activo: { type: Boolean, default: true },
}, { timestamps: true })

usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

usuarioSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

export const Usuario = mongoose.model<IUsuarioDoc>('Usuario', usuarioSchema)
