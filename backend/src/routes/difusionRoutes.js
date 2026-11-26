const express = require('express');
const DifusionController = require('../controllers/DifusionController');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAdmin);

router.get('/', DifusionController.obtenerEstado);
router.post('/', DifusionController.enviar);

module.exports = router;
