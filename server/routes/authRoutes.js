const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {verificarToken} = require('../middleware/authMiddleware');
const { validateLogin, handleValidationErrors } = require('../middleware/validators');
const { loginLimiter } = require('../middleware/rateLimiter')

router.post('/login',
    loginLimiter,
    validateLogin,
    handleValidationErrors, 
    authController.login
);

router.get('/verify', 
    verificarToken, 
    authController.verificarToken
);
router.post('/logout', authController.logout);


module.exports = router;

