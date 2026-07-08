const express = require('express');
const router = express.Router();
const Orden = require('../models/Orden');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Public: Request payment from table
router.post('/solicitar', async (req, res) => {
  try {
    const { mesaId, tipoPago } = req.body;

    if (!mesaId || !tipoPago) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const ordenActiva = await Orden.findOne({
      mesaId,
      estado: { $in: ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO'] },
      pagado: false,
    }).sort({ createdAt: -1 });

    if (!ordenActiva) {
      return res.status(404).json({ message: 'No active order found for this table' });
    }

    ordenActiva.solicitudPago = {
      activo: true,
      tipo: tipoPago,
      solicitadoAt: new Date(),
    };

    await ordenActiva.save();

    // Broadcast to waiters and kitchen
    const io = req.app.get('io');
    io.emit('solicitud-pago', {
      mesaId,
      tipoPago,
      ordenId: ordenActiva._id,
      total: ordenActiva.totalPagar,
    });

    // Trigger print if configured
    if (process.env.PRINTER_ENABLED === 'true') {
      try {
        const { printTicket } = require('../services/printer');
        await printTicket({
          mesaId,
          ordenId: ordenActiva._id,
          items: ordenActiva.items,
          total: ordenActiva.totalPagar,
          tipo: 'SOLICITUD_PAGO',
        });
      } catch (printError) {
        console.error('Print error:', printError.message);
      }
    }

    res.json({ success: true, orden: ordenActiva });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting payment', error: error.message });
  }
});

// Public: Call waiter
router.post('/llamar-mesero', async (req, res) => {
  try {
    const { mesaId, motivo } = req.body;

    if (!mesaId) {
      return res.status(400).json({ message: 'Missing table ID' });
    }

    const io = req.app.get('io');
    io.emit('solicitud-mesero', {
      mesaId,
      motivo: motivo || 'Atención general',
      timestamp: new Date(),
    });

    res.json({ success: true, message: 'Waiter notified' });
  } catch (error) {
    res.status(500).json({ message: 'Error calling waiter', error: error.message });
  }
});

// Protected: Mark payment as completed
router.patch('/:id/pagar', authMiddleware, async (req, res) => {
  try {
    const { metodoPago } = req.body;

    const orden = await Orden.findByIdAndUpdate(
      req.params.id,
      {
        pagado: true,
        pagadoAt: new Date(),
        metodoPago,
        'solicitudPago.activo': false,
        'solicitudPago.atendidoAt': new Date(),
      },
      { new: true }
    );

    if (!orden) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Print receipt
    if (process.env.PRINTER_ENABLED === 'true') {
      try {
        const { printTicket } = require('../services/printer');
        await printTicket({
          mesaId: orden.mesaId,
          ordenId: orden._id,
          items: orden.items,
          total: orden.totalPagar,
          metodoPago,
          tipo: 'RECIBO',
        });
      } catch (printError) {
        console.error('Print error:', printError.message);
      }
    }

    const io = req.app.get('io');
    io.emit('orden-actualizada', orden);

    res.json({ success: true, orden });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

module.exports = router;
