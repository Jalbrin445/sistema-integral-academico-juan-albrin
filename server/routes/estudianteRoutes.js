const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { 
    validateEstudiante, 
    validateIdParam, 
    validateGrupoIdParam,
    handleValidationErrors 
} = require('../middleware/validators');
const { registerLimiter } = require('../middleware/rateLimiter');

router.post('/matricular', 
    verificarToken, 
    esAdmin,
    registerLimiter,
    validateEstudiante,
    handleValidationErrors, 
    estudianteController.matricularEstudiante
);

router.get('/grupo/:id_grupo', 
    verificarToken,
    validateGrupoIdParam,
    handleValidationErrors, 
    estudianteController.listarEstudiantesPorGrupo
);

module.exports = router;

