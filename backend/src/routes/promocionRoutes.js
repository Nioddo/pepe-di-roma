const express = require('express');
const PromocionController = require('../controllers/PromocionController');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAdmin);

router.get('/destinatarios', PromocionController.destinatarios);
router.post('/', PromocionController.enviar);

module.exports = router;
