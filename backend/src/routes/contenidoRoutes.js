const express = require('express');
const ContenidoController = require('../controllers/ContenidoController');
const { requirePersonal } = require('../middlewares/auth');

const router = express.Router();

router.get('/', ContenidoController.obtenerTodos);
router.get('/:id', ContenidoController.obtenerPorId);
router.post('/', requirePersonal, ContenidoController.crear);
router.put('/:id', requirePersonal, ContenidoController.modificar);
router.delete('/:id', requirePersonal, ContenidoController.eliminar);

module.exports = router;
