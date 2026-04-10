const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    try {
        // 1. Buscamos al usuario y sus datos relacionados
        // Corregido el JOIN: usamos persona_id_persona que es la FK en la tabla usuario
        const [rows] = await db.query(
            `SELECT u.*, r.nombre_rol, p.nombres 
            FROM usuario u
            JOIN rol r ON u.rol_id_rol = r.id_rol
            JOIN persona p ON u.id_usuario = p.id_persona -- Volvemos a la relación original
            WHERE u.nombre_usuario = ?`, [nombre_usuario]
        );

        if (rows.length === 0) {
            return res.status(404).json({ msg: "Usuario no registrado" });
        }

        const user = rows[0];

        // 2. VERIFICACIÓN DE ESTADO ACTIVO
        if (Number(user.activo) === 0) {
            return res.status(403).json({
                msg: "Tu cuenta se encuentra inactiva. Por favor, comunícate o acércate a la oficina del colegio para más información."
            });
        }

        // 3. VERIFICACIÓN DE CONTRASEÑA
        const validPass = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPass) {
            return res.status(400).json({ msg: "Contraseña incorrecta" });
        }

        // 4. GENERACIÓN DE TOKEN
        const token = jwt.sign(
            { id: user.id_usuario, rol: user.rol_id_rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 5. REGISTRO DE ÚLTIMO ACCESO
        await db.query(
            `UPDATE usuario SET ultimo_acceso = NOW() WHERE id_usuario = ?`,
            [user.id_usuario]
        );

        // 6. RESPUESTA EXITOSA
        res.json({
            token,
            user: {
                id: user.id_usuario,
                nombre: user.nombre_usuario,
                nombres: user.nombres,
                rol: user.nombre_rol
            }
        });

    } catch (error) {
        console.error("Error en Login:", error);
        res.status(500).json({ msg: "Error interno en el servidor" });
    }
};

exports.verificarToken = async (req, res) => {
    try {
        // También corregimos el JOIN aquí para mantener la consistencia
        const [rows] = await db.query(
            `SELECT u.id_usuario, u.nombre_usuario, u.rol_id_rol, p.nombres 
            FROM usuario u
            JOIN persona p ON u.persona_id_persona = p.id_persona
            WHERE u.id_usuario = ?`, [req.usuario.id]
        );

        if (rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });

        res.json({ usuario: rows[0] });
    } catch (error) {
        console.error("Error verificando token:", error);
        res.status(500).json({ msg: "Error al verificar token" });
    }
};