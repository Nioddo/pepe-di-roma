const express = require('express');
const ReservaController = require('../controllers/ReservaController');
const { requireLogin, creaParaSiMismo, reservaPropia } = require('../middlewares/auth');

const router = express.Router();

router.get('/', ReservaController.obtenerTodas);
router.get('/:id', ReservaController.obtenerPorId);
router.post('/', requireLogin, creaParaSiMismo, ReservaController.crear);
router.put('/:id', reservaPropia, ReservaController.modificar);
router.delete('/:id', reservaPropia, ReservaController.eliminar);

module.exports = router;
