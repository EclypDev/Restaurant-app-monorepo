# 🍽️ Restaurant App - Sistema de Pedidos por QR

Sistema de pedidos autoservicio para restaurantes con escaneo QR, personalización de platillos y actualización en tiempo real para cocina.

## 🏗️ Arquitectura

```
+-------------------+     +-------------------+     +-------------------+
|   Cliente (Mesa)  |     |  Cocina (TV/PC)   |     |  Admin (Gestión)  |
|   - Menú QR       |     |  - Tiempo Real    |     |  - CRUD Menú      |
|   - Carrito       |     |  - Órdenes        |     |  - Mesas/QRs      |
+--------+----------+     +--------+----------+     +--------+----------+
         |                          |                        |
         +--------------------------+------------------------+
                                    |
                          +---------v---------+
                          |   Backend (API)   |
                          |   - REST + WS     |
                          +---------+---------+
                                    |
                          +---------v---------+
                          |   MongoDB         |
                          +-------------------+
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- MongoDB (local o Atlas)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/EclypDev/Restaurant-app-monorepo.git
cd Restaurant-app-monorepo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tu MongoDB URI
```

### Desarrollo

```bash
# Ejecutar backend y frontend simultáneamente
npm run dev

# O por separado:
npm run dev:backend  # Puerto 4000
npm run dev:frontend # Puerto 3000
```

## 📁 Estructura

```
Restaurant-app-monorepo/
├── backend/
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth middleware
│   │   └── server.js      # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Route pages
│   │   ├── store/         # Zustand stores
│   │   ├── context/       # React context
│   │   └── styles/        # CSS files
│   └── package.json
├── shared/                # Shared constants
└── package.json           # Root workspace
```

## 🔑 Rutas Principales

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/menu?mesa=Mesa_01` | Menú del cliente | Público |
| `/order/:orderId` | Tracking de orden | Público |
| `/cocina` | Dashboard de cocina | Protegido |
| `/admin` | Panel de administración | Admin |
| `/login` | Autenticación | Público |

## 🔧 Variables de Entorno

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/restaurant-app
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## 📡 WebSocket Events

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `nueva-orden-cocina` | Server → Kitchen | Nueva orden creada |
| `orden-actualizada` | Server → All | Cambio de estado |
| `join-kitchen` | Client → Server | Unirse a sala cocina |
| `join-table` | Client → Server | Unirse a mesa específica |

## 🎨 Features

- ✅ Escaneo QR por mesa
- ✅ Personalización de platillos
- ✅ Carrito dinámico con precios
- ✅ Tiempo real con Socket.io
- ✅ Dashboard de cocina
- ✅ Panel admin con CRUD
- ✅ Generador de QRs
- ✅ Tracking de órdenes
- ✅ Autenticación JWT

## 🚀 Deploy

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Servir dist/ con nginx, vercel, etc.
```

## 📝 Licencia

MIT
