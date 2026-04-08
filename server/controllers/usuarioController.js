const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.registrarUsuarioGeneral = async (req, res) => {
    const connection = await db.getConnection();

    const {
        tipo_identificacion, numero_identificacion,nombres, apellido_paterno, apellido_materno,
        fecha_nacimiento, genero, telefono, correo_electronico, direccion,
        nombre_usuario, contrasena, rol_id,
        codigo_estudiante, grupo_id,
        especialidad, titulo_profesional
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

        const [usuarioRes] = await connection.query(
            `INSERT INTO usuario (rol_id_rol, nombre_usuario, contrasena, correo_electronico, telefono)
            VALUES (?, ?, ?, ?, ?)`,
            [rol_id, nombre_usuario, hashPass, correo_electronico, telefono]
        );  

        const id_usuario = usuarioRes.insertId
        await connection.commit();
        res.status(201).json({ msg: "Registro exitoso: Persona y Usuario Creados.",
            detalles: {
                id_persona,
                id_usuario
            }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ msg: "Error al registrar", error:error.message });
    } finally {
        connection.release();
    }
};

exports.cambiarEstadoUsuario = async (req, res) => {

    const { id_usuario } = req.params;
    const { activo } = req.body;

    if (activo !== 0 && activo !== 1) {
        return res.status(400).json({ msg: "El estado debe ser 0 (inactivo) o 1 (activo)" });
    }

    try {
        const idAdminLogueado = req.usuario.id || req.usuario.id_usuario;

        if (parseInt(id_usuario) === idAdminLogueado && activo === 0) {
            return res.status(403).json({
                msg:"No puedes desactivar tu propia cuenta de administrador"
            });
        }

        const [resultado] = await db.query(
            "UPDATE usuario SET activo = ? WHERE id_usuario = ?",
            [activo, id_usuario]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                msg:"Usuario no encontrado"
            });
        }

        const mensaje = activo === 1 ? "activado": "desactivado (dado de baja)";
        res.json({
            msg:`El usuario con ID ${id_usuario} ha sido ${mensaje} correctamente.`
        });

    } catch (error) {
        res.status(500).json({
            msg: "Error al cambiar estado",
            error: error.message
        })
    }
};


exports.listarUsuariosPorRol = async (req, res) => {

    const { id_rol } = req.params;

    try {
        let query = "";

        if (parseInt(id_rol) === 3) {
            query = `
            SELECT
            u.id_usuario, u.nombre_usuario, u.correo_electronico, u.activo,
            p.nombres, p.apellido_paterno, p.apellido_materno,
            e.codigo_estudiante, e.id_estudiante, g.nombre_grupo
            FROM usuario u
            JOIN estudiante e ON u.id_usuario = e.usuario_id_usuario
            JOIN persona p ON e.persona_id_persona = p.id_persona
            LEFT JOIN grupo g ON e.grupo_id_grupo = g.id_grupo
            WHERE u.rol_id_rol = 3
            `;
        } else if (parseInt(id_rol) === 2) {
            query = `
            SELECT 
            u.id_usuario, u.nombre_usuario, u.correo_electronico, u.activo 
            p.nombres, p.apellido_paterno, p.apellido_materno,
            d.id_docente, d.especialidad, d.titulo_profesional
            FROM usuario u
            JOIN docente d ON u.id_usuario = d.usuario_id_usuario
            JOIN persona p ON d.persona_id_persona = p.id_persona
            WHERE u.rol_id_rol = 2
            `;
        } else {
            return res.status(400).json({
                msg:"Rol no válido para esta lista"
            });
        }
        const [usuarios] = await db.query(query);
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al obtener la lista",
            error: error.message
        });
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