const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  categoria: { type: String },
  disponible: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  unidad: { type: String, enum: ['kg', 'g', 'L', 'ml', 'unidad', 'porcion'], default: 'unidad' },
  alergenos: [{ type: String }],
  imagenUrl: { type: String },
  restauranteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurante' },
}, { timestamps: true });

ingredienteSchema.index({ disponible: 1, categoria: 1 });

module.exports = mongoose.model('Ingrediente', ingredienteSchema);
