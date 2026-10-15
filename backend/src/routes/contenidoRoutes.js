const express = require('express');
const ContenidoController = require('../controllers/ContenidoController');

const router = express.Router();

router.get('/', ContenidoController.obtenerTodos);
router.get('/:id', ContenidoController.obtenerPorId);
router.post('/', ContenidoController.crear);
router.put('/:id', ContenidoController.modificar);
router.delete('/:id', ContenidoController.eliminar);

module.exports = router;
