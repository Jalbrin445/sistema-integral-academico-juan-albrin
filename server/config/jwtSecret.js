const crypto = require('crypto');

const fallbackSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
    ? crypto.randomBytes(32).toString('hex')
    : 'development-fallback-secret');

if (!process.env.JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET no configurado. Se usará un secreto temporal para esta ejecución. Defínelo en producción.');
}

module.exports = fallbackSecret;
