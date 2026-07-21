const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docenteController');
const notaController = require('../controllers/notaController');
const { verificarToken, esAdmin, esDocenteOAdmin } = require('../middleware/authMiddleware');
const { validateDocente, validateCriterio, handleValidationErrors } = require('../middleware/validators');
const { registerLimiter, apiLimiter } = require('../middleware/rateLimiter');


router.post('/registrar', 
    verificarToken, 
    esAdmin,
    registerLimiter,
    validateDocente,
    handleValidationErrors, 
    docenteController.registrarDocente
);

router.get('/', 
    verificarToken, 
    docenteController.obtenerDocentes
);
router.post('/criterios/crear', 
    verificarToken, 
    esDocenteOAdmin,
    apiLimiter,
    validateCriterio,
    handleValidationErrors, 
    notaController.crearCriterioEvaluacion
);


module.exports = router;