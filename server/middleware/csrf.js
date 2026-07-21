const csrf = require('csurf');

const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite:'lax'
    }
});


const csrfTokenMiddleware = (req, res, next) => {
    if (req.path !== '/login' && req.path !== '/register') {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
    }
    next();
}

const csrfHeaderCheck = (req, res, next) => {
    const methods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (methods.includes(req.method)){
        const csrfToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];
        if (!csrfToken) {
            return res.status(403).json({
                msg: 'Token CSRF requerido'
            });
        }
    }
    next();
};

module.exports = { csrfProtection, csrfTokenMiddleware, csrfHeaderCheck}