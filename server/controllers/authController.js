const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    try {
        const [rows] = await db.query(
            `SELECT u.*, r.nombre_rol, p.nombres FROM usuario u
            JOIN rol r ON u.rol_id_rol = r.id_rol
            JOIN persona p ON u.id_usuario = p.id_persona
            WHERE u.nombre_usuario = ?`, [nombre_usuario]
        );

        if (rows.length === 0) return res.status(404).json({msg: "Usuario no existe"});

        const user = rows[0];

        if (Number(user.activo) === 0) {
            return res.status(403).json({
                msg: "Acceso denegado: esta cuenta ha sido desactivada por la administración del SIA."
            });
        }

        const validPass = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPass) return res.status(400).json({msg:"Contraseña incorrecta"});


        const token = jwt.sign(
            {id: user.id_usuario, rol: user.rol_id_rol},
            process.env.JWT_SECRET,
            {expiresIn: '8h'}
        );

        await db.query(`
            UPDATE usuario SET ultimo_acceso = NOW()
            WHERE id_usuario = ?
            `, [user.id_usuario]);

        res.json({
            token,
            user: {
                id: user.id_usuario,
                nombre:user.nombre_usuario,
                nombres: user.nombres,
                rol: user.nombre_rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error en el servidor");
    }
};

exports.verificarToken = async (req, res) => {
    try {
        // Buscamos al usuario usando el ID que el middleware extrajo del token
        const [rows] = await db.query(
            `SELECT u.id_usuario, u.nombre_usuario, u.rol_id_rol, p.nombres 
            FROM usuario u
            JOIN persona p ON u.id_usuario = p.id_persona
            WHERE u.id_usuario = ?`, [req.usuario.id]
        );

        if (rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });

        res.json({ usuario: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al verificar token" });
    }
};