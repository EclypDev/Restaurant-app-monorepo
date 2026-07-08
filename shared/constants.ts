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
} as const

export const API_ROUTES = {
  MENU: '/api/menu',
  ORDERS: '/api/pedidos',
  AUTH: '/api/auth',
  TABLES: '/api/mesas',
  INVENTARIO: '/api/inventario',
  RECOMENDACIONES: '/api/recomendaciones',
  RESENAS: '/api/resenas',
  PAGO: '/api/pago',
} as const

export type SocketEventKey = keyof typeof SOCKET_EVENTS
export type SocketEventValue = typeof SOCKET_EVENTS[SocketEventKey]
export type ApiRouteKey = keyof typeof API_ROUTES
export type ApiRouteValue = typeof API_ROUTES[ApiRouteKey]
