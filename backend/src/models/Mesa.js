const mongoose = require('mongoose');

const mesaSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  nombre: { type: String },
  capacidad: { type: Number },
  activa: { type: Boolean, default: true },
  qrCode: { type: String }, // URL del QR
  restauranteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurante' },
}, { timestamps: true });

module.exports = mongoose.model('Mesa', mesaSchema);
