const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { logger } = require('../utils/logger');

const fileAccess = async (req, res, next) => {
    const user = req.usuario;
    const filePath = req.path;

    if (!user) {
        return res.status(401).json({
            msg: 'No autenticado'
        });
    }

    try {
        if (Number(user.rol_id_rol) === 1) {
            return next();
        }
        
        if (Number(user.rol_id_rol) === 2) {
            const filename = path.basename(filePath);
            const [incapacidad] = await db.query(
                'SELECT docente_id_docente FROM incapacidad WHERE archivo_url = ?',
                [filename]
            );
            

            if (incapacidad.length > 0) {
                if (incapacidad[0].docente_id_docente === user.id_docente) {
                    return next();
                }
            }

            const [materia] = await db.query(
                `SELECT a.docente_id_docente
                FROM asignacion_materia a
                WHERE a.docente_id_docente = ?`,
                [user.id_docente]
            );

            if (materia.length > 0) {
                return next();
            }

            logger.warn('Intento de acceso no autorizado a archivo: ', {
                userId: user.id,
                filePath: filePath,
                rol: 'docente'
            });
            return res.status(403).json({
                msg: 'No tienes permiso para acceder a este archivo'
            });
        }

        if (Number(user.rol_id_rol) === 3) {
            
            const [estudiante] = await db.query(
                'SELECT grupo_id_grupo FROM estudiante WHERE usuario_id_usuario = ?',
                [user.id]
            );

            if (estudiante.length > 0) {
                
                const [materia] = await db.query(
                    `SELECT a.id_asignacion
                    FROM asignacion_materia a
                    WHERE a.grupo_id_grupo = ?`,
                    [estudiante[0].grupo_id_grupo]
                );

                if (materia.length > 0) {
                    return next();
                }
            }

            logger.warn('Intento de acceso no autorizado a archivo: ', {
                userId: user.id,
                filePath: filePath,
                rol: 'estudiante'
            });

            return res.status(403).json({
                msg: 'No tienes permiso para acceder a este archivo'
            });
        }

        return res.status(403).json({
            msg: 'No tienes permiso para acceder a este archivo'
        });
    } catch (error) {
        logger.error('Error en fileAccess: ', error);
        return res.status(500).json({
            msg: 'Error al verificar permisos de archivo'
        });
    }
};

module.exports = { fileAccess };