const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');
const { verificarToken, esDocenteOAdmin } = require('../middleware/authMiddleware');
const { 
    validateNota, 
    validateCriterio, 
    validateIdParam,
    validateAsignacionIdParam, 
    handleValidationErrors } = require('../middleware/validators');
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/crear-criterio', 
    verificarToken, 
    esDocenteOAdmin, 
    apiLimiter,
    validateCriterio,
    handleValidationErrors,
    notaController.crearCriterioEvaluacion
);

router.get('/criterios/:id_asignacion', 
    verificarToken, 
    esDocenteOAdmin,
    validateAsignacionIdParam,
    handleValidationErrors, 
    notaController.listarCriteriosPorAsignacion
);

router.post('/registrar', 
    verificarToken, 
    esDocenteOAdmin,
    apiLimiter,
    validateNota,
    handleValidationErrors, 
    notaController.registrarNota
);

router.put('/actualizar/:id_calificacion',
    verificarToken,
    esDocenteOAdmin,
    validateNota,
    handleValidationErrors, 
    notaController.actualizarNota
);


router.get('/estudiante/:estudiante_id/asignacion/:asignacion_id', 
    verificarToken, 
    notaController.obtenerNotasEstudiante
);

router.get('/resumen/estudiante/:id_estudiante', 
    verificarToken, 
    notaController.obtenerResumenMateriasEstudiante
);

router.get('/detalle/:id_asignacion/:id_estudiante', 
    verificarToken, 
    notaController.obtenerDetalleCriteriosEstudiante
);

router.get('/buscar/:id_criterio/:id_asignacion', 
    verificarToken, 
    esDocenteOAdmin, 
    notaController.obtenerNotasPorCriterioYGrupo
);



module.exports = router;