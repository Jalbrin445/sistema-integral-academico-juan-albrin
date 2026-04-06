const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docenteController');
const notaController = require('../controllers/notaController');
const { verificarAdmin, esAdmin, esDocente } = require('../middleware/authMiddleware');

router.post('/registrar', verificarAdmin, esAdmin, docenteController.registrarDocente);
router.post('/criterios/crear', verificarAdmin, esDocente, notaController.crearCriterioEvaluacion);


module.exports = router;