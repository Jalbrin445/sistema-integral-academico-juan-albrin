const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const { verificarAdmin } = require('../middleware/authMiddleware');

router.get('/', verificarAdmin, grupoController.obtenerGrupos);

module.exports = router;
