import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Usuario } from './models/Usuario'
import { Ingrediente } from './models/Ingrediente'
import { PlatilloPredefinido } from './models/PlatilloPredefinido'

async function seed() {
  try {
    console.log('📦 Connecting to database...')
    
    const mongoUri = process.env.MONGODB_URI
    if (mongoUri && mongoUri !== 'in-memory') {
      await mongoose.connect(mongoUri)
    } else {
      const mongoServer = await MongoMemoryServer.create()
      await mongoose.connect(mongoServer.getUri())
    }

    console.log('✅ Connected')

    // Users
    const userCount = await Usuario.countDocuments()
    if (userCount === 0) {
      console.log('🌱 Seeding users...')
      await Usuario.create([
        { nombre: 'Administrador', email: 'admin@restaurante.com', password: 'admin123', rol: 'admin' },
        { nombre: 'Cocina', email: 'cocina@restaurante.com', password: 'cocina123', rol: 'cocina' },
        { nombre: 'Mesero', email: 'mesero@restaurante.com', password: 'mesero123', rol: 'mesero' },
      ])
      console.log('✅ Users created')
    }

    // Ingredients
    const ingCount = await Ingrediente.countDocuments()
    if (ingCount === 0) {
      console.log('🌱 Seeding ingredients...')
      await Ingrediente.create([
        { _id: 'ing_pan_01', nombre: 'Pan Brioche', emoji: '🍞', precioAdicional: 0, alergenos: ['gluten'], categoria: 'base', stockDisponible: true, capaImagenUrl: '/layers/pan.png' },
        { _id: 'ing_pan_artesanal', nombre: 'Pan Artesanal', emoji: '🥖', precioAdicional: 2000, alergenos: ['gluten'], categoria: 'base', stockDisponible: true, capaImagenUrl: '/layers/pan_artesanal.png' },
        { _id: 'ing_lettuce_wrap', nombre: 'Lettuce Wrap', emoji: '', precioAdicional: 1500, alergenos: [], categoria: 'base', stockDisponible: true, capaImagenUrl: '/layers/lettuce_wrap.png' },
        { _id: 'ing_carne_01', nombre: 'Carne de Res', emoji: '🥩', precioAdicional: 0, alergenos: [], categoria: 'proteina', stockDisponible: true, capaImagenUrl: '/layers/carne.png' },
        { _id: 'ing_pollo', nombre: 'Pollo Crispy', emoji: '🍗', precioAdicional: 2000, alergenos: ['gluten'], categoria: 'proteina', stockDisponible: true, capaImagenUrl: '/layers/pollo.png' },
        { _id: 'ing_plant_based', nombre: 'Plant-Based', emoji: '🌱', precioAdicional: 3000, alergenos: ['soja'], categoria: 'proteina', stockDisponible: true, capaImagenUrl: '/layers/plant_based.png' },
        { _id: 'ing_lechuga', nombre: 'Lechuga', emoji: '🥬', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true, capaImagenUrl: '/layers/lechuga.png' },
        { _id: 'ing_tomate', nombre: 'Tomate', emoji: '🍅', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true, capaImagenUrl: '/layers/tomate.png' },
        { _id: 'ing_cebolla', nombre: 'Cebolla', emoji: '🧅', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true, capaImagenUrl: '/layers/cebolla.png' },
        { _id: 'ing_pepinillos', nombre: 'Pepinillos', emoji: '🥒', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true, capaImagenUrl: '/layers/pepinillos.png' },
        { _id: 'ing_queso', nombre: 'Queso Cheddar', emoji: '🧀', precioAdicional: 1500, alergenos: ['lactosa'], categoria: 'adicion_premium', stockDisponible: true, capaImagenUrl: '/layers/queso.png' },
        { _id: 'ing_tocino', nombre: 'Tocino Premium', emoji: '🥓', precioAdicional: 3500, alergenos: [], categoria: 'adicion_premium', stockDisponible: true, capaImagenUrl: '/layers/tocino.png' },
        { _id: 'ing_aguacate', nombre: 'Aguacate', emoji: '', precioAdicional: 2500, alergenos: [], categoria: 'adicion_premium', stockDisponible: true, capaImagenUrl: '/layers/aguacate.png' },
        { _id: 'ing_huevo', nombre: 'Huevo Frito', emoji: '🍳', precioAdicional: 2000, alergenos: ['huevos'], categoria: 'adicion_premium', stockDisponible: true, capaImagenUrl: '/layers/huevo.png' },
        { _id: 'ing_salsa_bbq', nombre: 'Salsa BBQ', emoji: '', precioAdicional: 1000, alergenos: ['mostaza'], categoria: 'extra', stockDisponible: true, capaImagenUrl: '/layers/salsa_bbq.png' },
        { _id: 'ing_salsa_picante', nombre: 'Salsa Picante', emoji: '🌶️', precioAdicional: 500, alergenos: [], categoria: 'extra', stockDisponible: true, capaImagenUrl: '/layers/salsa_picante.png' },
        { _id: 'ing_mayonesa', nombre: 'Mayonesa', emoji: '', precioAdicional: 500, alergenos: ['huevos'], categoria: 'extra', stockDisponible: true, capaImagenUrl: '/layers/mayonesa.png' },
      ])
      console.log('✅ Ingredients created')
    }

    // Platillos Predefinidos
    const platCount = await PlatilloPredefinido.countDocuments()
    if (platCount === 0) {
      console.log('🌱 Seeding platillos predefinidos...')
      await PlatilloPredefinido.create([
        {
          _id: 'plat_hamburguesa_clasica',
          nombre: 'Hamburguesa Clásica',
          descripcion: 'Hamburguesa tradicional con todos los clásicos',
          precioBase: 12000,
          imagenPredefinidaUrl: '/platos/hamburguesa_clasica.png',
          categoria: 'Hamburguesas',
          composicionPorDefecto: [
            { ingredienteId: 'ing_pan_01', removible: false, esBase: true },
            { ingredienteId: 'ing_carne_01', removible: false, esProteina: true },
            { ingredienteId: 'ing_lechuga', removible: true },
            { ingredienteId: 'ing_tomate', removible: true },
            { ingredienteId: 'ing_cebolla', removible: true },
            { ingredienteId: 'ing_pepinillos', removible: true },
          ],
          adicionesPermitidas: ['ing_queso', 'ing_tocino', 'ing_aguacate', 'ing_huevo', 'ing_salsa_bbq', 'ing_salsa_picante', 'ing_mayonesa'],
          disponible: true,
          tiempoPreparacion: 15,
        },
        {
          _id: 'plat_hamburguesa_premium',
          nombre: 'Hamburguesa Premium',
          descripcion: 'Hamburguesa gourmet con pan artesanal y extras',
          precioBase: 18000,
          imagenPredefinidaUrl: '/platos/hamburguesa_premium.png',
          categoria: 'Hamburguesas',
          composicionPorDefecto: [
            { ingredienteId: 'ing_pan_artesanal', removible: false, esBase: true },
            { ingredienteId: 'ing_carne_01', removible: false, esProteina: true },
            { ingredienteId: 'ing_queso', removible: true },
            { ingredienteId: 'ing_tocino', removible: true },
            { ingredienteId: 'ing_lechuga', removible: true },
            { ingredienteId: 'ing_tomate', removible: true },
          ],
          adicionesPermitidas: ['ing_aguacate', 'ing_huevo', 'ing_salsa_bbq', 'ing_salsa_picante'],
          disponible: true,
          tiempoPreparacion: 20,
        },
        {
          _id: 'plat_bowl_ensalada',
          nombre: 'Bowl Ensalada',
          descripcion: 'Bowl fresco y saludable',
          precioBase: 14000,
          imagenPredefinidaUrl: '/platos/bowl_ensalada.png',
          categoria: 'Bowls',
          composicionPorDefecto: [
            { ingredienteId: 'ing_lettuce_wrap', removible: false, esBase: true },
            { ingredienteId: 'ing_pollo', removible: false, esProteina: true },
            { ingredienteId: 'ing_tomate', removible: true },
            { ingredienteId: 'ing_aguacate', removible: true },
            { ingredienteId: 'ing_cebolla', removible: true },
          ],
          adicionesPermitidas: ['ing_queso', 'ing_tocino', 'ing_huevo', 'ing_salsa_picante'],
          disponible: true,
          tiempoPreparacion: 10,
        },
      ])
      console.log('✅ Platillos predefinidos created')
    }

    await mongoose.disconnect()
    console.log('🔌 Disconnected')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seed()
