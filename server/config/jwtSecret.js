const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET) {
    if (isProduction) {
        throw new Error('JWT_SECRET is required in production');
    }

    console.warn('JWT_SECRET no configurado. Se usará un secreto temporal solo para desarrollo.');
}

module.exports = process.env.JWT_SECRET || 'development-fallback-secret';
