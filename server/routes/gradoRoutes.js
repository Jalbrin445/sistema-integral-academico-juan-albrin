const express = require('express');
const router = express.Router();
const gradoController = require('../controllers/gradoController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');


router.get('/', 
    verificarToken, 
    gradoController.obtenerGrados
);
router.post('/', 
    verificarToken, 
    esAdmin, 
    gradoController.crearGrado
);

module.exports = router;