const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const { verificarAdmin, esAdmin } = require('../middleware/authMiddleware');

router.post('/', verificarAdmin, esAdmin, grupoController.crearGrupo);
router.get('/', verificarAdmin, grupoController.obtenerGrupos);

module.exports = router;
