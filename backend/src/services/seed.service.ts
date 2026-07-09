import { Usuario } from '../models/Usuario'
import { Ingrediente } from '../models/Ingrediente'
import { PlatilloPredefinido } from '../models/PlatilloPredefinido'

export class SeedService {
  static async seedDefaultUsers() {
    try {
      const count = await Usuario.countDocuments()
      if (count === 0) {
        console.log('🌱 Seeding default users...')
        await Usuario.create([
          { nombre: 'Administrador', email: 'admin@restaurante.com', password: 'admin123', rol: 'admin' },
          { nombre: 'Cocina', email: 'cocina@restaurante.com', password: 'cocina123', rol: 'cocina' },
          { nombre: 'Mesero', email: 'mesero@restaurante.com', password: 'mesero123', rol: 'mesero' },
        ])
        console.log('✅ Default users created')
        console.log('   Admin: admin@restaurante.com / admin123')
        console.log('   Cocina: cocina@restaurante.com / cocina123')
        console.log('   Mesero: mesero@restaurante.com / mesero123')
      }
    } catch (error) {
      console.warn('⚠️ User seed failed (non-critical):', error)
    }
  }

  static async seedDefaultData() {
    try {
      const ingCount = await Ingrediente.countDocuments()
      if (ingCount === 0) {
        console.log('🌱 Seeding ingredients...')
        await Ingrediente.create([
          // BASES
          { _id: 'ing_pan_01', nombre: 'Pan Brioche', emoji: '🍞', precioAdicional: 0, alergenos: ['gluten'], categoria: 'base', stockDisponible: true },
          { _id: 'ing_pan_artesanal', nombre: 'Pan Artesanal', emoji: '🥖', precioAdicional: 2000, alergenos: ['gluten'], categoria: 'base', stockDisponible: true },
          { _id: 'ing_lettuce_wrap', nombre: 'Lettuce Wrap', emoji: '🥬', precioAdicional: 1500, alergenos: [], categoria: 'base', stockDisponible: true },
          { _id: 'ing_tortilla', nombre: 'Tortilla de Harina', emoji: '🫓', precioAdicional: 0, alergenos: ['gluten'], categoria: 'base', stockDisponible: true },
          { _id: 'ing_arroz', nombre: 'Arroz Blanco', emoji: '🍚', precioAdicional: 0, alergenos: [], categoria: 'base', stockDisponible: true },

          // PROTEÍNAS
          { _id: 'ing_carne_01', nombre: 'Carne de Res', emoji: '🥩', precioAdicional: 0, alergenos: [], categoria: 'proteina', stockDisponible: true },
          { _id: 'ing_pollo', nombre: 'Pollo Crispy', emoji: '🍗', precioAdicional: 2000, alergenos: ['gluten'], categoria: 'proteina', stockDisponible: true },
          { _id: 'ing_plant_based', nombre: 'Plant-Based', emoji: '🌱', precioAdicional: 3000, alergenos: ['soja'], categoria: 'proteina', stockDisponible: true },
          { _id: 'ing_cerdo', nombre: 'Cerdo Pulled', emoji: '🥓', precioAdicional: 2500, alergenos: [], categoria: 'proteina', stockDisponible: true },
          { _id: 'ing_salmon', nombre: 'Salmón Grill', emoji: '🐟', precioAdicional: 4000, alergenos: ['pescado'], categoria: 'proteina', stockDisponible: true },

          // ADICIONES GRATUITAS
          { _id: 'ing_lechuga', nombre: 'Lechuga', emoji: '🥬', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
          { _id: 'ing_tomate', nombre: 'Tomate', emoji: '🍅', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
          { _id: 'ing_cebolla', nombre: 'Cebolla', emoji: '🧅', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
          { _id: 'ing_pepinillos', nombre: 'Pepinillos', emoji: '🥒', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
          { _id: 'ing_jalapeno', nombre: 'Jalapeño', emoji: '🌶️', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
          { _id: 'ing_maiz', nombre: 'Maíz', emoji: '🌽', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
          { _id: 'ing_frijoles', nombre: 'Frijoles Negros', emoji: '🫘', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },

          // ADICIONES PREMIUM
          { _id: 'ing_queso', nombre: 'Queso Cheddar', emoji: '🧀', precioAdicional: 1500, alergenos: ['lactosa'], categoria: 'adicion_premium', stockDisponible: true },
          { _id: 'ing_queso_azul', nombre: 'Queso Azul', emoji: '🧀', precioAdicional: 2000, alergenos: ['lactosa'], categoria: 'adicion_premium', stockDisponible: true },
          { _id: 'ing_tocino', nombre: 'Tocino Premium', emoji: '🥓', precioAdicional: 3500, alergenos: [], categoria: 'adicion_premium', stockDisponible: true },
          { _id: 'ing_aguacate', nombre: 'Aguacate', emoji: '🥑', precioAdicional: 2500, alergenos: [], categoria: 'adicion_premium', stockDisponible: true },
          { _id: 'ing_huevo', nombre: 'Huevo Frito', emoji: '🍳', precioAdicional: 2000, alergenos: ['huevos'], categoria: 'adicion_premium', stockDisponible: true },
          { _id: 'ing_papas', nombre: 'Papas Crujientes', emoji: '🍟', precioAdicional: 3000, alergenos: [], categoria: 'adicion_premium', stockDisponible: true },

          // EXTRAS / SALSAS
          { _id: 'ing_salsa_bbq', nombre: 'Salsa BBQ', emoji: '🫗', precioAdicional: 1000, alergenos: ['mostaza'], categoria: 'extra', stockDisponible: true },
          { _id: 'ing_salsa_picante', nombre: 'Salsa Picante', emoji: '🌶️', precioAdicional: 500, alergenos: [], categoria: 'extra', stockDisponible: true },
          { _id: 'ing_mayonesa', nombre: 'Mayonesa', emoji: '🥄', precioAdicional: 500, alergenos: ['huevos'], categoria: 'extra', stockDisponible: true },
          { _id: 'ing_mostaza', nombre: 'Mostaza Miel', emoji: '🟡', precioAdicional: 500, alergenos: ['mostaza'], categoria: 'extra', stockDisponible: true },
          { _id: 'ing_crema', nombre: 'Crema Agria', emoji: '🥛', precioAdicional: 800, alergenos: ['lactosa'], categoria: 'extra', stockDisponible: true },
        ])
        console.log('✅ Ingredients created (28 total)')
      }

      const platCount = await PlatilloPredefinido.countDocuments()
      if (platCount === 0) {
        console.log('🌱 Seeding platillos predefinidos...')
        await PlatilloPredefinido.create([
          {
            _id: 'plat_hamburguesa_clasica',
            nombre: 'Hamburguesa Clásica',
            descripcion: 'Hamburguesa tradicional con carne de res, lechuga, tomate y cebolla',
            precioBase: 12000,
            categoria: 'Hamburguesas',
            composicionPorDefecto: [
              { ingredienteId: 'ing_pan_01', removible: false, esBase: true },
              { ingredienteId: 'ing_carne_01', removible: false, esProteina: true },
              { ingredienteId: 'ing_lechuga', removible: true },
              { ingredienteId: 'ing_tomate', removible: true },
              { ingredienteId: 'ing_cebolla', removible: true },
              { ingredienteId: 'ing_pepinillos', removible: true },
            ],
            adicionesPermitidas: ['ing_queso', 'ing_tocino', 'ing_aguacate', 'ing_huevo', 'ing_papas', 'ing_salsa_bbq', 'ing_salsa_picante', 'ing_mayonesa', 'ing_mostaza', 'ing_queso_azul', 'ing_jalapeno'],
            disponible: true,
            tiempoPreparacion: 15,
          },
          {
            _id: 'plat_hamburguesa_premium',
            nombre: 'Hamburguesa Premium',
            descripcion: 'Hamburguesa gourmet con pan artesanal, queso y tocino',
            precioBase: 18000,
            categoria: 'Hamburguesas',
            composicionPorDefecto: [
              { ingredienteId: 'ing_pan_artesanal', removible: false, esBase: true },
              { ingredienteId: 'ing_carne_01', removible: false, esProteina: true },
              { ingredienteId: 'ing_queso', removible: true },
              { ingredienteId: 'ing_tocino', removible: true },
              { ingredienteId: 'ing_lechuga', removible: true },
              { ingredienteId: 'ing_tomate', removible: true },
            ],
            adicionesPermitidas: ['ing_aguacate', 'ing_huevo', 'ing_papas', 'ing_cebolla', 'ing_pepinillos', 'ing_salsa_bbq', 'ing_salsa_picante', 'ing_mostaza', 'ing_queso_azul', 'ing_jalapeno'],
            disponible: true,
            tiempoPreparacion: 20,
          },
          {
            _id: 'plat_sandwich_pollo',
            nombre: 'Sandwich de Pollo',
            descripcion: 'Pollo crispy con lechuga y tomate en pan brioche',
            precioBase: 13000,
            categoria: 'Sandwiches',
            composicionPorDefecto: [
              { ingredienteId: 'ing_pan_01', removible: false, esBase: true },
              { ingredienteId: 'ing_pollo', removible: false, esProteina: true },
              { ingredienteId: 'ing_lechuga', removible: true },
              { ingredienteId: 'ing_tomate', removible: true },
            ],
            adicionesPermitidas: ['ing_queso', 'ing_tocino', 'ing_aguacate', 'ing_huevo', 'ing_papas', 'ing_cebolla', 'ing_pepinillos', 'ing_salsa_bbq', 'ing_mayonesa', 'ing_mostaza', 'ing_jalapeno'],
            disponible: true,
            tiempoPreparacion: 15,
          },
          {
            _id: 'plat_tacos',
            nombre: 'Tacos de Cerdo',
            descripcion: 'Tacos con cerdo pulled, cebolla y cilantro en tortilla de harina',
            precioBase: 11000,
            categoria: 'Tacos',
            composicionPorDefecto: [
              { ingredienteId: 'ing_tortilla', removible: false, esBase: true },
              { ingredienteId: 'ing_cerdo', removible: false, esProteina: true },
              { ingredienteId: 'ing_cebolla', removible: true },
            ],
            adicionesPermitidas: ['ing_pollo', 'ing_plant_based', 'ing_queso', 'ing_aguacate', 'ing_jalapeno', 'ing_maiz', 'ing_frijoles', 'ing_crema', 'ing_salsa_picante', 'ing_lechuga', 'ing_tomate'],
            disponible: true,
            tiempoPreparacion: 12,
          },
          {
            _id: 'plat_bowl_ensalada',
            nombre: 'Bowl Ensalada',
            descripcion: 'Bowl fresco y saludable con proteína a elección',
            precioBase: 14000,
            categoria: 'Bowls',
            composicionPorDefecto: [
              { ingredienteId: 'ing_lettuce_wrap', removible: false, esBase: true },
              { ingredienteId: 'ing_pollo', removible: false, esProteina: true },
              { ingredienteId: 'ing_tomate', removible: true },
              { ingredienteId: 'ing_aguacate', removible: true },
              { ingredienteId: 'ing_cebolla', removible: true },
              { ingredienteId: 'ing_maiz', removible: true },
            ],
            adicionesPermitidas: ['ing_salmon', 'ing_plant_based', 'ing_carne_01', 'ing_queso_azul', 'ing_huevo', 'ing_frijoles', 'ing_arroz', 'ing_crema', 'ing_salsa_picante', 'ing_mostaza'],
            disponible: true,
            tiempoPreparacion: 10,
          },
          {
            _id: 'plat_bowl_vegetariano',
            nombre: 'Bowl Vegetariano',
            descripcion: 'Bowl 100% vegetal con proteína plant-based y guarniciones frescas',
            precioBase: 13000,
            categoria: 'Bowls',
            composicionPorDefecto: [
              { ingredienteId: 'ing_arroz', removible: false, esBase: true },
              { ingredienteId: 'ing_plant_based', removible: false, esProteina: true },
              { ingredienteId: 'ing_frijoles', removible: true },
              { ingredienteId: 'ing_maiz', removible: true },
              { ingredienteId: 'ing_aguacate', removible: true },
              { ingredienteId: 'ing_tomate', removible: true },
            ],
            adicionesPermitidas: ['ing_pollo', 'ing_huevo', 'ing_queso', 'ing_queso_azul', 'ing_lechuga', 'ing_cebolla', 'ing_jalapeno', 'ing_crema', 'ing_salsa_picante', 'ing_mostaza'],
            disponible: true,
            tiempoPreparacion: 10,
          },
        ])
        console.log('✅ Platillos predefinidos created (6 total)')
      }
    } catch (error) {
      console.warn('⚠️ Data seed failed (non-critical):', error)
    }
  }
}