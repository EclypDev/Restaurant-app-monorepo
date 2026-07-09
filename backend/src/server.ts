import './config/env'
import express, { Application, Request, Response } from 'express'
console.log("¡DEBUG: EL SERVIDOR ESTA ARRANCANDO!")
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
// import { connectDatabase } from './config/database'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { SeedService } from './services/seed.service'

import menuRoutes from './routes/menu.routes'
import platillosRoutes from './routes/platillos.routes'
import orderRoutes from './routes/order.routes'
import authRoutes from './routes/auth.routes'
import tableRoutes from './routes/table.routes'
import inventoryRoutes from './routes/inventory.routes'
import recommendationsRoutes from './routes/recommendations.routes'
import reviewRoutes from './routes/review.routes'
import paymentRoutes from './routes/payment.routes'

dotenv.config()

const app: Application = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(morgan('dev'))

// Health check endpoint (always available, even without DB)
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: process.env.MONGODB_URI ? 'configured' : 'in-memory',
  })
})

// Routes
app.get('/test', (req, res) => res.json({ message: 'working' }))
app.use('/api/menu', menuRoutes)
app.use('/api/platillos', platillosRoutes)
app.use('/api/pedidos', orderRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/mesas', tableRoutes)
app.use('/api/inventario', inventoryRoutes)
app.use('/api/recomendaciones', recommendationsRoutes)
app.use('/api/resenas', reviewRoutes)
app.use('/api/pago', paymentRoutes)

// 404 handler (must be after all routes)
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
})

// WebSocket connections
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  socket.on('join-kitchen', () => {
    socket.join('kitchen')
    console.log(`👨‍🍳 Client joined kitchen room: ${socket.id}`)
  })

  socket.on('join-meseros', () => {
    socket.join('meseros')
    console.log(`🧑‍🍳 Client joined meseros room: ${socket.id}`)
  })

  socket.on('join-table', (tableId: string) => {
    socket.join(`table-${tableId}`)
    console.log(`📱 Client joined table-${tableId}: ${socket.id}`)
  })

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})

// Make io available in routes
app.set('io', io)

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...')
  server.close(async () => {
  // const { disconnectDatabase } = await import('./config/database')
  // await disconnectDatabase()
    process.exit(0)
  })
})

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason)
})

// Start server
const PORT = process.env.PORT || 4000

async function start() {
  // await connectDatabase(process.env.MONGODB_URI || 'in-memory')
  await SeedService.seedDefaultUsers()
  await SeedService.seedDefaultData()
  
  server.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`)
    console.log(`📡 Health check: http://localhost:${PORT}/health`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

// Trigger nodemon restart
