const express = require('express');
const router = express.Router();
const Platillo = require('../models/Platillo');

// Public: Get recommendations based on cart items
router.post('/', async (req, res) => {
  try {
    const { cartItems, mesaId } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.json([]);
    }

    const cartIds = cartItems.map(item => item.platilloId);

    const platillosEnCarrito = await Platillo.find({
      _id: { $in: cartIds },
    }).populate('itemsRelacionados');

    const relacionadosIds = new Set();
    platillosEnCarrito.forEach(platillo => {
      platillo.itemsRelacionados.forEach(rel => {
        if (!cartIds.includes(rel._id.toString())) {
          relacionadosIds.add(rel._id.toString());
        }
      });
    });

    if (relacionadosIds.size === 0) {
      const populares = await Platillo.find({
        _id: { $nin: cartIds },
        disponible: true,
      })
      .sort({ createdAt: -1 })
      .limit(3);

      return res.json(populares.map(p => ({ ...p.toObject(), motivo: 'Popular' })));
    }

    const recomendaciones = await Platillo.find({
      _id: { $in: [...relacionadosIds] },
      disponible: true,
    }).limit(5);

    const resultado = recomendaciones.map(r => ({
      ...r.toObject(),
      motivo: 'Combina con tu pedido',
    }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

module.exports = router;
