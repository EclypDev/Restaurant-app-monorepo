# Restaurant App Monorepo

## Descripción Técnica Actualizada
Esta aplicación ha sido refactorizada para implementar una **arquitectura desacoplada** basada en el **Patrón de Repositorio** y **Prisma ORM** con **PostgreSQL**.

### Stack Tecnológico
- **Backend:** Node.js, TypeScript, Express, Prisma ORM, PostgreSQL.
- **Frontend:** React, TypeScript, Vite, Axios, Socket.io-client.
- **Arquitectura:** Monorepo con workspaces de npm, desacoplamiento de capa de datos mediante Repositorios.

### Arquitectura de Datos (Desacoplada)
- La lógica de negocio (Servicios) ya no depende directamente de modelos de base de datos.
- Se utilizan interfaces de repositorio en `backend/src/repositories/interfaces/` que definen los contratos de datos.
- Las implementaciones concretas en `backend/src/repositories/prisma/` manejan la comunicación con PostgreSQL.
- **Cambio de DB:** Para cambiar de base de datos, solo es necesario implementar una nueva clase que cumpla la interfaz del repositorio.

### Configuración
1. **PostgreSQL:** Asegúrate de tener una instancia de Postgres corriendo.
2. **Variables de Entorno:** Copia `backend/.env.example` a `backend/.env` y configura tu `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/restaurante"
   ```
3. **Migraciones:**
   ```bash
   cd backend
   npx prisma migrate dev --name init_schema
   ```
4. **Ejecución:**
   ```bash
   npm run dev
   ```
