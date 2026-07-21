const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { validateMateria, handleValidationErrors } = require('../middleware/validators');
const { apiLimiter } = require('../middleware/rateLimiter');



router.post('/', 
    verificarToken, 
    esAdmin,
    apiLimiter,
    validateMateria,
    handleValidationErrors, 
    materiaController.crearMateria
);

router.get('/', 
    verificarToken, 
    materiaController.obtenerMaterias
);

module.exports = router;