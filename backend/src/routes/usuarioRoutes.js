const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');

const router = express.Router();

router.get('/', UsuarioController.obtenerTodos);
router.get('/:id', UsuarioController.obtenerPorId);
router.post('/', UsuarioController.crear);
router.put('/:id', UsuarioController.modificar);
router.delete('/:id', UsuarioController.eliminar);

module.exports = router;
