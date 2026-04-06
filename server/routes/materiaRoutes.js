const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');
const { verificarAdmin, esAdmin } = require('../middleware/authMiddleware');

router.post('/', verificarAdmin, esAdmin, materiaController.crearMateria);

router.get('/', verificarAdmin, materiaController.obtenerMaterias);

module.exports = router;