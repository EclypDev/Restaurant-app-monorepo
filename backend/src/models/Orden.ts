import mongoose, { Document, Schema } from 'mongoose'
import { OrderStatus, PaymentMethod } from '../../../shared/enums'
import { IEleccionUsuario, IOrderItem, IOrden, ISolicitudPago } from '../../../shared/interfaces'

export interface IOrdenDoc extends IOrden, Document {}

const eleccionUsuarioSchema = new Schema<IEleccionUsuario>({
  grupo: { type: String, required: true },
  seleccionado: [{ type: String }],
}, { _id: false })

const orderItemSchema = new Schema<IOrderItem>({
  platilloId: { type: Schema.Types.ObjectId, ref: 'Platillo', required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true },
  eleccionUsuario: [eleccionUsuarioSchema],
  notasEspeciales: { type: String },
}, { _id: false })

const solicitudPagoSchema = new Schema<ISolicitudPago>({
  activo: { type: Boolean, default: false },
  tipo: { type: String, enum: Object.values(PaymentMethod) },
  solicitadoAt: { type: Date },
  atendidoAt: { type: Date },
}, { _id: false })

const ordenSchema = new Schema<IOrdenDoc>({
  mesaId: { type: String, required: true, index: true },
  estado: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  },
  items: [orderItemSchema],
  totalPagar: { type: Number, required: true },
  restauranteId: { type: Schema.Types.ObjectId, ref: 'Restaurante' },
  entregadoAt: { type: Date },
  solicitudPago: solicitudPagoSchema,
  metodoPago: { type: String, enum: Object.values(PaymentMethod) },
  pagado: { type: Boolean, default: false },
  pagadoAt: { type: Date },
}, { timestamps: true })

ordenSchema.index({ createdAt: -1 })
ordenSchema.index({ mesaId: 1, estado: 1 })

export const Orden = mongoose.model<IOrdenDoc>('Orden', ordenSchema)
