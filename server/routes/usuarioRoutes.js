const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const {
    validateUserRegistration,
    validateUserUpdate,
    validateUserStatus,
    validateIdParam,
    handleValidationErrors,
    validateRolParam,
    validateUserIdParam
} = require('../middleware/validators')
const { registerLimiter } = require('../middleware/rateLimiter');

router.post('/registro',
    verificarToken, 
    esAdmin,
    registerLimiter,
    validateUserRegistration,
    handleValidationErrors, 
    usuarioController.registrarUsuarioGeneral);

router.patch('/estado/:id_usuario', 
    verificarToken,
    esAdmin, 
    validateUserStatus,
    handleValidationErrors,
    usuarioController.cambiarEstadoUsuario);

router.get('/listar-rol/:id_rol', 
    verificarToken,
    esAdmin,
    validateRolParam,
    handleValidationErrors, 
    usuarioController.listarUsuariosPorRol
);
router.get('/:id_usuario', 
    verificarToken,
    esAdmin,
    validateUserIdParam,
    handleValidationErrors,
    usuarioController.obtenerUsuarioPorId
);

router.put('/actualizar/:id_usuario',
    verificarToken,
    esAdmin,
    validateUserUpdate,
    handleValidationErrors, 
    usuarioController.actualizarUsuarioGeneral
);



module.exports = router;