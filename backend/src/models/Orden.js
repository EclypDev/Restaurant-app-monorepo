const mongoose = require('mongoose');

const eleccionUsuarioSchema = new mongoose.Schema({
  grupo: { type: String, required: true },
  seleccionado: [{ type: String }],
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  platilloId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platillo', required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true },
  eleccionUsuario: [eleccionUsuarioSchema],
  notasEspeciales: { type: String },
}, { _id: false });

const ordenSchema = new mongoose.Schema({
  mesaId: { type: String, required: true, index: true },
  estado: {
    type: String,
    enum: ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'],
    default: 'PENDIENTE',
  },
  items: [orderItemSchema],
  totalPagar: { type: Number, required: true },
  restauranteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurante' },
  entregadoAt: { type: Date },
  solicitudPago: {
    activo: { type: Boolean, default: false },
    tipo: { type: String, enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] },
    solicitadoAt: { type: Date },
    atendidoAt: { type: Date },
  },
  metodoPago: { type: String, enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] },
  pagado: { type: Boolean, default: false },
  pagadoAt: { type: Date },
}, { timestamps: true });

ordenSchema.index({ createdAt: -1 });
ordenSchema.index({ mesaId: 1, estado: 1 });

module.exports = mongoose.model('Orden', ordenSchema);
