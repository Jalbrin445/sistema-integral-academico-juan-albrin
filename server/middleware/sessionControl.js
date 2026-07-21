const db = require('../config/db');
const { logger } = require('../utils/logger');


const checkSessionTimeout = async (req, res, next) => {
    if (!req.usuario) return next();

    try {
        const [rows] = await db.query(

            'SELECT ultimo_acceso, activo FROM usuario WHERE id_usuario = ?',
            [req.usuario.id]
        );

        if (rows.length > 0) {
            if (Number(rows[0].activo) === 0) {
                logger.warn('Intento de acceso con usuario inactivo: ', {
                    userId: req.usuario.id,
                    ip: req.ip
                });
                return res.status(403).json({
                    msg: 'Usuario inactivo. Contacte al administrador'
                });
            }
            
            const lastAccess = new Date(rows[0].ultimo_acceso);
            const now = new Date();
            const diffMinutes = (now - lastAccess) / (1000*60);

            const timeoutMinutes = process.env.SESSION_TIMEOUT_MINUTES || 30;

            if (diffMinutes > timeoutMinutes) {
                logger.warn('Sesión expirada por inactividad: ', {
                    userId: req.usuario.id,
                    lastAccess: lastAccess,
                    diffMinutes: diffMinutes,
                    ip: req.ip
                });
                return res.status(401).json({
                    msg: `Sesión expirada por inactividad (${timeoutMinutes} minutos)`
                });
            }

            await db.query(
                'UPDATE usuario SET ultimo_acceso = NOW() WHERE id_usuario = ?',
                [req.usuario.id]
            );
        }
        next();
    } catch (error) {
        logger.error('Error en sessionControl:', error);
        next();
    }
};

module.exports = { checkSessionTimeout };