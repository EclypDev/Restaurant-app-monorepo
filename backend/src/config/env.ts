import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurante'
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
