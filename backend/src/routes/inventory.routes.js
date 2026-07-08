const express = require('express');
const router = express.Router();
const Ingrediente = require('../models/Ingrediente');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Public: Get all ingredients with availability
router.get('/', async (req, res) => {
  try {
    const { categoria, disponible } = req.query;
    const filter = {};
    
    if (categoria) filter.categoria = categoria;
    if (disponible !== undefined) filter.disponible = disponible === 'true';

    const ingredientes = await Ingrediente.find(filter).sort({ categoria: 1, nombre: 1 });
    res.json(ingredientes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
});

// Public: Get single ingredient
router.get('/:id', async (req, res) => {
  try {
    const ingrediente = await Ingrediente.findById(req.params.id);
    if (!ingrediente) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.json(ingrediente);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ingredient', error: error.message });
  }
});

// Protected: Update ingredient availability (kitchen staff)
router.patch('/:id/disponibilidad', authMiddleware, async (req, res) => {
  try {
    const { disponible, stock } = req.body;
    
    const ingrediente = await Ingrediente.findByIdAndUpdate(
      req.params.id,
      { 
        disponible,
        ...(stock !== undefined && { stock }),
      },
      { new: true }
    );

    if (!ingrediente) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    // Broadcast to all connected clients
    const io = req.app.get('io');
    const evento = disponible ? 'ingrediente-disponible' : 'ingrediente-agotado';
    io.emit(evento, {
      id: ingrediente._id,
      nombre: ingrediente.nombre,
      disponible: ingrediente.disponible,
      stock: ingrediente.stock,
    });

    res.json({ success: true, ingrediente });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ingredient', error: error.message });
  }
});

// Protected: Bulk update inventory
router.patch('/bulk', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { updates } = req.body;
    const results = [];

    for (const update of updates) {
      const ingrediente = await Ingrediente.findByIdAndUpdate(
        update.id,
        { disponible: update.disponible, stock: update.stock },
        { new: true }
      );
      if (ingrediente) results.push(ingrediente);
    }

    const io = req.app.get('io');
    results.forEach(ing => {
      const evento = ing.disponible ? 'ingrediente-disponible' : 'ingrediente-agotado';
      io.emit(evento, { id: ing._id, nombre: ing.nombre, disponible: ing.disponible, stock: ing.stock });
    });

    res.json({ success: true, updated: results.length });
  } catch (error) {
    res.status(500).json({ message: 'Error bulk updating inventory', error: error.message });
  }
});

// Protected: Create ingredient
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const ingrediente = new Ingrediente(req.body);
    await ingrediente.save();
    res.status(201).json(ingrediente);
  } catch (error) {
    res.status(400).json({ message: 'Error creating ingredient', error: error.message });
  }
});

module.exports = router;
