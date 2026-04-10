const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.registrarDocente = async (req, res) => {
    let connection;
    const {
        tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno,
        fecha_nacimiento, genero, telefono, correo_electronico, direccion,
        nombre_usuario, contrasena, 
        codigo_docente, titulo_profesional,especialidad,
        estado_admin
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
            `INSERT INTO usuario (rol_id_rol, nombre_usuario, contrasena, correo_electronico, telefono, activo)
            VALUES (2, ?, ?, ?, ?, 1)`,
            [nombre_usuario, hashPass, correo_electronico, telefono]
        );

        const id_usuario = usuarioRes.insertId;

        await connection.query(
            `INSERT INTO docente (codigo_docente, titulo_profesional, especialidad, fecha_ingreso, estado, persona_id_persona, usuario_id_usuario)
            VALUES (?, ?, ?, CURDATE(), ?, ?, ?)`,
            [codigo_docente, titulo_profesional, especialidad, estado_admin || 'activo',id_persona, id_usuario]
        );

        await connection.commit();
        res.status(201).json({ 
            msg:"Docente vinculado al sistema con éxito",
            detalles: { usuario_id: id_usuario, persona_id: id_persona}
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en registro docente:", error);
        res.status(500).json({ msg: "Error al registrar docente", error: error.message});
    } finally {
        if (connection) connection.release();
    }
};

exports.obtenerDocentes = async (req, res) => {
    try {
        
        const [rows] = await db.query(
            `SELECT d.id_docente, p.nombres, p.apellido_paterno, p.apellido_materno, d.especialidad
            FROM docente d
            JOIN persona p ON d.persona_id_persona = p.id_persona
            WHERE d.estado = 'activo'` 
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener docentes:", error);
        res.status(500).json({ 
            msg: "Error al obtener la lista de docentes", 
            error: error.message 
        });
    }
};