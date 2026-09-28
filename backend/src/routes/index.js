const express = require('express');
const usuarioRoutes = require('./usuarioRoutes');
const seccionRoutes = require('./seccionRoutes');
const platoRoutes = require('./platoRoutes');
const mesaRoutes = require('./mesaRoutes');
const reservaRoutes = require('./reservaRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const itemPedidoRoutes = require('./itemPedidoRoutes');

/**
 * Router raiz de la API: junta los routers de cada entidad bajo su prefijo.
 * app.js lo monta una sola vez en /api.
 */
const router = express.Router();

router.use('/usuarios', usuarioRoutes);
router.use('/secciones', seccionRoutes);
router.use('/platos', platoRoutes);
router.use('/mesas', mesaRoutes);
router.use('/reservas', reservaRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/items-pedido', itemPedidoRoutes);

module.exports = router;
