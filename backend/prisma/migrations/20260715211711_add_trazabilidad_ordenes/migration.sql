-- AlterTable: add columns as nullable first
ALTER TABLE "Orden" ADD COLUMN "orderNumber" TEXT;
ALTER TABLE "Orden" ADD COLUMN "origen" TEXT NOT NULL DEFAULT 'QR_CLIENTE';
ALTER TABLE "Orden" ADD COLUMN "usuarioId" TEXT;
ALTER TABLE "Orden" ADD COLUMN "usuarioNombre" TEXT;

-- Assign order numbers to existing rows
UPDATE "Orden" SET "orderNumber" = sub.num
FROM (
  SELECT id, CONCAT('#', LPAD(CAST(ROW_NUMBER() OVER (ORDER BY "createdAt") AS TEXT), 4, '0')) AS num
  FROM "Orden"
) sub
WHERE "Orden".id = sub.id;

-- Make orderNumber NOT NULL now that all rows have values
ALTER TABLE "Orden" ALTER COLUMN "orderNumber" SET NOT NULL;
