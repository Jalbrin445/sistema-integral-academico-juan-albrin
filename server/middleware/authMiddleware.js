const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    
    let token = req.cookies.token;

    if (!token) {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')){ 
            token = authHeader.split(' ')[1];
        
        }
    }
    if (!token) {
        return res.status(401).json({ 
            msg: "Acceso denegado. No hay token."
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = {
            id: decoded.id,
            rol_id_rol: decoded.rol || decoded.rol_id_rol,
            rol: decoded.rol || decoded.rol_id_rol
        };
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                msg: "Por favor, inicie sesión nuevamente"
            });
        }
        res.status(401).json({ msg:"Inicio de sesión no válido" });
    }
};

const esAdmin = (req, res, next) => {
    
    if (!req.usuario) {
        return res.status(401).json({
            msg: "No autenticado"
        });
    }

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

const esDocenteOAdmin = (req, res, next) => {
    
    if (!req.usuario) {
        return res.status(401).json({
            msg: "No autenticado"
        });
    }

    const rol = req.usuario.rol || req.usuario.rol_id_rol;
    
    if (req.usuario && (Number(rol) === 2 || Number(rol) == 1)){
        next();
    } else {
        return res.status(403).json({
            msg: "Acceso denegado: se requiere perfil de Docente o Administrador"
        })
    }
};


const esEstudianteOAdmin = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({
            msg: "No autenticado"
        });
    }

    const rol = req.usuario.rol_id_rol || req.usaurio.rol;
    if (Number(rol) === 3 || Number(rol) === 1) {
        next();
    } else {
        return res.status(403).json({
            msg: "Acceso denegado: se requiere perfil de Estudiante o Administrador"
        });
    }
};

module.exports = { verificarToken, esAdmin, esDocenteOAdmin, esEstudianteOAdmin };
