const express = require('express');
const MesaController = require('../controllers/MesaController');

const router = express.Router();

router.get('/', MesaController.obtenerTodas);
router.get('/:id', MesaController.obtenerPorId);
router.post('/', MesaController.crear);
router.put('/:id', MesaController.modificar);
router.delete('/:id', MesaController.eliminar);

module.exports = router;
