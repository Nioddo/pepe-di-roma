const express = require('express');
const SeccionController = require('../controllers/SeccionController');

const router = express.Router();

router.get('/', SeccionController.obtenerTodas);
router.get('/:id', SeccionController.obtenerPorId);
router.post('/', SeccionController.crear);
router.put('/:id', SeccionController.modificar);
router.delete('/:id', SeccionController.eliminar);

module.exports = router;
