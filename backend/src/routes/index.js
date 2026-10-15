const express = require('express');
const usuarioRoutes = require('./usuarioRoutes');
const seccionRoutes = require('./seccionRoutes');
const platoRoutes = require('./platoRoutes');
const mesaRoutes = require('./mesaRoutes');
const reservaRoutes = require('./reservaRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const itemPedidoRoutes = require('./itemPedidoRoutes');
const contenidoRoutes = require('./contenidoRoutes');
const calificacionRoutes = require('./calificacionRoutes');

const router = express.Router();

router.use('/usuarios', usuarioRoutes);
router.use('/secciones', seccionRoutes);
router.use('/platos', platoRoutes);
router.use('/mesas', mesaRoutes);
router.use('/reservas', reservaRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/items-pedido', itemPedidoRoutes);
router.use('/contenido', contenidoRoutes);
router.use('/calificaciones', calificacionRoutes);

module.exports = router;
