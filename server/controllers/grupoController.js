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
        res.status(500).json({ msg: "Error al obtener grupos", error: error.message });
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
        console.error(error);
        res.status(500).json({ 
            msg: "Error al crear el grupo", 
            error: error.message 
        });
    }
};