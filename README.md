# 🍽️ Restaurant App - Sistema de Pedidos por QR

Sistema de pedidos autoservicio para restaurantes con escaneo QR, personalización visual de platillos, inventario en tiempo real y flujo completo de pago.

## 🏗️ Arquitectura

```
+-------------------+     +-------------------+     +-------------------+
|   Cliente (Mesa)  |     |  Cocina (TV/PC)   |     |  Admin (Gestión)  |
|   - Menú QR       |     |  - Tiempo Real    |     |  - CRUD Menú      |
|   - Visual Creator|     |  - Semáforo Timer |     |  - Mesas/QRs      |
|   - Allergen Filter|    |  - Inventory Ctrl |     |  - Inventario     |
+--------+----------+     +--------+----------+     +--------+----------+
         |                          |                        |
         +--------------------------+------------------------+
                                    |
                    +---------------v---------------+
                    |   Backend (API + WebSocket)   |
                    |   - REST + Socket.io          |
                    |   - Thermal Printer (ESC/POS) |
                    +---------------+---------------+
                                    |
                    +---------------v---------------+
                    |   MongoDB + Real-time Sync    |
                    +-------------------------------+
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- MongoDB (local o Atlas)

### Instalación

```bash
git clone https://github.com/EclypDev/Restaurant-app-monorepo.git
cd Restaurant-app-monorepo
npm install

cp backend/.env.example backend/.env
# Editar backend/.env con tu MongoDB URI
```

### Desarrollo

```bash
npm run dev
# Backend: http://localhost:4000
# Frontend: http://localhost:3000
```

## 📁 Estructura

```
Restaurant-app-monorepo/
├── backend/
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth middleware
│   │   ├── services/      # Printer service
│   │   └── server.js      # Entry point + WebSocket
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
| `/order/:orderId` | Tracking + Pago + Reseñas | Público |
| `/cocina` | Dashboard cocina + semáforo | Protegido |
| `/meseros` | Solicitudes de pago/mesero | Protegido |
| `/admin` | Panel completo | Admin |
| `/login` | Autenticación | Público |

## 🎨 Features Implementadas

### 1. 🖼️ Creador Visual de Platillos
- Renderizado por capas PNG superpuestas
- Cada ingrediente activa una capa visual
- Posición, escala y z-index configurables

### 2. 🚫 Filtros de Alérgenos
- 10 alérgenos predefinidos (gluten, lactosa, etc.)
- Filtrado instantáneo sin recargar
- Ingredientes agotados se deshabilitan automáticamente

### 3. 🛒 Upselling Inteligente
- Recomendaciones basadas en items relacionados
- Carrusel en el carrito con "Combina con tu pedido"
- Productos populares como fallback

### 4. 📦 Inventario en Tiempo Real
- WebSocket broadcast al marcar ingrediente agotado
- Actualización reactiva en todas las pantallas
- Control de stock por unidad

### 5. ⏱️ Semáforo de Cocina
- 🟢 Verde: < 10 minutos
- 🟡 Amarillo: 10-20 minutos
- 🔴 Rojo: > 20 minutos (parpadeo de alerta)

### 6. 💳 Flujo de Pago Unificado
- Botón "Pedir Cuenta" con selección de método
- Notificación WebSocket a meseros
- Impresión automática de ticket (ESC/POS)

### 7. 🙋 Llamar Mesero
- Alerta sonora y visual en pantalla de meseros
- Tracking de solicitudes atendidas

### 8. ⭐ Reseñas Ocultas
- 4-5 estrellas → Redirect a Google Maps
- 1-3 estrellas → Feedback interno silencioso
- Alerta automática al admin por malas reseñas

### 9. 🖨️ Impresión Térmica
- Integración directa con impresoras ESC/POS
- Comandas de cocina automáticas
- Recibos de pago

## 📡 WebSocket Events

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `nueva-orden-cocina` | Server → Kitchen | Nueva orden |
| `orden-actualizada` | Server → All | Cambio de estado |
| `ingrediente-agotado` | Server → All | Ingrediente sin stock |
| `ingrediente-disponible` | Server → All | Ingrediente disponible |
| `solicitud-pago` | Server → Meseros | Cliente pide cuenta |
| `solicitud-mesero` | Server → Meseros | Cliente llama mesero |
| `resena-nueva` | Server → Admin | Alerta mala reseña |

## 🔧 Variables de Entorno

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/restaurant-app
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Printer (opcional)
PRINTER_ENABLED=true
PRINTER_HOST=192.168.1.100
PRINTER_PORT=9100
```

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
