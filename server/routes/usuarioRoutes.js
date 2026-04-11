const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarAdmin, esAdmin, esDocente } = require('../middleware/authMiddleware');

router.post('/registro', verificarAdmin, usuarioController.registrarUsuarioGeneral);
router.patch('/estado/:id_usuario', verificarAdmin, esAdmin, usuarioController.cambiarEstadoUsuario);
router.get('/listar-rol/:id_rol', verificarAdmin, esAdmin, usuarioController.listarUsuariosPorRol);
router.put('/actualizar/:id_usuario', verificarAdmin, usuarioController.actualizarUsuarioGeneral);
router.get('/:id_usuario', verificarAdmin, usuarioController.obtenerUsuarioPorId);


module.exports = router;