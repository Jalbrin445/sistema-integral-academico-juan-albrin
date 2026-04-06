const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.registrarUsuarioGeneral = async (req, res) => {
    const connection = await db.getConnection();

    const {
        tipo_identificacion, numero_identificacion,nombres, apellido_paterno, apellido_materno,
        fecha_nacimiento, genero, telefono, correo_electronico, direccion,
        nombre_usuario, contrasena, rol_id
    } = req.body;

    try {
        await connection.beginTransaction();

        const [personaRes] = await connection.query(
            `INSERT INTO persona (tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion]
        );
        const id_persona = personaRes.insertId;

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(contrasena, salt);

        await connection.query(
            `INSERT INTO usuario (rol_id_rol, nombre_usuario, contrasena, correo_electronico, telefono)
            VALUES (?, ?, ?, ?, ?)`,
            [rol_id, nombre_usuario, hashPass, correo_electronico, telefono]
        );

        await connection.commit();
        res.status(201).json({ msg: "Registro exitoso: Persona y Usuario Creados."});
        
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ msg: "Error al registrar", error:error.message });
    } finally {
        connection.release();
    }
};
