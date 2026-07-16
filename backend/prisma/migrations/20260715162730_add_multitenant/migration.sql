-- Step 1: Create Negocio table
CREATE TABLE "Negocio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Negocio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Negocio_slug_key" ON "Negocio"("slug");

-- Step 2: Create a default negocio for existing data
INSERT INTO "Negocio" ("id", "nombre", "slug", "createdAt", "updatedAt")
VALUES ('default-negocio', 'FuegoRojo', 'fuegorojo', NOW(), NOW());

-- Step 3: Add negocioId to existing tables (nullable first)
ALTER TABLE "Usuario" ADD COLUMN "negocioId" TEXT DEFAULT 'default-negocio';
ALTER TABLE "Mesa" ADD COLUMN "negocioId" TEXT DEFAULT 'default-negocio';
ALTER TABLE "Platillo" ADD COLUMN "negocioId" TEXT DEFAULT 'default-negocio';
ALTER TABLE "Ingrediente" ADD COLUMN "negocioId" TEXT DEFAULT 'default-negocio';
ALTER TABLE "Orden" ADD COLUMN "negocioId" TEXT DEFAULT 'default-negocio';
ALTER TABLE "Resena" ADD COLUMN "negocioId" TEXT DEFAULT 'default-negocio';

-- Step 4: Make negocioId NOT NULL now that all rows have values
ALTER TABLE "Usuario" ALTER COLUMN "negocioId" SET NOT NULL;
ALTER TABLE "Mesa" ALTER COLUMN "negocioId" SET NOT NULL;
ALTER TABLE "Platillo" ALTER COLUMN "negocioId" SET NOT NULL;
ALTER TABLE "Ingrediente" ALTER COLUMN "negocioId" SET NOT NULL;
ALTER TABLE "Orden" ALTER COLUMN "negocioId" SET NOT NULL;
ALTER TABLE "Resena" ALTER COLUMN "negocioId" SET NOT NULL;

-- Step 5: Remove global unique constraints and add tenant-scoped ones
DROP INDEX IF EXISTS "Mesa_numero_key";
DROP INDEX IF EXISTS "Usuario_email_key";

CREATE UNIQUE INDEX "Mesa_negocioId_numero_key" ON "Mesa"("negocioId", "numero");
CREATE UNIQUE INDEX "Usuario_email_negocioId_key" ON "Usuario"("email", "negocioId");

-- Step 6: Add foreign key constraints
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Mesa" ADD CONSTRAINT "Mesa_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Platillo" ADD CONSTRAINT "Platillo_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ingrediente" ADD CONSTRAINT "Ingrediente_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Orden" ADD CONSTRAINT "Orden_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
