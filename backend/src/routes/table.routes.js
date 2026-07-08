const express = require('express');
const router = express.Router();
const Mesa = require('../models/Mesa');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Get all tables
router.get('/', authMiddleware, async (req, res) => {
  try {
    const mesas = await Mesa.find().sort({ numero: 1 });
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tables', error: error.message });
  }
});

// Create table
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { numero, nombre, capacidad } = req.body;

    const existingMesa = await Mesa.findOne({ numero });
    if (existingMesa) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrCode = `${baseUrl}/menu?mesa=${encodeURIComponent(numero)}`;

    const mesa = new Mesa({
      numero,
      nombre,
      capacidad,
      qrCode,
    });

    await mesa.save();
    res.status(201).json(mesa);
  } catch (error) {
    res.status(500).json({ message: 'Error creating table', error: error.message });
  }
});

// Bulk create tables
router.post('/bulk', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { count, prefix = 'Mesa' } = req.body;

    if (!count || count < 1) {
      return res.status(400).json({ message: 'Invalid count' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const mesas = [];

    for (let i = 1; i <= count; i++) {
      const numero = `${prefix}_${String(i).padStart(2, '0')}`;
      const qrCode = `${baseUrl}/menu?mesa=${encodeURIComponent(numero)}`;

      mesas.push({
        numero,
        nombre: numero,
        qrCode,
      });
    }

    const created = await Mesa.insertMany(mesas, { ordered: false });
    res.status(201).json({ created: created.length, mesas: created });
  } catch (error) {
    res.status(500).json({ message: 'Error creating tables', error: error.message });
  }
});

// Update table
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const mesa = await Mesa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!mesa) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(mesa);
  } catch (error) {
    res.status(500).json({ message: 'Error updating table', error: error.message });
  }
});

// Delete table
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const mesa = await Mesa.findByIdAndDelete(req.params.id);
    if (!mesa) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting table', error: error.message });
  }
});

module.exports = router;
