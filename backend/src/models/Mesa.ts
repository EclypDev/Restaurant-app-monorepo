import mongoose, { Document, Schema } from 'mongoose'
import { IMesa } from '../../../shared/interfaces'

export interface IMesaDoc extends IMesa, Document {}

const mesaSchema = new Schema<IMesaDoc>({
  numero: { type: String, required: true, unique: true },
  nombre: { type: String },
  capacidad: { type: Number },
  activa: { type: Boolean, default: true },
  qrCode: { type: String },
  restauranteId: { type: Schema.Types.ObjectId, ref: 'Restaurante' },
}, { timestamps: true })

export const Mesa = mongoose.model<IMesaDoc>('Mesa', mesaSchema)
