const db = require('../config/db');

exports.crearAsignacion = async (req, res) => {
    const { anio_escolar, materia_id_materia, grupo_id_grupo, docente_id_docente } = req.body;

    if (!anio_escolar || !materia_id_materia || !grupo_id_grupo || !docente_id_docente) {
        
        return res.status(400).json({
            msg:"Todos los campos son requeridos"
        });
    }
    try {

        const [materia] = await db.query(
            'SELECT id_materia FROM materia WHERE id_materia = ? AND activo = 1',
            [materia_id_materia]
        );
        if (materia.length === 0) {
            return res.status(404).json({
                msg: "Materia no encontrada o inactiva"
            });
        }

        const [grupo] = await db.query(
            'SELECT id_grupo FROM grupo WHERE id_grupo = ? AND activo = 1',
            [grupo_id_grupo]
        );
        if (grupo.length === 0) {
            return res.status(404).json({
                msg: "Grupo no enconetrado o inactivo"
            });
        }

        const [docente] = await db.query(
            'SELECT id_docente FROM docente WHERE id_docente = ? AND estado = "activo"',
            [docente_id_docente]
        );
        
        if (docente.length === 0) {
            return res.status(404).json({
                msg:"Docente no encontrado o inactivo"
            });
        }
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
        console.error("Error interno en el servidor al crear la asignacion:", error);
        res.status(500).json({
            msg: "Ocurrió un error interno en el servidor"
        });
    }
};

exports.obtenerCargaDocente = async (req, res) => {
    const { id_docente } = req.params;

    if (!id_docente || isNaN(id_docente)) {
        return res.status(400).json({
            msg: "ID de docente inválido"
        });
    }
    try {
        const [carga] = await db.query(
        `SELECT a.id_asignacion, m.nombre_materia, a.grupo_id_grupo, g.nombre_grupo, a.anio_escolar
        FROM asignacion_materia a
        JOIN materia m ON a.materia_id_materia = m.id_materia
        JOIN grupo g ON a.grupo_id_grupo = g.id_grupo
        WHERE a.docente_id_docente = ? AND a.activo = 1`,
        [id_docente]
        );
        res.json(carga);
    } catch (error) {
        console.error("Ocurrió un error interno en el servidor al obtener la carga Docente: ", error)
        res.status(500).json({
            msg: "Error al obtener la carga del docente"
        });
    }
};