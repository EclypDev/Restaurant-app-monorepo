const express = require('express');
const router = express.Router();
const Platillo = require('../models/Platillo');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Public: Get all available menu items
router.get('/', async (req, res) => {
  try {
    const { categoria, disponible } = req.query;
    const filter = { disponible: disponible !== 'false' };
    
    if (categoria) {
      filter.categoria = categoria;
    }

    const platillos = await Platillo.find(filter).sort({ categoria: 1, nombre: 1 });
    res.json(platillos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
});

// Public: Get single platillo
router.get('/:id', async (req, res) => {
  try {
    const platillo = await Platillo.findById(req.params.id);
    if (!platillo) {
      return res.status(404).json({ message: 'Platillo not found' });
    }
    res.json(platillo);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching platillo', error: error.message });
  }
});

// Protected: Create platillo
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const platillo = new Platillo(req.body);
    await platillo.save();
    res.status(201).json(platillo);
  } catch (error) {
    res.status(400).json({ message: 'Error creating platillo', error: error.message });
  }
});

// Protected: Update platillo
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const platillo = await Platillo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!platillo) {
      return res.status(404).json({ message: 'Platillo not found' });
    }
    res.json(platillo);
  } catch (error) {
    res.status(400).json({ message: 'Error updating platillo', error: error.message });
  }
});

// Protected: Delete platillo
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const platillo = await Platillo.findByIdAndDelete(req.params.id);
    if (!platillo) {
      return res.status(404).json({ message: 'Platillo not found' });
    }
    res.json({ message: 'Platillo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting platillo', error: error.message });
  }
});

module.exports = router;
