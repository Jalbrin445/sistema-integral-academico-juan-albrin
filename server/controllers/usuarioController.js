const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.registrarUsuarioGeneral = async (req, res) => {
    const connection = await db.getConnection();

    const {
        tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno,
        fecha_nacimiento, genero, telefono, correo_electronico, direccion,
        nombre_usuario, contrasena, rol_id,
        codigo_estudiante, grupo_id,
        especialidad, titulo_profesional
    } = req.body;

    try {
        await connection.beginTransaction();

        // 1. LIMPIEZA DE DATOS (Para evitar errores de MySQL DATE y UNIQUE)
        const f_nac = fecha_nacimiento || null;
        const mail = correo_electronico || null;
        const tel = telefono || null;

        // 2. INSERTAR EN TABLA PERSONA
        const [personaRes] = await connection.query(
            `INSERT INTO persona (tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno, f_nac, genero, tel, mail, direccion]
        );
        const id_persona = personaRes.insertId;

        // 3. HASHEAR CONTRASEÑA
        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(contrasena, salt);

        // 4. INSERTAR EN TABLA USUARIO
        const [usuarioRes] = await connection.query(
            `INSERT INTO usuario (rol_id_rol, nombre_usuario, contrasena, correo_electronico, telefono)
            VALUES (?, ?, ?, ?, ?)`,
            [rol_id, nombre_usuario, hashPass, mail, tel]
        ); 
        const id_usuario = usuarioRes.insertId;

        // 5. INSERTAR EN TABLA ESPECÍFICA (ESTUDIANTE O DOCENTE)
        const fechaIngreso = new Date().toISOString().slice(0, 10); // Fecha actual YYYY-MM-DD

        if (rol_id === '3') { // Estudiante
            // Ajustado a tus columnas: persona_id_persona, usuario_id_usuario, grupo_id_grupo
            await connection.query(
                `INSERT INTO estudiante (codigo_estudiante, fecha_ingreso, estado, usuario_id_usuario, persona_id_persona, grupo_id_grupo) 
                VALUES (?, ?, 'activo', ?, ?, ?)`,
                [codigo_estudiante, fechaIngreso, id_usuario, id_persona, grupo_id]
            );
        } else if (rol_id === '2') { // Docente
            // Ajustado a tus columnas: persona_id_persona, usuario_id_usuario
            const codDocente = `DOC-${numero_identificacion.slice(-4)}`; // Generar código simple
            await connection.query(
                `INSERT INTO docente (codigo_docente, titulo_profesional, especialidad, fecha_ingreso, estado, persona_id_persona, usuario_id_usuario) 
                VALUES (?, ?, ?, ?, 'activo', ?, ?)`,
                [codDocente, titulo_profesional, especialidad, fechaIngreso, id_persona, id_usuario]
            );
        }
        
        await connection.commit();
        res.status(201).json({ 
            msg: "Usuario registrado completamente en SIA.",
            detalles: { id_persona, id_usuario }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error("Error detallado:", error);
        
        // Manejo de errores comunes de MySQL
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ msg: "El documento, usuario o correo ya existen." });
        }

        res.status(500).json({ 
            msg: "Error al registrar en la base de datos", 
            error: error.message,
            sqlMessage: error.sqlMessage 
        });
    } finally {
        connection.release();
    }
};

exports.cambiarEstadoUsuario = async (req, res) => {

    const { id_usuario } = req.params;
    const { activo } = req.body;
    const connection = await db.getConnection();

    if (activo !== 0 && activo !== 1) {
        return res.status(400).json({ msg: "El estado debe ser 0 (inactivo) o 1 (activo)" });
    }

    try {
        await connection.beginTransaction();

        const idAdminLogueado = req.usuario.id || req.usuario.id_usuario;

        if (parseInt(id_usuario) === idAdminLogueado && activo === 0) {
            return res.status(403).json({
                msg:"No puedes desactivar tu propia cuenta de administrador"
            });
        }

        const [resultado] = await connection.query(
            "UPDATE usuario SET activo = ? WHERE id_usuario = ?",
            [activo, id_usuario]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ msg: "Usuario no encontrado"});
        }

        const estadoTexto = activo === 1 ? 'activo' : 'inactivo';

        await connection.query(
            "UPDATE estudiante SET estado = ? WHERE usuario_id_usuario = ?",
            [estadoTexto, id_usuario]
        );

        await connection.query(
            "UPDATE docente SET estado = ? WHERE usuario_id_usuario = ?",
            [estadoTexto, id_usuario]
        );
        
        await connection.commit();

        res.json({
            msg:`El usuario con ID ${id_usuario} ha sido ${estadoTexto} correctamente.`
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({
            msg: "Error al cambiar estado",
            error: error.message
        })
    } finally {
        connection.release();
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
            e.codigo_estudiante, g.nombre_grupo
            FROM usuario u
            INNER JOIN estudiante e ON u.id_usuario = e.usuario_id_usuario
            INNER JOIN persona p ON e.persona_id_persona = p.id_persona
            LEFT JOIN grupo g ON e.grupo_id_grupo = g.id_grupo
            WHERE u.rol_id_rol = 3
            `;
        } else if (parseInt(id_rol) === 2) {
            query = `
            SELECT 
            u.id_usuario, u.nombre_usuario, u.correo_electronico, u.activo, 
            p.nombres, p.apellido_paterno, p.apellido_materno,
            d.id_docente, d.especialidad, d.titulo_profesional
            FROM usuario u
            INNER JOIN docente d ON u.id_usuario = d.usuario_id_usuario
            INNER JOIN persona p ON d.persona_id_persona = p.id_persona
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


exports.actualizarUsuarioGeneral = async (req, res) => {
    const connection = await db.getConnection();
    const { id_usuario } = req.params; 
    const {
        nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion,
        codigo_estudiante, grupo_id_grupo,
        especialidad, titulo_profesional
    } = req.body;

    try {
        await connection.beginTransaction();

        // 1. Obtener el rol y el persona_id_persona buscando en las tablas de roles
        // Intentamos buscar en estudiante
        let [vinculo] = await connection.query(
            'SELECT persona_id_persona, 3 as rol FROM estudiante WHERE usuario_id_usuario = ?', 
            [id_usuario]
        );

        // Si no es estudiante, buscamos en docente
        if (vinculo.length === 0) {
            [vinculo] = await connection.query(
                'SELECT persona_id_persona, 2 as rol FROM docente WHERE usuario_id_usuario = ?', 
                [id_usuario]
            );
        }

        if (vinculo.length === 0) {
            await connection.rollback();
            return res.status(404).json({ msg: "No se encontró el vínculo de persona para este usuario" });
        }

        const { persona_id_persona, rol } = vinculo[0];

        // 2. Actualizar Tabla Persona
        await connection.query(
            `UPDATE persona SET 
                nombres = ?, apellido_paterno = ?, apellido_materno = ?, 
                fecha_nacimiento = ?, genero = ?, telefono = ?, 
                correo_electronico = ?, direccion = ? 
            WHERE id_persona = ?`,
            [nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion, persona_id_persona]
        );

        // 3. Actualizar Tabla Usuario (Sincronizar contacto)
        await connection.query(
            `UPDATE usuario SET correo_electronico = ?, telefono = ? WHERE id_usuario = ?`,
            [correo_electronico, telefono, id_usuario]
        );

        // 4. Actualizar datos específicos del Rol
        if (rol === 3) {
            await connection.query(
                `UPDATE estudiante SET codigo_estudiante = ?, grupo_id_grupo = ? WHERE usuario_id_usuario = ?`,
                [codigo_estudiante, grupo_id_grupo, id_usuario]
            );
        } else if (rol === 2) {
            await connection.query(
                `UPDATE docente SET especialidad = ?, titulo_profesional = ? WHERE usuario_id_usuario = ?`,
                [especialidad, titulo_profesional, id_usuario]
            );
        }

        await connection.commit();
        res.json({ msg: "Perfil actualizado correctamente en SIA" });

    } catch (error) {
        await connection.rollback();
        console.error("Error al actualizar:", error);
        res.status(500).json({ msg: "Error interno al actualizar datos", error: error.message });
    } finally {
        connection.release();
    }
};

exports.obtenerUsuarioPorId = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        // Query corregida: Ya que usuario no tiene persona_id_persona,
        // entramos por las tablas estudiante/docente para llegar a persona.
        const query = `
            SELECT 
                u.id_usuario, u.nombre_usuario, u.correo_electronico, u.rol_id_rol, u.activo,
                p.*, 
                e.codigo_estudiante, e.grupo_id_grupo, 
                d.especialidad, d.titulo_profesional
            FROM usuario u
            LEFT JOIN estudiante e ON u.id_usuario = e.usuario_id_usuario
            LEFT JOIN docente d ON u.id_usuario = d.usuario_id_usuario
            LEFT JOIN persona p ON (e.persona_id_persona = p.id_persona OR d.persona_id_persona = p.id_persona)
            WHERE u.id_usuario = ?
        `;
        const [rows] = await db.query(query, [id_usuario]);

        if (rows.length === 0) return res.status(404).json({ msg: "Usuario no encontrado" });

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener datos", error: error.message });
    }
};