import { prisma } from '../config/prisma'
import bcrypt from 'bcryptjs'

export class SeedService {
  static async seedDefaultUsers() {
    try {
      const count = await prisma.usuario.count()
      if (count === 0) {
        console.log('🌱 Seeding default users...')
        const hashedPasswordAdmin = await bcrypt.hash('admin123', 10)
        const hashedPasswordCocina = await bcrypt.hash('cocina123', 10)
        const hashedPasswordMesero = await bcrypt.hash('mesero123', 10)

        await prisma.usuario.createMany({
          data: [
            { nombre: 'Administrador', email: 'admin@restaurante.com', password: hashedPasswordAdmin, rol: 'admin', negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28', emailVerificado: true },
            { nombre: 'Cocina', email: 'cocina@restaurante.com', password: hashedPasswordCocina, rol: 'cocina', negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28', emailVerificado: true },
            { nombre: 'Mesero', email: 'mesero@restaurante.com', password: hashedPasswordMesero, rol: 'mesero', negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28', emailVerificado: true },
          ]
        })
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
      const ingCount = await prisma.ingrediente.count()
      if (ingCount === 0) {
        console.log('🌱 Seeding ingredients...')
        await prisma.ingrediente.createMany({
          data: [
            // BASES
            { id: 'ing_pan_01', nombre: 'Pan Brioche', emoji: '🍞', precioAdicional: 0, alergenos: ['gluten'], categoria: 'base', stockDisponible: true },
            { id: 'ing_pan_artesanal', nombre: 'Pan Artesanal', emoji: '🥖', precioAdicional: 2000, alergenos: ['gluten'], categoria: 'base', stockDisponible: true },
            { id: 'ing_lettuce_wrap', nombre: 'Lettuce Wrap', emoji: '🥬', precioAdicional: 1500, alergenos: [], categoria: 'base', stockDisponible: true },
            { id: 'ing_tortilla', nombre: 'Tortilla de Harina', emoji: '🫓', precioAdicional: 0, alergenos: ['gluten'], categoria: 'base', stockDisponible: true },
            { id: 'ing_arroz', nombre: 'Arroz Blanco', emoji: '🍚', precioAdicional: 0, alergenos: [], categoria: 'base', stockDisponible: true },

            // PROTEÍNAS
            { id: 'ing_carne_01', nombre: 'Carne de Res', emoji: '🥩', precioAdicional: 0, alergenos: [], categoria: 'proteina', stockDisponible: true },
            { id: 'ing_pollo', nombre: 'Pollo Crispy', emoji: '🍗', precioAdicional: 2000, alergenos: ['gluten'], categoria: 'proteina', stockDisponible: true },
            { id: 'ing_plant_based', nombre: 'Plant-Based', emoji: '🌱', precioAdicional: 3000, alergenos: ['soja'], categoria: 'proteina', stockDisponible: true },
            { id: 'ing_cerdo', nombre: 'Cerdo Pulled', emoji: '🥓', precioAdicional: 2500, alergenos: [], categoria: 'proteina', stockDisponible: true },
            { id: 'ing_salmon', nombre: 'Salmón Grill', emoji: '🐟', precioAdicional: 4000, alergenos: ['pescado'], categoria: 'proteina', stockDisponible: true },

            // ADICIONES GRATUITAS
            { id: 'ing_lechuga', nombre: 'Lechuga', emoji: '🥬', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
            { id: 'ing_tomate', nombre: 'Tomate', emoji: '🍅', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
            { id: 'ing_cebolla', nombre: 'Cebolla', emoji: '🧅', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
            { id: 'ing_pepinillos', nombre: 'Pepinillos', emoji: '🥒', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
            { id: 'ing_jalapeno', nombre: 'Jalapeño', emoji: '🌶️', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
            { id: 'ing_maiz', nombre: 'Maíz', emoji: '🌽', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },
            { id: 'ing_frijoles', nombre: 'Frijoles Negros', emoji: '🫘', precioAdicional: 0, alergenos: [], categoria: 'adicion_gratuita', stockDisponible: true },

            // ADICIONES PREMIUM
            { id: 'ing_queso', nombre: 'Queso Cheddar', emoji: '🧀', precioAdicional: 1500, alergenos: ['lactosa'], categoria: 'adicion_premium', stockDisponible: true },
            { id: 'ing_queso_azul', nombre: 'Queso Azul', emoji: '🧀', precioAdicional: 2000, alergenos: ['lactosa'], categoria: 'adicion_premium', stockDisponible: true },
            { id: 'ing_tocino', nombre: 'Tocino Premium', emoji: '🥓', precioAdicional: 3500, alergenos: [], categoria: 'adicion_premium', stockDisponible: true },
            { id: 'ing_aguacate', nombre: 'Aguacate', emoji: '🥑', precioAdicional: 2500, alergenos: [], categoria: 'adicion_premium', stockDisponible: true },
            { id: 'ing_huevo', nombre: 'Huevo Frito', emoji: '🍳', precioAdicional: 2000, alergenos: ['huevos'], categoria: 'adicion_premium', stockDisponible: true },
            { id: 'ing_papas', nombre: 'Papas Crujientes', emoji: '🍟', precioAdicional: 3000, alergenos: [], categoria: 'adicion_premium', stockDisponible: true },

            // EXTRAS / SALSAS
            { id: 'ing_salsa_bbq', nombre: 'Salsa BBQ', emoji: '🫗', precioAdicional: 1000, alergenos: ['mostaza'], categoria: 'extra', stockDisponible: true },
            { id: 'ing_salsa_picante', nombre: 'Salsa Picante', emoji: '🌶️', precioAdicional: 500, alergenos: [], categoria: 'extra', stockDisponible: true },
            { id: 'ing_mayonesa', nombre: 'Mayonesa', emoji: '🥄', precioAdicional: 500, alergenos: ['huevos'], categoria: 'extra', stockDisponible: true },
            { id: 'ing_mostaza', nombre: 'Mostaza Miel', emoji: '🟡', precioAdicional: 500, alergenos: ['mostaza'], categoria: 'extra', stockDisponible: true },
            { id: 'ing_crema', nombre: 'Crema Agria', emoji: '🥛', precioAdicional: 800, alergenos: ['lactosa'], categoria: 'extra', stockDisponible: true },
          ].map(i => ({ ...i, negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28' }))
        })
        console.log('✅ Ingredients created (28 total)')
      }

      const platCount = await prisma.platillo.count()
      if (platCount === 0) {
        console.log('🌱 Seeding platillos predefinidos...')
        await prisma.platillo.create({
          data: {
            id: 'plat_hamburguesa_clasica',
            negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
            nombre: 'Hamburguesa Clásica',
            descripcion: 'Hamburguesa tradicional con carne de res, lechuga, tomate y cebolla',
            precioBase: 12000,
            categoria: 'Hamburguesas',
            personalizable: true,
            composicionPorDefecto: [
              { ingredienteId: 'ing_pan_01', removible: true, esBase: true, descuento: 2000 },
              { ingredienteId: 'ing_carne_01', removible: true, esProteina: true, descuento: 4000 },
              { ingredienteId: 'ing_lechuga', removible: true, descuento: 500 },
              { ingredienteId: 'ing_tomate', removible: true, descuento: 500 },
              { ingredienteId: 'ing_cebolla', removible: true, descuento: 500 },
              { ingredienteId: 'ing_pepinillos', removible: true, descuento: 500 },
            ] as any,
            adicionesPermitidas: ['ing_queso', 'ing_tocino', 'ing_aguacate', 'ing_huevo', 'ing_papas', 'ing_salsa_bbq', 'ing_salsa_picante', 'ing_mayonesa', 'ing_mostaza', 'ing_queso_azul', 'ing_jalapeno'] as any,
            disponible: true,
            tiempoPreparacion: 15,
          }
        })
        await prisma.platillo.create({
          data: {
            id: 'plat_hamburguesa_premium',
            negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
            nombre: 'Hamburguesa Premium',
            descripcion: 'Hamburguesa gourmet con pan artesanal, queso y tocino',
            precioBase: 18000,
            categoria: 'Hamburguesas',
            personalizable: true,
            composicionPorDefecto: [
              { ingredienteId: 'ing_pan_artesanal', removible: true, esBase: true, descuento: 2000 },
              { ingredienteId: 'ing_carne_01', removible: true, esProteina: true, descuento: 4000 },
              { ingredienteId: 'ing_queso', removible: true, descuento: 1500 },
              { ingredienteId: 'ing_tocino', removible: true, descuento: 3500 },
              { ingredienteId: 'ing_lechuga', removible: true, descuento: 500 },
              { ingredienteId: 'ing_tomate', removible: true, descuento: 500 },
            ] as any,
            adicionesPermitidas: ['ing_aguacate', 'ing_huevo', 'ing_papas', 'ing_cebolla', 'ing_pepinillos', 'ing_salsa_bbq', 'ing_salsa_picante', 'ing_mostaza', 'ing_queso_azul', 'ing_jalapeno'] as any,
            disponible: true,
            tiempoPreparacion: 20,
          }
        })
        await prisma.platillo.create({
          data: {
            id: 'plat_sandwich_pollo',
            negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
            nombre: 'Sandwich de Pollo',
            descripcion: 'Pollo crispy con lechuga y tomate en pan brioche',
            precioBase: 13000,
            categoria: 'Sandwiches',
            personalizable: true,
            composicionPorDefecto: [
              { ingredienteId: 'ing_pan_01', removible: true, esBase: true, descuento: 2000 },
              { ingredienteId: 'ing_pollo', removible: true, esProteina: true, descuento: 3000 },
              { ingredienteId: 'ing_lechuga', removible: true, descuento: 500 },
              { ingredienteId: 'ing_tomate', removible: true, descuento: 500 },
            ] as any,
            adicionesPermitidas: ['ing_queso', 'ing_tocino', 'ing_aguacate', 'ing_huevo', 'ing_papas', 'ing_cebolla', 'ing_pepinillos', 'ing_salsa_bbq', 'ing_mayonesa', 'ing_mostaza', 'ing_jalapeno'] as any,
            disponible: true,
            tiempoPreparacion: 15,
          }
        })
        await prisma.platillo.create({
          data: {
            id: 'plat_tacos',
            negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
            nombre: 'Tacos de Cerdo',
            descripcion: 'Tacos con cerdo pulled, cebolla y cilantro en tortilla de harina',
            precioBase: 11000,
            categoria: 'Tacos',
            personalizable: true,
            composicionPorDefecto: [
              { ingredienteId: 'ing_tortilla', removible: true, esBase: true, descuento: 1500 },
              { ingredienteId: 'ing_cerdo', removible: true, esProteina: true, descuento: 3500 },
              { ingredienteId: 'ing_cebolla', removible: true, descuento: 500 },
            ] as any,
            adicionesPermitidas: ['ing_pollo', 'ing_plant_based', 'ing_queso', 'ing_aguacate', 'ing_jalapeno', 'ing_maiz', 'ing_frijoles', 'ing_crema', 'ing_salsa_picante', 'ing_lechuga', 'ing_tomate'] as any,
            disponible: true,
            tiempoPreparacion: 12,
          }
        })
        await prisma.platillo.create({
          data: {
            id: 'plat_bowl_ensalada',
            negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
            nombre: 'Bowl Ensalada',
            descripcion: 'Bowl fresco y saludable con proteína a elección',
            precioBase: 14000,
            categoria: 'Bowls',
            personalizable: true,
            composicionPorDefecto: [
              { ingredienteId: 'ing_lettuce_wrap', removible: true, esBase: true, descuento: 1500 },
              { ingredienteId: 'ing_pollo', removible: true, esProteina: true, descuento: 3000 },
              { ingredienteId: 'ing_tomate', removible: true, descuento: 500 },
              { ingredienteId: 'ing_aguacate', removible: true, descuento: 2500 },
              { ingredienteId: 'ing_cebolla', removible: true, descuento: 500 },
              { ingredienteId: 'ing_maiz', removible: true, descuento: 500 },
            ] as any,
            adicionesPermitidas: ['ing_salmon', 'ing_plant_based', 'ing_carne_01', 'ing_queso_azul', 'ing_huevo', 'ing_frijoles', 'ing_arroz', 'ing_crema', 'ing_salsa_picante', 'ing_mostaza'] as any,
            disponible: true,
            tiempoPreparacion: 10,
          }
        })
        await prisma.platillo.create({
          data: {
            id: 'plat_bowl_vegetariano',
            negocioId: 'ce36eb74-8f9a-4256-9519-08fd14e5be28',
            nombre: 'Bowl Vegetariano',
            descripcion: 'Bowl 100% vegetal con proteína plant-based y guarniciones frescas',
            precioBase: 13000,
            categoria: 'Bowls',
            personalizable: true,
            composicionPorDefecto: [
              { ingredienteId: 'ing_arroz', removible: true, esBase: true, descuento: 2000 },
              { ingredienteId: 'ing_plant_based', removible: true, esProteina: true, descuento: 3500 },
              { ingredienteId: 'ing_frijoles', removible: true, descuento: 1000 },
              { ingredienteId: 'ing_maiz', removible: true, descuento: 500 },
              { ingredienteId: 'ing_aguacate', removible: true, descuento: 2500 },
              { ingredienteId: 'ing_tomate', removible: true, descuento: 500 },
            ] as any,
            adicionesPermitidas: ['ing_pollo', 'ing_huevo', 'ing_queso', 'ing_queso_azul', 'ing_lechuga', 'ing_cebolla', 'ing_jalapeno', 'ing_crema', 'ing_salsa_picante', 'ing_mostaza'] as any,
            disponible: true,
            tiempoPreparacion: 10,
          }
        })
        console.log('✅ Platillos predefinidos created (6 total)')
      }
    } catch (error) {
      console.warn('⚠️ Data seed failed (non-critical):', error)
    }
  }
}