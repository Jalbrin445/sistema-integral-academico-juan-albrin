const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const { verificarAdmin, esAdmin } = require('../middleware/authMiddleware');

router.post('/matricular', verificarAdmin, esAdmin, estudianteController.matricularEstudiante);
router.get('/grupo/:id_grupo', verificarAdmin, estudianteController.listarEstudiantesPorGrupo);
module.exports = router;

