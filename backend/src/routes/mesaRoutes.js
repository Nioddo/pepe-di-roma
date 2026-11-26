const express = require('express');
const MesaController = require('../controllers/MesaController');
const { requirePersonal } = require('../middlewares/auth');

const router = express.Router();

router.get('/', MesaController.obtenerTodas);
router.get('/:id', MesaController.obtenerPorId);
router.post('/', requirePersonal, MesaController.crear);
router.put('/:id', requirePersonal, MesaController.modificar);
router.delete('/:id', requirePersonal, MesaController.eliminar);

module.exports = router;
