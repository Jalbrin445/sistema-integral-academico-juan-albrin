const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        msg: 'Demasiadas peticiones'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15*60*1000,
    max: 5,
    message: {
        msg: 'Demasiados intentos de inicio de sesión'
    },
    skipSuccessfulRequests:true,
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        msg: 'Demasiados registros, espere un momento'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, loginLimiter, registerLimiter };

