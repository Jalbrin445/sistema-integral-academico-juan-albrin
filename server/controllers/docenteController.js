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
    if (!apellido_paterno){
        return res.status(400).json({
            msg:"Se requiere por lo menos un apellido (El primero)"
        });
    }
    if (!nombre_usuario) {
        return res.status(400).json({
            msg:"El nombre de usuario es obligatorio"
        });
    }

    if (!contrasena) {
        return res.status(400).json({
            msg: "La contraseña es obligatoria"
        })
    }
    
    if (contrasena.length < 6) {
        return res.status(400).json({
            msg: "La contraseña debe tener al menos 6 caracteres"
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
            })
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
        console.error("Error interno en el servidor:", error);
        res.status(500).json({ msg: "Ocurrió un error interno en el servidor"});
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
            msg:"Ocurrió un error interno en el servidor" 
        });
    }
};