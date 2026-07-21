const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { validateGroup, handleValidationErrors } = require('../middleware/validators');
const { apiLimiter } = require('../middleware/rateLimiter');



router.post('/', 
    verificarToken, 
    esAdmin,
    apiLimiter,
    validateGroup,
    handleValidationErrors, 
    grupoController.crearGrupo
);


router.get('/', 
    verificarToken, 
    grupoController.obtenerGrupos
);

module.exports = router;
