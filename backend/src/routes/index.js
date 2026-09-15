const express = require('express');
const platoRoutes = require('./platoRoutes');
const reservaRoutes = require('./reservaRoutes');
const pedidoRoutes = require('./pedidoRoutes');

/**
 * Router raiz de la API: junta los routers de cada entidad bajo su prefijo.
 * app.js lo monta una sola vez en /api.
 */
const router = express.Router();

router.use('/platos', platoRoutes);
router.use('/reservas', reservaRoutes);
router.use('/pedidos', pedidoRoutes);

module.exports = router;
