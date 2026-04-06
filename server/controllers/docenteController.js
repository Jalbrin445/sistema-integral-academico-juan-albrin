const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.registrarDocente = async (req, res) => {
    let connection;
    const {
        tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno,
        fecha_nacimiento, genero, telefono, correo_electronico, direccion,
        nombre_usuario, contrasena, 
        codigo_docente, titulo_profesional,especialidad
    } = req.body;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [personaRes] = await connection.query(
            `INSERT INTO persona (tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion]
        );

        const id_persona = personaRes.insertId;

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(contrasena, salt);

        const [usuarioRes] = await connection.query(
            `INSERT INTO usuario (rol_id_rol, nombre_usuario, contrasena, correo_electronico, telefono)
            VALUES (2, ?, ?, ?, ?)`,
            [nombre_usuario, hashPass, correo_electronico, telefono]
        );

        const id_usuario = usuarioRes.insertId;

        await connection.query(
            `INSERT INTO docente (codigo_docente, titulo_profesional, especialidad, fecha_ingreso, estado, persona_id_persona, usuario_id_usuario)
            VALUES (?, ?, ?, CURDATE(), 'activo', ?, ?)`,
            [codigo_docente, titulo_profesional, especialidad, id_persona, id_usuario]
        );

        await connection.commit();
        res.status(201).json({ msg:"Docente vinculado al sistema con éxito" });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en registro docente:", error);
        res.status(500).json({ msg: "Error al registrar docente", error: error.message});
    } finally {
        if (connection) connection.release();
    }
};