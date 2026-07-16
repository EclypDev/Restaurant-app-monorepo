import type {
  OrderStatus,
  OrderSource,
  UserRole,
  TokenType,
  PaymentMethod,
  ReviewCategory,
  TimeUnit,
  Alergeno,
  IngredienteCategoria,
} from './enums'

export type { Alergeno } from './enums'
export type { IngredienteCategoria } from './enums'

export interface IRegistroSaaSRequest {
  negocioNombre: string
  slug: string
  adminNombre: string
  email: string
  password: string
}

export interface ISolicitarRecuperacionRequest {
  email: string
}

export interface IRestablecerPasswordRequest {
  token: string
  nuevaPassword: string
}

export interface IVerificarCorreoRequest {
  token: string
}

export interface IAdicional {
  id: string
  nombre: string
  precio: number
  cantidad?: number
}

export interface IIngrediente {
  _id: string
  id: string
  nombre: string
  emoji: string
  precioAdicional: number
  alergenos: Alergeno[]
  categoria: IngredienteCategoria
  stockDisponible: boolean
  capaImagenUrl?: string
  restauranteId?: string
  createdAt: string
  updatedAt: string
}

export interface IComposicionDefault {
  ingredienteId: string
  removible: boolean
  esBase?: boolean
  esProteina?: boolean
  descuento?: number
}

export interface IPlatilloPredefinido {
  _id: string
  nombre: string
  descripcion?: string
  precioBase: number
  imagenPredefinidaUrl?: string
  categoria: string
  composicionPorDefecto: IComposicionDefault[]
  adicionesPermitidas: string[]
  disponible: boolean
  tiempoPreparacion?: number
  restauranteId?: string
  createdAt: string
  updatedAt: string
}

export interface IInstruccionesCocina {
  QUITAR: Array<{ ingredienteId: string; nombre: string }>
  ANADIR_O_EXTRA: Array<{ ingredienteId: string; nombre: string; precioCobrado: number }>
  MANTENER_BASE: Array<{ ingredienteId: string; nombre: string }>
}

export interface IEstructuraPlatoFinal {
  platilloOriginalId: string
  nombreMenu: string
  precioFinalCobrado: number
  instruccionesCocina: IInstruccionesCocina
}

export interface IOrderItemExtended {
  platilloId: string
  nombre: string
  cantidad: number
  precioUnitario: number
  eleccionUsuario?: Array<{ grupo: string; seleccionado: string[] }>
  notasEspeciales?: string
  estructuraPlatoFinal?: IEstructuraPlatoFinal
}

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
  composicionPorDefecto?: IComposicionDefault[]
  adicionesPermitidas?: string[]
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
  estructuraPlatoFinal?: IEstructuraPlatoFinal
  notas?: string
  adicionales?: IAdicional[]
}

export interface ISolicitudPago {
  activo: boolean
  tipo?: PaymentMethod
  solicitadoAt?: string
  atendidoAt?: string
}

export interface IOrden {
  id: string
  negocioId: string
  mesaId: string
  estado: OrderStatus
  origen: OrderSource
  orderNumber: string
  items: IOrderItem[]
  totalPagar: number
  usuarioId?: string
  usuarioNombre?: string
  restauranteId?: string
  solicitudPago?: ISolicitudPago
  metodoPago?: PaymentMethod
  pagado: boolean
  pagadoAt?: string | Date
  createdAt: string | Date
  updatedAt: string | Date
}

export interface IIngredienteOld {
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
