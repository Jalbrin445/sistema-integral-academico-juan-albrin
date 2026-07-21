const db = require('../config/db');

exports.obtenerGrupos = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT g.id_grupo, g.nombre_grupo, g.anio_escolar, gr.nombre_grado
            FROM grupo g
            JOIN grado gr ON g.grado_id_grado = gr.id_grado
            WHERE g.activo = 1`
        );
        res.json(rows);
    } catch (error) {
        console.error("Error interno en el servidor", error);
        res.status(500).json({ msg: "Ocurrió un error interno en el servidor" });
    }
};

exports.crearGrupo = async (req, res) => {
    const { 
        nombre_grupo, 
        anio_escolar, 
        capacidad_maxima, 
        grado_id_grado, 
        docente_id_docente 
    } = req.body;

    if (!nombre_grupo) {
        return res.status(400).json({
            msg: "El nombre del grupo es obligatorio"
        });
    }
    if (!anio_escolar) {
        return res.status(400).json({
            msg: "El año escolar es obligatorio"
        });
    }
    if (!capacidad_maxima) {
        return res.status(400).json({
            msg: "La capacidad máxima es obligatoria"
        });
    }
    if (!grado_id_grado) {
        return res.status(400).json({
            msg: "El grado es obligatorio"
        });
    }

    const anioActual = new Date().getFullYear();
    if (isNaN(anio_escolar) || anio_escolar < 2000 || anio_escolar > anioActual + 1) {
        return res.status(400).json({
            msg:"Año escolar inválido"
        });
    }

    if (isNaN(capacidad_maxima) || capacidad_maxima < 1 || capacidad_maxima > 50) {
        return res.status(400).json({
            msg: "La capacidad máxima debe ser un número entre 1 y 50"
        });
    }

    const [gradoExiste] = await db.query(
        'SELECT id_grado FROM grado WHERE id_grado = ?',
        [grado_id_grado]
    );
    if (gradoExiste.length === 0) {
        return res.status(400).json({
            msg: "El grado seleccionado no existe"
        });
    }

    if (docente_id_docente) {
        const [docenteExiste] = await db.query(
            'SELECT id_docente FROM docente WHERE id_docente = ? AND estado = "activo"',
            [docente_id_docente]
        );
    
        if (docenteExiste.length === 0) {
            return res.status(404).json({
                msg: "El docente seleccionado no existe o no está activo"
            });
        }
    }

    const [grupoExiste] = await db.query(
        'SELECT id_grupo FROM grupo WHERE nombre_grupo = ? AND anio_escolar = ? AND activo = 1',
        [nombre_grupo, anio_escolar]
    );

    if (grupoExiste.length > 0){
        return res.status(400).json({
            msg: "Ya existe un grupo con este nombre para el año escolar seleccionado"
        });
    }
    
    try {
        const [resultado] = await db.query(
            `INSERT INTO grupo (nombre_grupo, anio_escolar, capacidad_maxima, activo, grado_id_grado, docente_id_docente) 
            VALUES (?, ?, ?, 1, ?, ?)`,
            [nombre_grupo, anio_escolar, capacidad_maxima, grado_id_grado, docente_id_docente]
        );

        res.status(201).json({ 
            msg: "Grupo creado con éxito", 
            id_grupo: resultado.insertId 
        });
    } catch (error) {
        console.error("Error interno en el servidor al crear grupos: ", error);
        res.status(500).json({ 
            msg: "Ocurrió un error interno en el servidor"  
        });
    }
};