const escpos = require('escpos');
escpos.Network = require('escpos-network');

const printerConfig = {
  host: process.env.PRINTER_HOST || '192.168.1.100',
  port: parseInt(process.env.PRINTER_PORT) || 9100,
};

async function printTicket(data) {
  const { mesaId, ordenId, items, total, metodoPago, tipo } = data;

  return new Promise((resolve, reject) => {
    const device = new escpos.Network(printerConfig.host, printerConfig.port);
    const printer = new escpos.Printer(device);

    device.open((error) => {
      if (error) {
        console.error('Printer connection error:', error);
        return reject(error);
      }

      printer
        .align('ct')
        .size(1, 1)
        .text('RESTAURANTE')
        .text('========================')
        .size(0, 0);

      if (tipo === 'SOLICITUD_PAGO') {
        printer
          .align('ct')
          .size(1, 1)
          .text('SOLICITUD DE PAGO')
          .size(0, 0)
          .align('lt')
          .text(`Mesa: ${mesaId}`)
          .text(`Hora: ${new Date().toLocaleString()}`)
          .text('------------------------');
      } else if (tipo === 'COMANDA') {
        printer
          .align('ct')
          .size(1, 1)
          .text('COMANDA COCINA')
          .size(0, 0)
          .align('lt')
          .text(`Mesa: ${mesaId}`)
          .text(`Orden: #${ordenId.toString().slice(-6)}`)
          .text(`Hora: ${new Date().toLocaleString()}`)
          .text('------------------------');
      } else {
        printer
          .align('ct')
          .size(1, 1)
          .text('RECIBO')
          .size(0, 0)
          .align('lt')
          .text(`Mesa: ${mesaId}`)
          .text(`Orden: #${ordenId.toString().slice(-6)}`)
          .text(`Hora: ${new Date().toLocaleString()}`)
          .text(`Pago: ${metodoPago}`)
          .text('------------------------');
      }

      items.forEach(item => {
        printer.text(`${item.cantidad}x ${item.nombre}`);
        if (item.eleccionUsuario && item.eleccionUsuario.length > 0) {
          item.eleccionUsuario.forEach(el => {
            printer.text(`   - ${el.grupo}: ${el.seleccionado.join(', ')}`);
          });
        }
        if (item.notasEspeciales) {
          printer.text(`   ⚠️ ${item.notasEspeciales}`);
        }
        printer.text(`   $${(item.precioUnitario * item.cantidad).toLocaleString()}`);
      });

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
        .close();

      resolve();
    });
  });
}

module.exports = { printTicket };
