const express = require('express');
const CalificacionController = require('../controllers/CalificacionController');

const router = express.Router();

router.get('/', CalificacionController.obtenerTodas);
router.get('/:id', CalificacionController.obtenerPorId);
router.post('/', CalificacionController.crear);
router.put('/:id', CalificacionController.modificar);
router.delete('/:id', CalificacionController.eliminar);

module.exports = router;
