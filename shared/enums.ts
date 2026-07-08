export enum OrderStatus {
  PENDING = 'PENDIENTE',
  IN_PREPARATION = 'EN_PREPARACION',
  DELIVERED = 'ENTREGADO',
  CANCELLED = 'CANCELADO',
}

export enum UserRole {
  ADMIN = 'admin',
  KITCHEN = 'cocina',
  WAITER = 'mesero',
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
