const mongoose = require('mongoose');

const optionItemSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precioExtra: { type: Number, default: 0 },
  disponible: { type: Boolean, default: true },
}, { _id: false });

const optionGroupSchema = new mongoose.Schema({
  grupo: { type: String, required: true },
  maxSeleccion: { type: Number, required: true, min: 1 },
  minSeleccion: { type: Number, default: 0 },
  items: [optionItemSchema],
}, { _id: false });

const platilloSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precioBase: { type: Number, required: true },
  imagenUrl: { type: String },
  categoria: { type: String, required: true, index: true },
  disponible: { type: Boolean, default: true },
  personalizable: { type: Boolean, default: false },
  opcionesSeleccionables: [optionGroupSchema],
  tiempoPreparacion: { type: Number }, // en minutos
  restauranteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurante' },
}, { timestamps: true });

module.exports = mongoose.model('Platillo', platilloSchema);
