const express = require('express');
const router = express.Router();
const Resena = require('../models/Resena');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Public: Submit review
router.post('/', async (req, res) => {
  try {
    const { mesaId, ordenId, estrellas, comentario, categoria } = req.body;

    if (!mesaId || !estrellas) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const resena = new Resena({
      mesaId,
      ordenId,
      estrellas,
      comentario,
      categoria,
      esPublica: estrellas >= 4,
    });

    await resena.save();

    // Notify admin if low rating
    if (estrellas <= 2) {
      const io = req.app.get('io');
      io.emit('resena-nueva', {
        mesaId,
        estrellas,
        comentario,
        alerta: true,
      });
    }

    res.status(201).json({
      success: true,
      resena,
      esPositiva: estrellas >= 4,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
});

// Protected: Get all reviews (admin)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { estrellas, resuelto } = req.query;
    const filter = {};

    if (estrellas) filter.estrellas = Number(estrellas);
    if (resuelto !== undefined) filter.resuelto = resuelto === 'true';

    const resenas = await Resena.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(resenas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Protected: Mark review as resolved
router.patch('/:id/resolver', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { respuestaAdmin } = req.body;

    const resena = await Resena.findByIdAndUpdate(
      req.params.id,
      { resuelto: true, respuestaAdmin },
      { new: true }
    );

    if (!resena) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ success: true, resena });
  } catch (error) {
    res.status(500).json({ message: 'Error resolving review', error: error.message });
  }
});

// Public: Get review stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Resena.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          promedio: { $avg: '$estrellas' },
          positivas: { $sum: { $cond: [{ $gte: ['$estrellas', 4] }, 1, 0] } },
          negativas: { $sum: { $cond: [{ $lte: ['$estrellas', 2] }, 1, 0] } },
        },
      },
    ]);

    res.json(stats[0] || { total: 0, promedio: 0, positivas: 0, negativas: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;
