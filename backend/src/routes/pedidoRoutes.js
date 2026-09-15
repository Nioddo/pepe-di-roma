const express = require('express');
const PedidoController = require('../controllers/PedidoController');

const router = express.Router();

router.get('/', PedidoController.obtenerTodos);
router.get('/:id', PedidoController.obtenerPorId);
router.post('/', PedidoController.crear);
router.put('/:id', PedidoController.modificar);
router.delete('/:id', PedidoController.eliminar);

module.exports = router;
