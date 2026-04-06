const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    try {
        const [rows] = await db.query(
            `SELECT u.*, r.nombre_rol FROM usuario u
            JOIN rol r ON u.rol_id_rol = r.id_rol
            WHERE u.nombre_usuario = ?`, [nombre_usuario]
        );

        if (rows.length === 0) return res.status(404).json({msg: "Usuario no existe"});

        const user = rows[0];

        
        const validPass = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPass) return res.status(400).json({msg:"Contraseña incorrecta"});


        const token = jwt.sign(
            {id: user.id_usuario, rol: user.rol_id_rol},
            process.env.JWT_SECRET,
            {expiresIn: '8h'}
        );

        res.json({
            token,
            user: {id: user.id_usuario, nombre: user.nombre_usuario, rol: user.nombre_rol}
        });

    } catch (error) {
        res.status(500).send("Error en el servidor");
    }
};