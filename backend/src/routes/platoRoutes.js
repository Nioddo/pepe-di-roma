const express = require('express');
const PlatoController = require('../controllers/PlatoController');

const router = express.Router();

router.get('/', PlatoController.obtenerTodos);
router.get('/:id', PlatoController.obtenerPorId);
router.post('/', PlatoController.crear);
router.put('/:id', PlatoController.modificar);
router.delete('/:id', PlatoController.eliminar);

module.exports = router;
