import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { IOrden, OrderStatus, OrderSource } from '@shared'
import NegocioSwitcher from '../components/NegocioSwitcher'
import '../styles/Cocina.css'

const DISPATCHED_KEY = 'cocina_desplazados'

function getDispatched(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DISPATCHED_KEY) || '[]')) } catch { return new Set() }
}

const STATUS_CONFIG = [
  { key: 'nuevos', estado: OrderStatus.PENDING, icon: '⚙️', label: 'NUEVOS', color: '#3b82f6' },
  { key: 'preparacion', estado: OrderStatus.IN_PREPARATION, icon: '🔥', label: 'EN PREPARACIÓN', color: '#ff6b35' },
  { key: 'listos', estado: OrderStatus.LISTO, icon: '✅', label: 'POR ENTREGAR', color: '#22c55e' },
  { key: 'entregados', estado: OrderStatus.DELIVERED, icon: '📦', label: 'ENTREGADO', color: '#8b5cf6' },
  { key: 'pagados', estado: OrderStatus.PAGADO, icon: '💰', label: 'PAGADO', color: '#06b6d4' },
]

const BTN_CONFIG: Record<string, { label: string; next: OrderStatus; style: string } | null> = {
  [OrderStatus.PENDING]: { label: '⚡ Iniciar Preparación', next: OrderStatus.IN_PREPARATION, style: 'btn-start' },
  [OrderStatus.IN_PREPARATION]: { label: '✅ Marcar como Listo', next: OrderStatus.LISTO, style: 'btn-ready' },
  [OrderStatus.LISTO]: { label: '📦 Marcar como Entregado', next: OrderStatus.DELIVERED, style: 'btn-dispatch' },
  [OrderStatus.DELIVERED]: { label: '💰 Registrar Pago', next: OrderStatus.PAGADO, style: 'btn-pay' },
  [OrderStatus.PAGADO]: null,
}

export default function Cocina() {
  const { user, loading: authLoading } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState<IOrden[]>([])
  const [now, setNow] = useState(Date.now())
  const [dispatched] = useState<Set<string>>(getDispatched)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [negocioNombre, setNegocioNombre] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || (user.rol !== 'cocina' && user.rol !== 'admin'))) {
      navigate('/login')
      return
    }
    // Cargar nombre del negocio desde el usuario autenticado
    if (user) {
      axios.get('/api/auth/me')
        .then(({ data }: any) => setNegocioNombre(data.negocio?.nombre || user.nombre || ''))
        .catch(() => setNegocioNombre(user.nombre || ''))
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!socket) return
    socket.emit('join-kitchen')
    fetchPedidos()

    socket.on('nueva-orden-cocina', (nuevaOrden: IOrden) => {
      setPedidos(prev => prev.find(o => o.id === nuevaOrden.id) ? prev : [nuevaOrden, ...prev])
    })
    socket.on('orden-actualizada', (actualizada: IOrden) => {
      setPedidos(prev => prev.map(o => o.id === actualizada.id ? actualizada : o))
    })
    return () => { socket.off('nueva-orden-cocina'); socket.off('orden-actualizada') }
  }, [socket])

  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(i) }, [])

  const fetchPedidos = useCallback(async () => {
    try {
      const { data } = await axios.get<{ ordenes: IOrden[] }>('/api/pedidos')
      setPedidos(data.ordenes)
    } catch { console.error('Error fetching pedidos') }
  }, [])

  const actualizarEstado = async (id: string, estado: OrderStatus) => {
    try { await axios.patch(`/api/pedidos/${id}/estado`, { estado }) }
    catch { console.error('Error updating order') }
  }

  if (authLoading) return <div className="cocina-loading">Cargando...</div>

  return (
    <div className="cocina-container">
      {/* HEADER - Marca blanca dinámica */}
      <header className="cocina-header-premium">
        <div className="header-logo-area">
          <div className="logo-fire-icon"><span className="fire-icon">🏪</span></div>
          <div className="logo-text-block">
            <span className="logo-negocio">{negocioNombre || 'Cargando negocio...'}</span>
            <span className="logo-sub">Monitor de Cocina</span>
          </div>
        </div>
        <div className="header-right-area">
          <NegocioSwitcher onSwitch={() => fetchPedidos()} />
          <div className="user-profile-pill">
            <span className="user-avatar">👨‍🍳</span>
            <span className="user-name-header">{user?.nombre}</span>
          </div>
        </div>
      </header>

      {/* BARRA DE ESTADÍSTICAS */}
      <div className="stats-bar">
        {STATUS_CONFIG.map(col => {
          const count = pedidos.filter(p => p.estado === col.estado).length
          return (
            <div key={col.key} className="stat-item" style={{ borderLeft: `3px solid ${col.color}` }}>
              <span className="stat-number" style={{ color: col.color }}>{count}</span>
              <span className="stat-label">{col.icon} {col.label}</span>
            </div>
          )
        })}
      </div>

      {/* TABLERO KANBAN 5 COLUMNAS */}
      <div className="kanban-board">
        {STATUS_CONFIG.map(col => {
          const colPedidos = pedidos.filter(p => p.estado === col.estado)
          return (
            <div key={col.key} className="kanban-column">
              <div className="column-header" style={{ borderColor: col.color }}>
                <span className="col-icon">{col.icon}</span>
                <span className="col-title">{col.label}</span>
                <span className="col-badge" style={{ background: `${col.color}20`, color: col.color }}>{colPedidos.length}</span>
              </div>
              <div className="col-body">
                {colPedidos.map(pedido => (
                  <OrderCard
                    key={pedido.id}
                    pedido={pedido}
                    now={now}
                    completedItems={completedItems}
                    onToggleItem={(key) => {
                      const next = new Set(completedItems)
                      next.has(key) ? next.delete(key) : next.add(key)
                      setCompletedItems(next)
                    }}
                    onAction={BTN_CONFIG[pedido.estado] ? () => actualizarEstado(pedido.id, BTN_CONFIG[pedido.estado]!.next) : undefined}
                  />
                ))}
                {colPedidos.length === 0 && <div className="col-empty">No hay pedidos</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatTime(iso: string | Date) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function OrderCard({ pedido, now, completedItems, onToggleItem, onAction }: {
  pedido: IOrden
  now: number
  completedItems: Set<string>
  onToggleItem: (key: string) => void
  onAction?: () => void
}) {
  const minutos = Math.floor((now - new Date(pedido.createdAt).getTime()) / 60000)
  const isUrgent = minutos >= 15
  const isWarning = minutos >= 8 && minutos < 15

  const cfg = BTN_CONFIG[pedido.estado]

  return (
    <div className={`order-card ${isUrgent ? 'urgent' : ''} ${isWarning ? 'warning' : ''}`}>
      {/* HEADER */}
      <div className="card-header-row">
        <div className="card-order-info">
          <span className="card-order-number">{pedido.orderNumber || `#${pedido.id.slice(-4)}`}</span>
          <span className="card-mesa-text">Mesa {pedido.mesaId.replace('Mesa ', '')}</span>
        </div>
        <div className={`card-time ${isUrgent ? 'time-danger' : isWarning ? 'time-warning' : 'time-ok'}`}>
          <span className="time-value">{minutos}</span>
          <span className="time-unit">min</span>
        </div>
      </div>

      {/* ORIGEN */}
      <div className="card-origin-row">
        {pedido.origen === OrderSource.MESERO_APP ? (
          <span className="origin-badge origin-mesero">👤 Mesero: {pedido.usuarioNombre || 'N/A'}</span>
        ) : (
          <span className="origin-badge origin-qr">📱 Cliente (QR)</span>
        )}
        <span className="card-created-time">🕐 {formatTime(pedido.createdAt)}</span>
      </div>

      {isUrgent && pedido.estado !== OrderStatus.PAGADO && (
        <div className="urgent-badge"><span>⚠️ URGENTE</span></div>
      )}

      {/* ITEMS */}
      <ul className="card-items-list">
        {pedido.items.map((item, idx) => {
          const itemKey = `${pedido.id}-${idx}`
          const isDone = completedItems.has(itemKey)
          return (
            <li key={idx} className={`card-item ${isDone ? 'item-done' : ''}`}>
              <label className="item-checkbox-label">
                <input type="checkbox" className="item-checkbox" checked={isDone} onChange={() => onToggleItem(itemKey)} />
                <span className="checkmark"></span>
              </label>
              <span className="item-qty">{item.cantidad}x</span>
              <div className="item-content">
                <span className="item-name">{item.nombre}</span>
                {(item.notas || item.notasEspeciales) && <span className="item-notas">📝 {item.notas || item.notasEspeciales}</span>}
                {item.adicionales && item.adicionales.length > 0 && (
                  <div className="item-adicionales">
                    {item.adicionales.map((add, i) => <span key={i} className="adicional-tag">+{add.nombre}</span>)}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {/* ACTION BUTTON */}
      {cfg && onAction ? (
        <button className={`btn-card ${cfg.style}`} onClick={onAction}>{cfg.label}</button>
      ) : (
        <div className="paid-seal">💰 PAGADO</div>
      )}
    </div>
  )
}
