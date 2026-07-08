import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer | null = null

export async function connectDatabase(uri?: string): Promise<void> {
  try {
    if (uri && uri !== 'in-memory') {
      await mongoose.connect(uri)
      console.log('✅ MongoDB Atlas/Local connected')
      return
    }

    console.log('📦 Starting in-memory MongoDB (zero install)...')
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    
    await mongoose.connect(mongoUri)
    console.log(`✅ In-memory MongoDB connected: ${mongoUri}`)
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.warn('⚠️ App will run with degraded functionality (no persistence)')
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect()
    if (mongoServer) {
      await mongoServer.stop()
      mongoServer = null
    }
    console.log('🔌 Database disconnected')
  } catch (error) {
    console.error('Error disconnecting database:', error)
  }
}

export { mongoose }
