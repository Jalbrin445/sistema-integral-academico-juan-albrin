const express = require('express');
const router = express.Router();
const gradoController = require('../controllers/gradoController');
const { verificarAdmin, esAdmin } = require('../middleware/authMiddleware');


router.get('/', verificarAdmin, gradoController.obtenerGrados);
router.post('/', verificarAdmin, esAdmin, gradoController.crearGrado);

module.exports = router;