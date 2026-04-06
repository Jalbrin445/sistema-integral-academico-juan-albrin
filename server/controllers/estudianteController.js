const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.matricularEstudiante = async (req, res) => {
    let connection;
    const {
        tipo_identificacion, numero_identificacion,nombres, apellido_paterno, apellido_materno,
        fecha_nacimiento, genero, telefono, correo_electronico, direccion, nombre_usuario, contrasena,
        codigo_estudiante,eps,grupo_id_grupo 
    } = req.body;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [personaRes] = await connection.query(
            `INSERT INTO persona (tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            tipo_identificacion, numero_identificacion, nombres, apellido_paterno,
            apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion
        ]
        );
        const id_persona = personaRes.insertId;

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(contrasena, salt);
        const [usuarioRes] = await connection.query(
            `INSERT INTO usuario (rol_id_rol, nombre_usuario, contrasena, correo_electronico, telefono)
            VALUES (3, ?, ?, ?, ?)`,
            [nombre_usuario, hashPass, correo_electronico, telefono]
        );

        const id_usuario = usuarioRes.insertId;

        await connection.query(
            `INSERT INTO estudiante (codigo_estudiante, fecha_ingreso, estado, eps, usuario_id_usuario, persona_id_persona, grupo_id_grupo)
            VALUES (?, CURDATE(), 'activo', ?, ?, ?, ?)`,
            [codigo_estudiante, eps, id_usuario, id_persona, grupo_id_grupo]
        );

        await connection.commit();
        res.status(201).json({ msg: "Estudiante matriculado con éxito" });
    
    } catch (error) {
        if (connection) await connection.rollback();

        console.error(error);
        res.status(500).json({ msg:"Error en la matrícula", error: error.message });
    } finally {
        if (connection) connection.release();
    }
};