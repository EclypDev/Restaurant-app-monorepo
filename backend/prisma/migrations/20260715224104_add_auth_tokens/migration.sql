-- AlterTable
ALTER TABLE "Ingrediente" ALTER COLUMN "negocioId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Mesa" ALTER COLUMN "negocioId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Orden" ALTER COLUMN "negocioId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Platillo" ALTER COLUMN "negocioId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Resena" ALTER COLUMN "negocioId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "negocioId" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
