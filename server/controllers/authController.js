const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000
};

const registrarIntentoFallido = async (nombre_usuario, ip) => {
    try {
        await db.query(
            `INSERT into intentos_login (nombre_usuario, ip, fecha_intento)
            VALUES (?, ?, NOW())`,
            [nombre_usuario, ip]
        );
    } catch (error) {
        console.error('Error registrando intento fallido:', error);
    }
};

exports.login = async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    try {
        
        const [rows] = await db.query(
            `SELECT u.*, r.nombre_rol, p.nombres,
                    d.id_docente,
                    e.id_estudiante
            FROM usuario u
            JOIN rol r ON u.rol_id_rol = r.id_rol
            JOIN persona p ON u.id_usuario = p.id_persona
            LEFT JOIN docente d ON p.id_persona = d.persona_id_persona
            LEFT JOIN estudiante e ON u.id_usuario = e.usuario_id_usuario
            WHERE u.nombre_usuario = ?`, [nombre_usuario]
        );

        if (rows.length === 0) {
            await registrarIntentoFallido(nombre_usuario, req.ip);
            return res.status(404).json({ msg: "Usuario no registrado" });
        }

        const user = rows[0];

        if (Number(user.activo) === 0) {
            return res.status(403).json({
                msg: "Tu cuenta se encuentra inactiva. Por favor, comunícate con la administración."
            });
        }

        const validPass = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPass) {
            await registrarIntentoFallido(nombre_usuario, req.ip);
            return res.status(401).json({ msg: "Credenciales incorrectas" });
        }

        const token = jwt.sign(
            { 
                id: user.id_usuario, 
                rol: user.rol_id_rol,
                nombre_usuario: user.nombre_usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        await db.query(
            `UPDATE usuario SET ultimo_acceso = NOW() WHERE id_usuario = ?`,
            [user.id_usuario]
        );

        res.cookie('token', token, cookieOptions);

        return res.json({
            mensaje: 'Login exitoso',
            user: {
                id: user.id_usuario,
                id_usuario: user.id_usuario,
                id_docente: user.id_docente || null,
                id_estudiante: user.id_estudiante || null,
                nombre: user.nombre_usuario,
                nombres: user.nombres,
                rol: user.nombre_rol,
                rol_id_rol: user.rol_id_rol
            }
        });
    } catch (error) {
        console.error("Error en Login:", error);
        res.status(500).json({ msg: "Error interno en el servidor" });
    }
};

exports.verificarToken = async (req, res) => {
    try {
        
        const [rows] = await db.query(
            `SELECT u.id_usuario, u.nombre_usuario, u.rol_id_rol, u.activo,
                    p.nombres, d.id_docente,
                    e.id_estudiante
            FROM usuario u
            JOIN persona p ON u.id_usuario = p.id_persona
            LEFT JOIN docente d ON p.id_persona = d.persona_id_persona
            LEFT JOIN estudiante e ON u.id_usuario = e.usuario_id_usuario
            WHERE u.id_usuario = ?`, [req.usuario.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        const user = rows[0];

        if (Number(user.activo) === 0) {
            return res.status(403).json({
                msg: "Usuario inactivo",
                user: null
            });
        }

        res.json({
            user: {
                id: user.id_usuario,
                id_usuario: user.id_usuario,
                id_docente: user.id_docente || null,
                id_estudiante: user.id_estudiante || null,
                nombre: user.nombre_usuario,
                nombres: user.nombres,
                rol_id_rol: user.rol_id_rol
            }
        });
    } catch (error) {
        console.error("Error verificando token:", error);
        res.status(500).json({ msg: "Error interno en el servidor" });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/'
        });
        return res.json({ msg: "Sesión cerrada exitosamente" });
    } catch (error) {
        console.error("Error en Logout:", error);
        res.status(500).json({ msg: "Error interno en el servidor" });
    }
};