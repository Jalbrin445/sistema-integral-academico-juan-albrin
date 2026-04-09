const jwt = require('jsonwebtoken');

const verificarAdmin = (req, res, next) => {
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ msg: "Acceso denegado. No hay token."});

    try {
        const cifrado = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = {
            id: cifrado.id,
            rol_id_rol: cifrado.rol || cifrado.rol_id_rol
        };
        next();

    } catch (error) {
        res.status(400).json({ msg:"Token no válido o expirado." });
    }
};

const esAdmin = (req, res, next) => {
    const rol = req.usuario.rol || req.usuario.rol_id_rol;
    if (req.usuario && Number(rol) === 1) {
        next();
    } else {
        return res.status(403).json({ 
            msg: "Acceso denegado: Se requiere permisos de administrador",
            rol_recibido: req.usuario ? req.usuario.rol : "ninguno"
        })
    }
};

const esDocente = (req, res, next) => {
    const rol = req.usuario.rol || req.usuario.rol_id_rol;
    if (req.usuario && (Number(rol) === 2 || Number(rol) == 1)){
        next();
    } else {
        return res.status(403).json({
            msg: "Acceso denegado: se requiere perfil de Docente o Administrador"
        })
    }
}
module.exports = { verificarAdmin, esAdmin, esDocente };
