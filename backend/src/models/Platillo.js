const mongoose = require('mongoose');

const visualLayerSchema = new mongoose.Schema({
  ingredienteId: { type: String, required: true },
  imagenUrl: { type: String, required: true },
  posicion: { x: { type: Number }, y: { type: Number }, z: { type: Number, default: 0 } },
  escala: { type: Number, default: 1 },
}, { _id: false });

const optionItemSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precioExtra: { type: Number, default: 0 },
  disponible: { type: Boolean, default: true },
  ingredienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingrediente' },
  alergenos: [{ type: String }],
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
  tiempoPreparacion: { type: Number },
  alergenos: [{ type: String }],
  itemsRelacionados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Platillo' }],
  capasVisuales: [visualLayerSchema],
  imagenBase: { type: String },
  restauranteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurante' },
}, { timestamps: true });

module.exports = mongoose.model('Platillo', platilloSchema);
