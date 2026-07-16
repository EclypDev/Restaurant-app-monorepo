export enum OrderStatus {
  PENDING = 'PENDIENTE',
  IN_PREPARATION = 'EN_PREPARACION',
  LISTO = 'LISTO',
  DELIVERED = 'ENTREGADO',
  PAGADO = 'PAGADO',
  CANCELLED = 'CANCELADO',
}

export enum OrderSource {
  QR_CLIENTE = 'QR_CLIENTE',
  MESERO_APP = 'MESERO_APP',
}

export enum UserRole {
  ADMIN = 'admin',
  KITCHEN = 'cocina',
  WAITER = 'mesero',
}

export enum TokenType {
  VERIFICACION_EMAIL = 'VERIFICACION_EMAIL',
  RECUPERACION_PASSWORD = 'RECUPERACION_PASSWORD',
}

export enum PaymentMethod {
  CASH = 'EFECTIVO',
  CARD = 'TARJETA',
  TRANSFER = 'TRANSFERENCIA',
}

export enum ReviewCategory {
  SERVICE = 'servicio',
  FOOD = 'comida',
  CLEANLINESS = 'limpieza',
  AMBIANCE = 'ambiente',
  OTHER = 'otro',
}

export enum TimeUnit {
  KG = 'kg',
  GRAMS = 'g',
  LITERS = 'L',
  MILLILITERS = 'ml',
  UNIT = 'unidad',
  PORTION = 'porcion',
}

export const ALERGENOS = [
  'gluten',
  'lactosa',
  'huevos',
  'frutos_secos',
  'soja',
  'mariscos',
  'pescado',
  'mostaza',
  'sesamo',
  'sulfitos',
] as const

export type Alergeno = typeof ALERGENOS[number]

export type IngredienteCategoria =
  | 'base'
  | 'proteina'
  | 'adicion_gratuita'
  | 'adicion_premium'
  | 'extra'
