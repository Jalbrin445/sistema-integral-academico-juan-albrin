const winston = require('winston');
const path = require('path');
const fs = require('fs');


const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true});
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'sia-api'},
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
        }),

        new winston.transports.File({
            filename: path.join(logDir, 'audit.log'),
            level: 'info',
            maxsize: 5242880,
            maxFiles: 5,
        })
    ]
});

if (process.env.NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}


const requestLogger = (req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;

    res.send = function(data) {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            user: req.usuario?.id || 'anonymus',
            userAgent: req.headers['user-agent'],
            referer: req.headers['referer'] || req.headers['referrer']
        };

        if (res.statusCode >= 400) {
            logger.error('Request error:', logData);
        } else {
            logger.info('Request completed: ', logData);
        }

        const auditMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (auditMethods.includes(req.method)) {
            logger.info('Audti action', {
                ...logData,
                body: req.body,
                query: req.query
            });
        }
        originalSend.call(this, data);
    };
    next();
};

const logSecurityEvent = (event, details = {}) => {
    logger.warn('Security event: ', {
        event,
        ...details,
        timestamp: new Date().toISOString()
    });
};

module.exports = {logger, requestLogger, logSecurityEvent};