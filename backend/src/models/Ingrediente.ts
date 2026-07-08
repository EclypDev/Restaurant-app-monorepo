import mongoose, { Document, Schema } from 'mongoose'
import { TimeUnit } from '../../../shared/enums'
import { IIngrediente } from '../../../shared/interfaces'

export interface IIngredienteDoc extends IIngrediente, Document {}

const ingredienteSchema = new Schema<IIngredienteDoc>({
  nombre: { type: String, required: true, unique: true },
  categoria: { type: String },
  disponible: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  unidad: { type: String, enum: Object.values(TimeUnit), default: TimeUnit.UNIT },
  alergenos: [{ type: String }],
  imagenUrl: { type: String },
  restauranteId: { type: Schema.Types.ObjectId, ref: 'Restaurante' },
}, { timestamps: true })

ingredienteSchema.index({ disponible: 1, categoria: 1 })

export const Ingrediente = mongoose.model<IIngredienteDoc>('Ingrediente', ingredienteSchema)
