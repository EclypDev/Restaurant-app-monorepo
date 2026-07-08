import mongoose, { Document, Schema } from 'mongoose'
import { ReviewCategory } from '../../../shared/enums'
import { IResena } from '../../../shared/interfaces'

export interface IResenaDoc extends IResena, Document {}

const resenaSchema = new Schema<IResenaDoc>({
  mesaId: { type: String, required: true },
  ordenId: { type: Schema.Types.ObjectId, ref: 'Orden' },
  estrellas: { type: Number, required: true, min: 1, max: 5 },
  comentario: { type: String },
  categoria: { type: String, enum: Object.values(ReviewCategory) },
  esPublica: { type: Boolean, default: false },
  resuelto: { type: Boolean, default: false },
  respuestaAdmin: { type: String },
  restauranteId: { type: Schema.Types.ObjectId, ref: 'Restaurante' },
}, { timestamps: true })

resenaSchema.index({ estrellas: 1, createdAt: -1 })

export const Resena = mongoose.model<IResenaDoc>('Resena', resenaSchema)
