import { IOrden, OrderStatus } from '@shared'
import '../styles/Cocina.css' // Reutilizamos el estilo de cocina

type SemaphoreColor = 'verde' | 'amarillo' | 'rojo'

export default function PedidoCard({ 
  pedido, 
  now, 
  onAction, 
  actionLabel, 
  actionClass 
}: {
  pedido: IOrden
  now: number
  onAction?: () => void
  actionLabel?: string
  actionClass?: string
}) {
  const minutosTranscurridos = Math.floor(
    (now - new Date(pedido.createdAt).getTime()) / 60000
  )

  let estadoColor: SemaphoreColor = 'verde'
  if (minutosTranscurridos >= 20) {
    estadoColor = 'rojo'
  } else if (minutosTranscurridos >= 10) {
    estadoColor = 'amarillo'
  }

  return (
    <div className={`pedido-card estado-${pedido.estado.toLowerCase()} semaforo-${estadoColor}`}>
      <div className="pedido-header">
        <span className="mesa-label">📍 {pedido.mesaId}</span>
        <span className={`tiempo-label tiempo-${estadoColor}`}>
          {minutosTranscurridos} min
        </span>
      </div>

      <ul className="pedido-items">
        {pedido.items.map((item, idx) => (
          <li key={idx}>
            <strong>{item.cantidad}x {item.nombre}</strong>
            
            {item.estructuraPlatoFinal && (
              <div className="kitchen-instructions">
                {item.estructuraPlatoFinal.instruccionesCocina.QUITAR.length > 0 && (
                  <div className="instruction-block instruction-remove">
                    <strong>🛑 SIN:</strong>
                    {item.estructuraPlatoFinal.instruccionesCocina.QUITAR.map((q, i) => (
                      <span key={i} className="instruction-item">{q.nombre}</span>
                    ))}
                  </div>
                )}
                {item.estructuraPlatoFinal.instruccionesCocina.ANADIR_O_EXTRA.length > 0 && (
                  <div className="instruction-block instruction-add">
                    <strong>🟢 EXTRA:</strong>
                    {item.estructuraPlatoFinal.instruccionesCocina.ANADIR_O_EXTRA.map((a, i) => (
                      <span key={i} className="instruction-item">{a.nombre}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {!item.estructuraPlatoFinal && item.eleccionUsuario && item.eleccionUsuario.length > 0 && (
              <div className="elecciones">
                {item.eleccionUsuario.map((el, i) => (
                  <span key={i} className="eleccion-tag">
                    {el.grupo}: {el.seleccionado.join(', ')}
                  </span>
                ))}
              </div>
            )}
            
            {item.notasEspeciales && (
              <div className="notas">️ {item.notasEspeciales}</div>
            )}
          </li>
        ))}
      </ul>

      {onAction && actionLabel && (
        <button className={`btn-action ${actionClass}`} onClick={onAction}>
          {actionLabel}
        </button>
      )}
      
      <div className="estado-badge">
          {pedido.estado}
      </div>
    </div>
  )
}
