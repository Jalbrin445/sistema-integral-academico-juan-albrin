const express = require('express');
const router = express.Router();
const incapacidadController = require('../controllers/incapacidadController');
const { verificarAdmin, esAdmin } = require('../middleware/authMiddleware');

router.post('/reportar', verificarAdmin, incapacidadController.uploadMiddleware, incapacidadController.subirIncapacidad);
router.get('/listar', verificarAdmin, incapacidadController.obtenerIncapacidades);
router.patch('/revisar/:id_incapacidad', verificarAdmin, esAdmin, incapacidadController.revisarIncapacidad);

module.exports = router;