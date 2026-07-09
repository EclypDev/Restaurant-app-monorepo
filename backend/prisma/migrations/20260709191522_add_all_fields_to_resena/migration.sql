/*
  Warnings:

  - Added the required column `mesaId` to the `Resena` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resena" ADD COLUMN     "categoria" TEXT,
ADD COLUMN     "esPublica" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mesaId" TEXT NOT NULL,
ADD COLUMN     "respuestaAdmin" TEXT,
ALTER COLUMN "ordenId" DROP NOT NULL;
