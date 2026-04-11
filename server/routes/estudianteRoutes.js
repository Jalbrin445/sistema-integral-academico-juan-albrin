const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const { verificarAdmin, esAdmin } = require('../middleware/authMiddleware');

console.log('--- Verificando carga de funciones ---');
console.log('1. verificarAdmin:', typeof verificarAdmin);
console.log('2. esAdmin:', typeof esAdmin);
console.log('3. matricularEstudiante:', typeof estudianteController.matricularEstudiante);
console.log('---------------------------------------');

router.post('/matricular', verificarAdmin, esAdmin, estudianteController.matricularEstudiante);
router.get('/grupo/:id_grupo', verificarAdmin, estudianteController.listarEstudiantesPorGrupo);
module.exports = router;

