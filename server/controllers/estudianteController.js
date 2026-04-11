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
            `INSERT INTO usuario (rol_id_rol, nombre_usuario, contrasena, correo_electronico, telefono, activo)
            VALUES (3, ?, ?, ?, ?, 1)`,
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

exports.listarEstudiantesPorGrupo = async (req, res) => {
    const { id_grupo } = req.params;

    try {
        const [estudiantes] = await db.query(
            `SELECT
            e.id_estudiante,
            e.codigo_estudiante,
            p.nombres,
            p.apellido_paterno,
            p.apellido_materno,
            u.activo
            FROM estudiante e
            JOIN persona p ON e.persona_id_persona = p.id_persona
            JOIN usuario u ON e.usuario_id_usuario = u.id_usuario
            WHERE e.grupo_id_grupo = ? AND u.activo = 1
            ORDER BY p.apellido_paterno ASC
            `,
            [id_grupo]
        );

        if (estudiantes.length === 0) {
            return res.status(404).json({
                msg: "No se encontraron estudiantes activos en este grupo."
            });
        }

        res.json(estudiantes);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg:"Error al obtener estudiantes", 
            error: error.message
        });
    }
};