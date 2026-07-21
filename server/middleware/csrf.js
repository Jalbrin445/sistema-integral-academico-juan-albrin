const csrf = require('csurf');

const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite:'lax'
    }
});


const csrfTokenMiddleware = (req, res, next) => {
    const excludedPaths = ['/login', '/register', '/logout'];
    if (excludedPaths.some(path => req.path.includes(path))) {
        return next();
    }

    try {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
    } catch (error) {
        console.warn('CSRF token no disponible para: ', req.path);
    }
    next();
}

const csrfHeaderCheck = (req, res, next) => {
    const methods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (methods.includes(req.method)){
        
        if (req.path.includes('/login') || req.path.includes('/register')) {
            return next();
        }
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