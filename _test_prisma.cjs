const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/restaurante' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const result = await prisma.orden.create({
      data: {
        mesaId: 'Mesa 2',
        items: [{ platilloId: 'test', nombre: 'Test', cantidad: 1, precioUnitario: 10000 }],
        totalPagar: 10000,
        estado: 'PENDING',
      }
    });
    console.log('CREATE OK:', result.id);
  } catch (e) {
    console.error('CREATE ERROR:', e.message, e.stack);
  }
  await prisma.$disconnect();
}
test();
