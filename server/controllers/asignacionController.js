const db = require('../config/db');

exports.crearAsignacion = async (req, res) => {
    const { anio_escolar, materia_id_materia, grupo_id_grupo, docente_id_docente } = req.body;

    try {
        const [existe] = await db.query(
            `SELECT * FROM asignacion_materia
            WHERE anio_escolar = ? AND materia_id_materia = ? AND grupo_id_grupo = ?`,
            [anio_escolar, materia_id_materia, grupo_id_grupo]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                msg: "Esta materia ya está asignada a este grupo para el año actual"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO asignacion_materia (anio_escolar, activo, materia_id_materia, grupo_id_grupo, docente_id_docente)
            VALUES (?, 1, ?, ?, ?)`,
            [anio_escolar, materia_id_materia, grupo_id_grupo, docente_id_docente]
        );

        res.status(201).json({
            msg: "Carga académica asignada con éxito",
            id_asignacion: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Error al crear la asignación", 
            error: error.message
        });
    }
};

exports.obtenerCargaDocente = async (req, res) => {
    const { id_docente } = req.params;
    try {
        const [carga] = await db.query(
        `SELECT a.id_asignacion, m.nombre_materia, g.nombre_grupo, a.anio_escolar
        FROM asignacion_materia a
        JOIN materia m ON a.materia_id_materia = m.id_materia
        JOIN grupo g ON a.grupo_id_grupo = g.id_grupo
        WHERE a.docente_id_docente = ? AND a.activo = 1`,
        [id_docente]
        );
        res.json(carga);
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener la carga del docente"
        });
    }
};