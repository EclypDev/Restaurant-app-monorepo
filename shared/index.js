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
}

export const API_ROUTES = {
  MENU: '/api/menu',
  ORDERS: '/api/pedidos',
  AUTH: '/api/auth',
  TABLES: '/api/mesas',
}
