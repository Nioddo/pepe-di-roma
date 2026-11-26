const express = require('express');
const DifusionController = require('../controllers/DifusionController');

const router = express.Router();

router.get('/', DifusionController.obtenerEstado);
router.post('/', DifusionController.enviar);

module.exports = router;
