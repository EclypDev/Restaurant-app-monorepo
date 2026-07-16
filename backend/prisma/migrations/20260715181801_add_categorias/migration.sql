-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_negocioId_nombre_key" ON "Categoria"("negocioId", "nombre");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default categories for existing negocios
INSERT INTO "Categoria" ("id", "negocioId", "nombre", "orden", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, n.id, c.nombre, c.orden, NOW(), NOW()
FROM "Negocio" n
CROSS JOIN (
  VALUES ('Bebidas', 1), ('Platillos', 2), ('Adicionales', 3)
) AS c(nombre, orden)
ON CONFLICT ("negocioId", "nombre") DO NOTHING;
