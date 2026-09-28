const express = require('express');
const ItemPedidoController = require('../controllers/ItemPedidoController');

const router = express.Router();

router.get('/', ItemPedidoController.obtenerTodos);
router.get('/:id', ItemPedidoController.obtenerPorId);
router.post('/', ItemPedidoController.crear);
router.put('/:id', ItemPedidoController.modificar);
router.delete('/:id', ItemPedidoController.eliminar);

module.exports = router;
