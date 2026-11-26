const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const { requirePersonal, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', UsuarioController.login);
router.post('/', UsuarioController.crear);

router.get('/', requirePersonal, UsuarioController.obtenerTodos);
router.get('/:id', requireAdmin, UsuarioController.obtenerPorId);
router.put('/:id', requireAdmin, UsuarioController.modificar);
router.delete('/:id', requireAdmin, UsuarioController.eliminar);

module.exports = router;
