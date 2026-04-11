const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');
const { verificarAdmin, esDocente } = require('../middleware/authMiddleware');


router.post('/crear-criterio', verificarAdmin, esDocente, notaController.crearCriterioEvaluacion);
router.get('/criterios/:id_asignacion', verificarAdmin, esDocente, notaController.listarCriteriosPorAsignacion);

router.post('/registrar', verificarAdmin, esDocente, notaController.registrarNota);
router.put('/actualizar/:id_calificacion',verificarAdmin, notaController.actualizarNota);


router.get('/estudiante/:estudiante_id/asignacion/:asignacion_id', verificarAdmin, notaController.obtenerNotasEstudiante);
router.get('/resumen/estudiante/:id_estudiante', verificarAdmin, notaController.obtenerResumenMateriasEstudiante);
router.get('/detalle/:id_asignacion/:id_estudiante', verificarAdmin, notaController.obtenerDetalleCriteriosEstudiante);
router.get('/buscar/:id_criterio/:id_asignacion', verificarAdmin, esDocente, notaController.obtenerNotasPorCriterioYGrupo);



module.exports = router;