interface PrintData {
  mesaId: string
  ordenId: string
  items: Array<{
    cantidad: number
    nombre: string
    eleccionUsuario?: Array<{ grupo: string; seleccionado: string[] }>
    notasEspeciales?: string
    precioUnitario: number
  }>
  total: number
  metodoPago?: string
  tipo: 'COMANDA' | 'SOLICITUD_PAGO' | 'RECIBO'
}

export async function printTicket(data: PrintData): Promise<void> {
  const { mesaId, ordenId, items, total, metodoPago, tipo } = data

  console.log(`🖨️ PRINT TICKET [${tipo}] - Mesa: ${mesaId} - Orden: ${ordenId}`)
  console.log(`   Items: ${items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ')}`)
  console.log(`   Total: $${total.toLocaleString()}`)

  if (process.env.PRINTER_ENABLED !== 'true') {
    console.log('⚠️ Printer disabled, skipping actual print')
    return
  }

  try {
    const escpos = await import('escpos')
    const Network = await import('escpos-network')
    
    const device = new escpos.Network(
      process.env.PRINTER_HOST || '192.168.1.100',
      parseInt(process.env.PRINTER_PORT || '9100')
    )
    const printer = new escpos.Printer(device)

    return new Promise((resolve, reject) => {
      device.open((error: Error | null) => {
        if (error) {
          console.error('Printer connection error:', error)
          return reject(error)
        }

        printer
          .align('ct')
          .size(1, 1)
          .text('RESTAURANTE')
          .text('========================')
          .size(0, 0)

        if (tipo === 'SOLICITUD_PAGO') {
          printer
            .align('ct')
            .size(1, 1)
            .text('SOLICITUD DE PAGO')
            .size(0, 0)
            .align('lt')
            .text(`Mesa: ${mesaId}`)
            .text(`Hora: ${new Date().toLocaleString()}`)
            .text('------------------------')
        } else if (tipo === 'COMANDA') {
          printer
            .align('ct')
            .size(1, 1)
            .text('COMANDA COCINA')
            .size(0, 0)
            .align('lt')
            .text(`Mesa: ${mesaId}`)
            .text(`Orden: #${ordenId.slice(-6)}`)
            .text(`Hora: ${new Date().toLocaleString()}`)
            .text('------------------------')
        } else {
          printer
            .align('ct')
            .size(1, 1)
            .text('RECIBO')
            .size(0, 0)
            .align('lt')
            .text(`Mesa: ${mesaId}`)
            .text(`Orden: #${ordenId.slice(-6)}`)
            .text(`Hora: ${new Date().toLocaleString()}`)
            .text(`Pago: ${metodoPago}`)
            .text('------------------------')
        }

        items.forEach(item => {
          printer.text(`${item.cantidad}x ${item.nombre}`)
          if (item.eleccionUsuario && item.eleccionUsuario.length > 0) {
            item.eleccionUsuario.forEach(el => {
              printer.text(`   - ${el.grupo}: ${el.seleccionado.join(', ')}`)
            })
          }
          if (item.notasEspeciales) {
            printer.text(`   ⚠️ ${item.notasEspeciales}`)
          }
          printer.text(`   $${(item.precioUnitario * item.cantidad).toLocaleString()}`)
        })

        printer
          .text('------------------------')
          .align('rt')
          .size(1, 1)
          .text(`TOTAL: $${total.toLocaleString()}`)
          .size(0, 0)
          .align('ct')
          .text('========================')
          .text('¡Gracias por su visita!')
          .cut()
          .close()

        resolve()
      })
    })
  } catch (error) {
    console.warn('⚠️ Printer service unavailable:', error)
  }
}
