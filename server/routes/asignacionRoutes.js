const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacionController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { 
    validateAsignacion, 
    handleValidationErrors, 
    validateDocenteIdParam } = require('../middleware/validators');
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/', 
    verificarToken, 
    esAdmin, 
    apiLimiter,
    validateAsignacion,
    handleValidationErrors,
    asignacionController.crearAsignacion
);


router.get('/docente/:id_docente',
    verificarToken,
    validateDocenteIdParam,
    handleValidationErrors, 
    asignacionController.obtenerCargaDocente
);

module.exports = router;