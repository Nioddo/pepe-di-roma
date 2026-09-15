const express = require('express');
const ReservaController = require('../controllers/ReservaController');

const router = express.Router();

router.get('/', ReservaController.obtenerTodas);
router.get('/:id', ReservaController.obtenerPorId);
router.post('/', ReservaController.crear);
router.put('/:id', ReservaController.modificar);
router.delete('/:id', ReservaController.eliminar);

module.exports = router;
