const express = require('express');
const router = express.Router();
const incapacidadController = require('../controllers/incapacidadController');
const { verificarAdmin } = require('../middleware/authMiddleware');

router.post('/reportar', verificarAdmin, incapacidadController.uploadMiddleware, incapacidadController.subirIncapacidad);
router.post('/listar', verificarAdmin, incapacidadController.obtenerIncapacidades);

module.exports = router;