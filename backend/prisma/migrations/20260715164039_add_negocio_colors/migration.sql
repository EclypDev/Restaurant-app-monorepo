-- Add color fields to Negocio
ALTER TABLE "Negocio" ADD COLUMN "colorPrimario" TEXT NOT NULL DEFAULT '#ff6b35';
ALTER TABLE "Negocio" ADD COLUMN "colorFondo" TEXT NOT NULL DEFAULT '#0a0e17';
