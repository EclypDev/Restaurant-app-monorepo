export const ORDER_STATUS = {
  PENDING: 'PENDIENTE',
  IN_PREPARATION: 'EN_PREPARACION',
  DELIVERED: 'ENTREGADO',
  CANCELLED: 'CANCELADO',
}

export const SOCKET_EVENTS = {
  NEW_ORDER: 'nueva-orden-cocina',
  ORDER_UPDATED: 'orden-actualizada',
  ORDER_CANCELLED: 'orden-cancelada',
  INGREDIENTE_AGOTADO: 'ingrediente-agotado',
  INGREDIENTE_DISPONIBLE: 'ingrediente-disponible',
  SOLICITUD_PAGO: 'solicitud-pago',
  SOLICITUD_MESERO: 'solicitud-mesero',
  ALERTA_COCINA: 'alerta-cocina',
  RESENA_NUEVA: 'resena-nueva',
}

export const API_ROUTES = {
  MENU: '/api/menu',
  ORDERS: '/api/pedidos',
  AUTH: '/api/auth',
  TABLES: '/api/mesas',
  INVENTARIO: '/api/inventario',
  RECOMENDACIONES: '/api/recomendaciones',
  RESENAS: '/api/resenas',
  PAGO: '/api/pago',
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
]
