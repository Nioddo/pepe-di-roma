const express = require('express');
const CalificacionController = require('../controllers/CalificacionController');
const { requirePersonal } = require('../middlewares/auth');

const router = express.Router();

router.get('/', CalificacionController.obtenerTodas);
router.get('/:id', CalificacionController.obtenerPorId);
router.post('/', CalificacionController.crear);
router.put('/:id', requirePersonal, CalificacionController.modificar);
router.delete('/:id', requirePersonal, CalificacionController.eliminar);

module.exports = router;
