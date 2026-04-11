const express = require('express');
const router = express.Router();
const periodoController = require('../controllers/periodoController');
const { verificarAdmin } = require('../middleware/authMiddleware');


router.get('/activos', verificarAdmin, periodoController.getPeriodosActivos);

module.exports = router;