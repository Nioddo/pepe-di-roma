const express = require('express');
const SeccionController = require('../controllers/SeccionController');
const { requirePersonal } = require('../middlewares/auth');

const router = express.Router();

router.get('/', SeccionController.obtenerTodas);
router.get('/:id', SeccionController.obtenerPorId);
router.post('/', requirePersonal, SeccionController.crear);
router.put('/:id', requirePersonal, SeccionController.modificar);
router.delete('/:id', requirePersonal, SeccionController.eliminar);

module.exports = router;
