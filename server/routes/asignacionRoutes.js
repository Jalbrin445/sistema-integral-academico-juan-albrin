const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacionController');
const { verificarAdmin, esAdmin } = require('../middleware/authMiddleware');


router.post('/', verificarAdmin, esAdmin, asignacionController.crearAsignacion);

router.get('/docente/:id_docente',verificarAdmin, asignacionController.obtenerCargaDocente);

module.exports = router;