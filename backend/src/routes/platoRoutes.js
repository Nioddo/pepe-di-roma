const express = require('express');
const PlatoController = require('../controllers/PlatoController');
const { requirePersonal } = require('../middlewares/auth');

const router = express.Router();

router.get('/', PlatoController.obtenerTodos);
router.get('/:id', PlatoController.obtenerPorId);
router.post('/', requirePersonal, PlatoController.crear);
router.put('/:id', requirePersonal, PlatoController.modificar);
router.delete('/:id', requirePersonal, PlatoController.eliminar);

module.exports = router;
