const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.matricularEstudiante = async (req, res) => {
    let connection;
    const {
        tipo_identificacion, numero_identificacion,nombres, apellido_paterno, apellido_materno,
        fecha_nacimiento, genero, telefono, correo_electronico, direccion, nombre_usuario, contrasena,
        codigo_estudiante,eps,grupo_id_grupo 
    } = req.body;

    if (!numero_identificacion) {
        return res.status(400).json({
            msg: "El número de identificación es obligatorio"
        });
    }
    if (!nombres) {
        return res.status(400).json({
            msg: "Los nombres son obligatorios"
        });
    }
    if (!apellido_paterno) {
        return res.status(400).json({
            msg:"Por lo menos se debe añadir un apellido (En la primer posición)"
        })
    }
    if (!nombre_usuario) {
        return res.status(400).json({
            msg: "El nombre de usuario es obligatorio"
        });
    }
    if (!contrasena) {
        return res.status(400).json({
            msg: "El código de estudiante es obligatorio"
        });
    }
    if (!codigo_estudiante) {
        return res.status(400).json({
            msg: "El coigo de estudiante es obligatorio"
        });
    }
    if (!grupo_id_grupo) {
        return res.status(400).json({
            msg: "El grupo es obligatorio para el estudiante"
        });
    }

    if (contrasena.length < 6) {
        return res.status(400).json({
            msg:"La contraseña debe tener al menos 6 caracteres"
        });
    }

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [identificacionExiste] = await connection.query(
            'SELECT id_persona FROM persona WHERE numero_identificacion = ?',
            [numero_identificacion]
        );
        if (identificacionExiste.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                msg: "El número de identificación ya está registrado"
            });
        }
        
        const [usuarioExiste] = await connection.query(
            'SELECT id_usuario FROM usuario WHERE nombre_usuario = ?',
            [nombre_usuario]
        );
        if (usuarioExiste.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                msg: "El nombre de usuario ya está en uso"
            });
        }

        const [grupoExiste] = await connection.query(
            'SELECT id_grupo FROM grupo WHERE id_grupo = ? AND activo = 1',
            [grupo_id_grupo]
        );
        if (grupoExiste.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                msg:"El grupo seleccionado no existe o está inactivo"
            });
        }

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

        console.error("Error interno en el servidor al intentar matricular un estudiante:",error);
        res.status(500).json({ msg:"Ocurrió un error interno en el servidor" });
    } finally {
        if (connection) connection.release();
    }
};

exports.listarEstudiantesPorGrupo = async (req, res) => {
    const { id_grupo } = req.params;
    if (!id_grupo || isNaN(id_grupo)) {
        return res.status(400).json({
            msg: "ID de grupo inválido"
        });
    }
     
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
        console.error("Error al listar los estudiantes por grupo: ", error);
        res.status(500).json({
            msg:"Ocurrió un error interno en el servidor"
        });
    }
};