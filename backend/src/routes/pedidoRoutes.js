const express = require('express');
const PedidoController = require('../controllers/PedidoController');
const { requireLogin, creaParaSiMismo, pedidoPropio } = require('../middlewares/auth');

const router = express.Router();

router.get('/', requireLogin, PedidoController.obtenerTodos);
router.get('/:id', pedidoPropio, PedidoController.obtenerPorId);
router.post('/', requireLogin, creaParaSiMismo, PedidoController.crear);
router.put('/:id', pedidoPropio, PedidoController.modificar);
router.delete('/:id', pedidoPropio, PedidoController.eliminar);

module.exports = router;
