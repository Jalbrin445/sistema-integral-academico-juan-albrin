const db = require('../config/db');

exports.registrarNota = async (req, res) => {
    const {
        nota,
        observaciones,
        criterio_id,
        estudiante_id,
        asignacion_id,
        docente_id,
        periodo_id
    } = req.body;

    if (nota < 0 || nota > 5) {
        return res.status(400).json({ msg: "La nota debe estar entre 0.0 y 5.0" });
    }

    try {
        
        const [resultado] = await db.query(
            `INSERT INTO calificacion (nota, observaciones, fecha_registro, criterio_evaluacion_id_criterio, estudiante_id_estudiante, asignacion_materia_id_asignacion, docente_id_docente, periodo_academico_id_periodo)
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)`,
            [nota, observaciones, criterio_id, estudiante_id, asignacion_id, docente_id, periodo_id]
        );

        res.status(201).json({
            msg: "Calificación registrada con éxito",
            id_calificacion: resultado.insertId
        });

    } catch (error) {
        console.error("Error al registrar nota:", error);
        res.status(500).json({
            msg: "Error en el servidor al registrar la nota",
            error: error.message
        });
    }
};

exports.actualizarNota = async (req, res) => {

    const { id_calificacion } = req.params;
    const { nota, observaciones } = req.body;

    if (nota < 0 || nota > 5) {
        return res.status(400).json({
            msg: "La nota debe estar entre 0.0 y 5.0"
        });
    }

    try {
        const [resultado] = await db.query(
            `UPDATE calificacion
            SET nota = ?,
            observaciones = ?,
            fecha_registro = CURDATE()
            WHERE id_calificacion = ?`,
            [nota, observaciones, id_calificacion]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                msg:"No se encontró la calificación para actualizar."
            });
        }

        res.json({
            msg:"Calificación actualizada correctamente"
        });
    } catch (error) {
        console.error("Error al actualizar nota:", error);
        res.status(500).json({
            msg:"Error en el servidor al actualizar la nota",
            error:error.message
        });
    }
};

exports.obtenerNotasEstudiante = async (req, res) => {
    const { estudiante_id, asignacion_id } = req.params;
    try {
        const [notas] = await db.query(
            `SELECT 
            c.id_calificacion, 
            c.nota, 
            c.observaciones,
            c.fecha_registro,
            ce.nombre_criterio,
            ce.porcentaje,
            pa.nombre_periodo
            FROM calificacion c
            JOIN criterio_evaluacion ce ON c.criterio_evaluacion_id_criterio = ce.id_criterio
            JOIN periodo_academico pa ON c.periodo_academico_id_periodo = pa.id_periodo
            WHERE c.estudiante_id_estudiante = ? AND c.asignacion_materia_id_asignacion = ?
            ORDER BY pa.numero_periodo ASC, c.fecha_registro DESC`,
            [estudiante_id, asignacion_id]
        );

        if (notas.length === 0) {
            return res.status(404).json({
                msg: "Aún no hay notas registradas para esta materia."
            });
        }
        res.json(notas)
    } catch (error) {
        console.error("Error en obtenerNotasEstudiante:", error);
        res.status(500).json({
            msg:"Error al obtener boletín",
            error:error.message
        });
    }
};

exports.obtenerResumenMateriasEstudiante = async (req, res) => {
    const { id_estudiante } = req.params;

    try {
        const [materias] = await db.query(
            `SELECT 
            m.nombre_materia,
            m.descripcion,
            CONCAT(p.nombres, ' ', p.apellido_paterno, ' ', p.apellido_materno) AS nombre_docente, 
            a.id_asignacion,
            ROUND(IFNULL(SUM(c.nota * (ce.porcentaje / 100)), 0), 2) AS nota_parcial
            FROM asignacion_materia a
            JOIN materia m ON a.materia_id_materia = m.id_materia
            JOIN usuario u_docente ON a.docente_id_docente = u_docente.id_usuario
            JOIN persona p ON u_docente.id_usuario = p.id_persona 
            LEFT JOIN calificacion c ON c.asignacion_materia_id_asignacion = a.id_asignacion 
            AND c.estudiante_id_estudiante = ?
            LEFT JOIN criterio_evaluacion ce ON c.criterio_evaluacion_id_criterio = ce.id_criterio
            WHERE c.estudiante_id_estudiante = ? OR c.estudiante_id_estudiante IS NULL
            GROUP BY a.id_asignacion, m.nombre_materia, m.descripcion, p.nombres, p.apellido_paterno, p.apellido_materno`,
            [id_estudiante, id_estudiante]
        );

        if (materias.length === 0) {
            return res.status(200).json({ 
                msg: "No se encontraron materias vinculadas a este estudiante." 
            });
        }

        res.json(materias);
    } catch (error) {
        console.error("Error SQL:", error.message);
        res.status(500).json({ 
            msg: "Error al obtener el resumen del estudiante", 
            error: error.message 
        });
    }
};

exports.crearCriterioEvaluacion = async (req, res) => {

    const { id_asignacion, nombre_criterio, porcentaje } = req.body;

    try {
        const [suma] = await db.query(
            `SELECT SUM(porcentaje) as total
            FROM criterio_evaluacion
            WHERE asignacion_materia_id_asignacion = ? AND activo = 1`,
            [id_asignacion]
        );

        if ((suma[0].total + porcentaje)> 100) {
            return res.status(400).json({
                msg: `No se puede agregar. El total superaría el 100% (Actual: ${suma[0].total}%)`
            });
        }

        await db.query(
            `INSERT INTO criterio_evaluacion (nombre_criterio, porcentaje, asignacion_materia_id_asignacion, activo)
            VALUES (?, ?, ?, 1)`,
            [nombre_criterio, porcentaje, id_asignacion]
        );

        res.json({
            msg:"Criterio de evaluación creado exitosamente"
        });

    } catch (error) {
        res.status(500).json({
            msg: "Error al crear el criterio",
            error: error.message
        });
    }
};



exports.obtenerDetalleCriteriosEstudiante = async (req, res) => {
    const { id_asignacion, id_estudiante } = req.params;

    try {
        const [detalles] = await db.query(
            `SELECT 
            ce.nombre_criterio AS criterio,
            ce.porcentaje,
            IFNULL(c.nota, 0) AS nota_obtenida,
            ROUND(IFNULL(c.nota * (ce.porcentaje / 100), 0), 2) AS nota_ponderada,
            c.observaciones
            FROM criterio_evaluacion ce
            /* Unimos con calificación filtrando por el estudiante específico */
            LEFT JOIN calificacion c ON c.criterio_evaluacion_id_criterio = ce.id_criterio 
            AND c.estudiante_id_estudiante = ?
            /* Ahora filtramos los criterios directamente por la materia (asignación) */
            WHERE ce.asignacion_materia_id_asignacion = ? AND ce.activo = 1
            ORDER BY ce.id_criterio ASC`,
            [id_estudiante, id_asignacion]
        );
        if (detalles.length === 0) {
            return res.status(200).json({
                msg: "El docente aún no ha configurado criterios de evaluación para esta materia."
            });
        }

        res.json(detalles);
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener el detalle", error: error.message
        });
    }
};

