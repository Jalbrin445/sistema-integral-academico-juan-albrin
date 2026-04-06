const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarAdmin } = require('../middleware/authMiddleware');

router.post('/registro', verificarAdmin, usuarioController.registrarUsuarioGeneral);

module.exports = router;