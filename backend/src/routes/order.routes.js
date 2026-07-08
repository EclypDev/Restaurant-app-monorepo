const express = require('express');
const router = express.Router();
const Orden = require('../models/Orden');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Public: Create new order (from QR scan)
router.post('/', async (req, res) => {
  try {
    const { mesaId, items, totalPagar } = req.body;

    if (!mesaId || !items || !totalPagar) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const nuevaOrden = new Orden({
      mesaId,
      items,
      totalPagar,
      estado: 'PENDIENTE',
    });

    await nuevaOrden.save();

    // Emit WebSocket event to kitchen
    const io = req.app.get('io');
    io.to('kitchen').emit('nueva-orden-cocina', nuevaOrden);

    res.status(201).json({ success: true, orden: nuevaOrden });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Protected: Get all orders (for kitchen/admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { estado, mesaId } = req.query;
    const filter = {};

    if (estado) filter.estado = estado;
    if (mesaId) filter.mesaId = mesaId;

    const ordenes = await Orden.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Protected: Update order status
router.patch('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const { estado } = req.body;
    
    const validStates = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'];
    if (!validStates.includes(estado)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const orden = await Orden.findByIdAndUpdate(
      req.params.id,
      { 
        estado,
        ...(estado === 'ENTREGADO' && { entregadoAt: new Date() })
      },
      { new: true }
    );

    if (!orden) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('orden-actualizada', orden);
    
    // Notify table specifically
    io.to(`table-${orden.mesaId}`).emit('orden-actualizada', orden);

    res.json({ success: true, orden });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// Public: Get order by ID (for customer tracking)
router.get('/:id', async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id);
    if (!orden) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(orden);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

module.exports = router;
