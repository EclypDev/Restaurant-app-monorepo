const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
  mesaId: { type: String, required: true },
  ordenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Orden' },
  estrellas: { type: Number, required: true, min: 1, max: 5 },
  comentario: { type: String },
  categoria: { type: String, enum: ['servicio', 'comida', 'limpieza', 'ambiente', 'otro'] },
  esPublica: { type: Boolean, default: false },
  resuelto: { type: Boolean, default: false },
  respuestaAdmin: { type: String },
  restauranteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurante' },
}, { timestamps: true });

resenaSchema.index({ estrellas: 1, createdAt: -1 });

module.exports = mongoose.model('Resena', resenaSchema);
