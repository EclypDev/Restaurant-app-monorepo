import mongoose, { Document, Schema } from 'mongoose'
import { Alergeno, IOptionGroup, IOptionItem, IPlatillo, IVisualLayer } from '../../../shared/interfaces'

export interface IPlatilloDoc extends IPlatillo, Document {}

const optionItemSchema = new Schema<IOptionItem>({
  nombre: { type: String, required: true },
  precioExtra: { type: Number, default: 0 },
  disponible: { type: Boolean, default: true },
  ingredienteId: { type: String },
  alergenos: [{ type: String }],
}, { _id: false })

const optionGroupSchema = new Schema<IOptionGroup>({
  grupo: { type: String, required: true },
  maxSeleccion: { type: Number, required: true, min: 1 },
  minSeleccion: { type: Number, default: 0 },
  items: [optionItemSchema],
}, { _id: false })

const visualLayerSchema = new Schema<IVisualLayer>({
  ingredienteId: { type: String, required: true },
  imagenUrl: { type: String, required: true },
  posicion: {
    x: { type: Number },
    y: { type: Number },
    z: { type: Number, default: 0 },
  },
  escala: { type: Number, default: 1 },
}, { _id: false })

const platilloSchema = new Schema<IPlatilloDoc>({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precioBase: { type: Number, required: true },
  imagenUrl: { type: String },
  categoria: { type: String, required: true, index: true },
  disponible: { type: Boolean, default: true },
  personalizable: { type: Boolean, default: false },
  opcionesSeleccionables: [optionGroupSchema],
  tiempoPreparacion: { type: Number },
  alergenos: [{ type: String }],
  itemsRelacionados: [{ type: Schema.Types.ObjectId, ref: 'Platillo' }],
  capasVisuales: [visualLayerSchema],
  imagenBase: { type: String },
  restauranteId: { type: Schema.Types.ObjectId, ref: 'Restaurante' },
}, { timestamps: true })

export const Platillo = mongoose.model<IPlatilloDoc>('Platillo', platilloSchema)
