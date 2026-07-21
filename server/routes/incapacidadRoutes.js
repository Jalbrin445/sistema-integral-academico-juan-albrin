const express = require('express');
const router = express.Router();
const incapacidadController = require('../controllers/incapacidadController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { validateIncapacidad, validateIdParam, handleValidationErrors } = require('../middleware/validators');
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/reportar', 
    verificarToken,
    apiLimiter, 
    incapacidadController.uploadMiddleware,
    validateIncapacidad,
    handleValidationErrors, 
    incapacidadController.subirIncapacidad
);

router.get('/listar',
    verificarToken, 
    incapacidadController.obtenerIncapacidades
);

router.patch('/revisar/:id_incapacidad', 
    verificarToken, 
    esAdmin, 
    validateIdParam,
    handleValidationErrors,
    incapacidadController.revisarIncapacidad
);

module.exports = router;