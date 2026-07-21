const express = require('express');
const router = express.Router();
const periodoController = require('../controllers/periodoController');
const { verificarToken } = require('../middleware/authMiddleware');


router.get('/activos', 
    verificarToken, 
    periodoController.obtenerPeriodosActivos
);

module.exports = router;