import type {
  OrderStatus,
  UserRole,
  PaymentMethod,
  ReviewCategory,
  TimeUnit,
  Alergeno,
} from './enums'

export interface IOptionItem {
  nombre: string
  precioExtra: number
  disponible: boolean
  ingredienteId?: string
  alergenos?: Alergeno[]
}

export interface IOptionGroup {
  grupo: string
  maxSeleccion: number
  minSeleccion?: number
  items: IOptionItem[]
}

export interface IVisualLayer {
  ingredienteId: string
  imagenUrl: string
  posicion: { x: number; y: number; z: number }
  escala?: number
}

export interface IPlatillo {
  _id: string
  nombre: string
  descripcion?: string
  precioBase: number
  imagenUrl?: string
  categoria: string
  disponible: boolean
  personalizable: boolean
  opcionesSeleccionables?: IOptionGroup[]
  tiempoPreparacion?: number
  alergenos?: Alergeno[]
  itemsRelacionados?: string[]
  capasVisuales?: IVisualLayer[]
  imagenBase?: string
  restauranteId?: string
  createdAt: string
  updatedAt: string
}

export interface IEleccionUsuario {
  grupo: string
  seleccionado: string[]
}

export interface IOrderItem {
  platilloId: string
  nombre: string
  cantidad: number
  precioUnitario: number
  eleccionUsuario?: IEleccionUsuario[]
  notasEspeciales?: string
}

export interface ISolicitudPago {
  activo: boolean
  tipo?: PaymentMethod
  solicitadoAt?: string
  atendidoAt?: string
}

export interface IOrden {
  _id: string
  mesaId: string
  estado: OrderStatus
  items: IOrderItem[]
  totalPagar: number
  restauranteId?: string
  entregadoAt?: string
  solicitudPago?: ISolicitudPago
  metodoPago?: PaymentMethod
  pagado: boolean
  pagadoAt?: string
  createdAt: string
  updatedAt: string
}

export interface IIngrediente {
  _id: string
  nombre: string
  categoria?: string
  disponible: boolean
  stock: number
  unidad: TimeUnit
  alergenos?: Alergeno[]
  imagenUrl?: string
  restauranteId?: string
  createdAt: string
  updatedAt: string
}

export interface IUsuario {
  _id: string
  nombre: string
  email: string
  rol: UserRole
  restauranteId?: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface IMesa {
  _id: string
  numero: string
  nombre?: string
  capacidad?: number
  activa: boolean
  qrCode?: string
  restauranteId?: string
  createdAt: string
  updatedAt: string
}

export interface IResena {
  _id: string
  mesaId: string
  ordenId?: string
  estrellas: number
  comentario?: string
  categoria?: ReviewCategory
  esPublica: boolean
  resuelto: boolean
  respuestaAdmin?: string
  restauranteId?: string
  createdAt: string
  updatedAt: string
}

export interface IAuthResponse {
  token: string
  user: {
    id: string
    nombre: string
    email: string
    rol: UserRole
  }
}

export interface ICartItem extends IOrderItem {
  index?: number
}

export interface IRecomendacion extends IPlatillo {
  motivo: string
}

export interface ISolicitudPagoEvent {
  mesaId: string
  tipoPago: PaymentMethod
  ordenId: string
  total: number
}

export interface ISolicitudMeseroEvent {
  mesaId: string
  motivo: string
  timestamp: string
}

export interface IIngredienteUpdateEvent {
  id: string
  nombre: string
  disponible: boolean
  stock: number
}

export interface IResenaEvent {
  mesaId: string
  estrellas: number
  comentario?: string
  alerta: boolean
}

export interface ISemaphoreColor {
  verde: 'verde'
  amarillo: 'amarillo'
  rojo: 'rojo'
}

export interface IErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export interface IApiError {
  message: string
  status?: number
  code?: string
}

export interface IApiResponse<T> {
  success: boolean
  data?: T
  error?: IApiError
}
