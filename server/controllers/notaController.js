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
    if (nota === undefined || nota === null) {
        return res.status(400).json({ msg: "La nota es obligatoria" });
    }

    if (nota < 0 || nota > 5) {
        return res.status(400).json({ msg: "La nota debe estar entre 0.0 y 5.0" });
    }

    if (!criterio_id) {
        return res.status(400).json({ msg: "El criterio de evaluación es obligatorio" });
    }
    if (!estudiante_id) {
        return res.status(400).json({ msg: "El ID del estudiante es obligatorio" });
    }
    if (!asignacion_id) {
        return res.status(400).json({ msg: "El ID de la asignación es obligatorio" });
    }
    if (!docente_id) {
        return res.status(400).json({ msg: "El ID del docente es obligatorio" });
    }
    if (!periodo_id) {
        return res.status(400).json({ msg: "El ID del período es obligatorio" });
    }

    const [criterioExiste] = await db.query(
        'SELECT id_criterio FROM criterio_evaluacion WHERE id_criterio = ? AND activo = 1',
        [criterio_id]
    );
    if (criterioExiste.length === 0) {
        return res.status(404).json({ msg: "El criterio de evaluación no existe o no está activo" });
    }

    const [estudianteExiste] = await db.query(
        'SELECT id_estudiante FROM estudiante WHERE id_estudiante = ? AND estado = "activo"',
        [estudiante_id]
    );
    if (estudianteExiste.length === 0) {
        return res.status(404).json({ msg: "El estudiante no existe o está inactivo" });
    }

    const [asignacionExiste] = await db.query(
        'SELECT id_asignacion FROM asignacion_materia WHERE id_asignacion = ? AND activo = 1',
        [asignacion_id]
    );
    if (asignacionExiste.length === 0) {
        return res.status(404).json({ msg: "La asignación no existe o está inactiva" });
    }

    const [docenteExiste] = await db.query(
        'SELECT id_docente FROM docente WHERE id_docente = ? AND estado = "activo"',
        [docente_id]
    );
    if (docenteExiste.length === 0) {
        return res.status(404).json({ msg: "El docente no existe o está inactivo" });
    }

    const [periodoExiste] = await db.query(
        'SELECT id_periodo FROM periodo_academico WHERE id_periodo = ? AND activo = 1',
        [periodo_id]
    );
    if (periodoExiste.length === 0) {
        return res.status(404).json({ msg: "El período académico no existe o está inactivo" });
    }

    const [notaDuplicada] = await db.query(
        `SELECT id_calificacion FROM calificacion
        WHERE criterio_evaluacion_id_criterio = ?
        AND estudiante_id_estudiante = ?
        AND asignacion_materia_id_asignacion = ?
        AND periodo_academico_id_periodo = ?`,
        [criterio_id, estudiante_id, asignacion_id, periodo_id]
    );

    if (notaDuplicada.length > 0) {
        return res.status(400).json({
            msg: "Ya existe una nota para este estudiante, criterio y periodo"
        });
    }

    try {
        const [resultado] = await db.query(
            `INSERT INTO calificacion (
            nota, observaciones, fecha_registro, 
            criterio_evaluacion_id_criterio, 
            estudiante_id_estudiante, 
            asignacion_materia_id_asignacion, 
            docente_id_docente, periodo_academico_id_periodo)
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)`,
            [nota, observaciones || null, criterio_id, estudiante_id, asignacion_id, docente_id, periodo_id]
        );

        res.status(201).json({
            msg: "Calificación registrada con éxito",
            id_calificacion: resultado.insertId
        });
    } catch (error) {
        console.error("Error al registrar nota:", error);
        res.status(500).json({ msg: "Ocurrió un error interno en el servidor" });
    }
};

exports.actualizarNota = async (req, res) => {
    const { id_calificacion } = req.params;
    const { nota, observaciones } = req.body;

    if (!id_calificacion || isNaN(id_calificacion)) {
        return res.status(400).json({ msg: "ID de calificación inválido" });
    }
    if (nota === undefined || nota === null) {
        return res.status(400).json({ msg: "La nota es obligatoria" });
    }
    if (nota < 0 || nota > 5) {
        return res.status(400).json({ msg: "La nota debe estar entre 0.0 y 5.0" });
    }

    try {
        const [calificacionExiste] = await db.query(
            'SELECT id_calificacion FROM calificacion WHERE id_calificacion = ?',
            [id_calificacion]
        );
        if (calificacionExiste.length === 0) {
            return res.status(404).json({ msg: "No se encontró la calificación para actualizar" });
        }

        await db.query(
            `UPDATE calificacion SET nota = ?, observaciones = ?, fecha_registro = CURDATE() WHERE id_calificacion = ?`,
            [nota, observaciones || null, id_calificacion]
        );

        res.json({ msg: "Calificación actualizada correctamente" });
    } catch (error) {
        console.error("Error al actualizar nota:", error);
        res.status(500).json({ msg: "Ocurrió un error interno en el servidor" });
    }
};

exports.obtenerNotasEstudiante = async (req, res) => {
    const { estudiante_id, asignacion_id } = req.params;
    try {
        const [notas] = await db.query(
            `SELECT 
                c.id_calificacion, c.nota, c.observaciones, c.fecha_registro,
                ce.nombre_criterio, ce.porcentaje,
                pa.nombre_periodo
            FROM calificacion c
            JOIN criterio_evaluacion ce ON c.criterio_evaluacion_id_criterio = ce.id_criterio
            JOIN periodo_academico pa ON c.periodo_academico_id_periodo = pa.id_periodo
            WHERE c.estudiante_id_estudiante = ? AND c.asignacion_materia_id_asignacion = ?
            ORDER BY pa.numero_periodo ASC, c.fecha_registro DESC`,
            [estudiante_id, asignacion_id]
        );

        if (notas.length === 0) {
            return res.status(404).json({ msg: "Aún no hay notas registradas para esta materia." });
        }
        res.json(notas);
    } catch (error) {
        console.error("Error en obtenerNotasEstudiante:", error);
        res.status(500).json({ msg: "Ocurrió un error interno en el servidor" });
    }
};

exports.obtenerResumenMateriasEstudiante = async (req, res) => {
    const { id_estudiante } = req.params;
    const { periodo } = req.query;


    try {
        let sql = `
            SELECT 
                m.nombre_materia,
                m.descripcion,
                COALESCE(CONCAT(p.nombres, ' ', p.apellido_paterno, ' ', p.apellido_materno), 'Docente sin asignar') AS nombre_docente,
                a.id_asignacion,
                ROUND(IFNULL(SUM(c.nota * (ce.porcentaje / 100)), 0), 2) AS nota_parcial,
                COUNT(c.id_calificacion) AS total_notas,
                COUNT(ce.id_criterio) AS total_criterios
            FROM asignacion_materia a
            INNER JOIN materia m ON a.materia_id_materia = m.id_materia
            INNER JOIN grupo g ON a.grupo_id_grupo = g.id_grupo
            INNER JOIN estudiante e ON e.grupo_id_grupo = g.id_grupo
            LEFT JOIN docente d ON a.docente_id_docente = d.id_docente
            LEFT JOIN persona p ON d.persona_id_persona = p.id_persona
            LEFT JOIN criterio_evaluacion ce ON ce.asignacion_materia_id_asignacion = a.id_asignacion AND ce.activo = 1
            LEFT JOIN calificacion c ON c.criterio_evaluacion_id_criterio = ce.id_criterio 
                AND c.estudiante_id_estudiante = e.id_estudiante
            WHERE e.id_estudiante = ?
            AND a.activo = 1
        `;

        const params = [id_estudiante];

        if (periodo) {
            sql += ` AND (c.periodo_academico_id_periodo = ? OR c.periodo_academico_id_periodo IS NULL)`;
            params.push(periodo);
        }

        sql += ` GROUP BY a.id_asignacion, m.nombre_materia, m.descripcion, p.nombres, p.apellido_paterno, p.apellido_materno
                 ORDER BY m.nombre_materia ASC`;

        const [materias] = await db.query(sql, params);

        res.json(materias);
    } catch (error) {
        console.error("Error al obtener resumen de materias del estudiante:", error);
        res.status(500).json({ 
            msg: "Error al obtener el resumen de materias",
            error: error.message 
        });
    }
};

exports.crearCriterioEvaluacion = async (req, res) => {
    const { id_asignacion, nombre_criterio, porcentaje } = req.body;

    if (!id_asignacion || !nombre_criterio || !porcentaje) {
        return res.status(400).json({ msg: "Todos los campos son requeridos" });
    }

    try {
        const [suma] = await db.query(
            `SELECT IFNULL(SUM(porcentaje), 0) as total
            FROM criterio_evaluacion
            WHERE asignacion_materia_id_asignacion = ? AND activo = 1`,
            [id_asignacion]
        );

        const totalActual = parseFloat(suma[0].total) || 0;
        const nuevoTotal = totalActual + parseFloat(porcentaje);

        if (nuevoTotal > 100) {
            return res.status(400).json({
                msg: `No se puede agregar. El total superaría el 100% (Actual: ${totalActual}%, Nuevo: ${nuevoTotal}%)`
            });
        }

        await db.query(
            `INSERT INTO criterio_evaluacion (nombre_criterio, porcentaje, asignacion_materia_id_asignacion, activo)
            VALUES (?, ?, ?, 1)`,
            [nombre_criterio, porcentaje, id_asignacion]
        );

        res.json({ msg: "Criterio de evaluación creado exitosamente" });
    } catch (error) {
        console.error("Error al crear criterio evaluación:", error);
        res.status(500).json({ msg: "Ocurrió un error interno en el servidor" });
    }
};

exports.obtenerDetalleCriteriosEstudiante = async (req, res) => {
    const { id_asignacion, id_estudiante } = req.params;

    try {
        const [detalles] = await db.query(
            `SELECT 
                ce.id_criterio,
                ce.nombre_criterio AS criterio,
                ce.porcentaje,
                IFNULL(c.nota, 0) AS nota_obtenida,
                ROUND(IFNULL(c.nota * (ce.porcentaje / 100), 0), 2) AS nota_ponderada,
                c.observaciones,
                c.id_calificacion,
                pa.nombre_periodo,
                pa.id_periodo
            FROM criterio_evaluacion ce
            LEFT JOIN calificacion c ON c.criterio_evaluacion_id_criterio = ce.id_criterio 
                AND c.estudiante_id_estudiante = ?
            LEFT JOIN periodo_academico pa ON c.periodo_academico_id_periodo = pa.id_periodo
            WHERE ce.asignacion_materia_id_asignacion = ? 
                AND ce.activo = 1
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
        console.error("Error al obtener detalle de criterios:", error);
        res.status(500).json({ msg: "Error al obtener el detalle" });
    }
};

exports.listarCriteriosPorAsignacion = async (req, res) => {
    const { id_asignacion } = req.params;

    try {
        const [criterios] = await db.query(
            `SELECT id_criterio, nombre_criterio, porcentaje
            FROM criterio_evaluacion
            WHERE asignacion_materia_id_asignacion = ? AND activo = 1`,
            [id_asignacion]
        );

        if (criterios.length === 0) {
            return res.status(404).json({ msg: "No hay criterios configurados." });
        }
        res.json(criterios);
    } catch (error) {
        console.error("Error al listar criterios:", error);
        res.status(500).json({ msg: "Ocurrió un error interno en el servidor" });
    }
};

exports.obtenerNotasPorCriterioYGrupo = async (req, res) => {
    const { id_criterio, id_asignacion } = req.params;

    try {
        const [notas] = await db.query(
            `SELECT id_calificacion, estudiante_id_estudiante, nota, observaciones 
            FROM calificacion 
            WHERE criterio_evaluacion_id_criterio = ? AND asignacion_materia_id_asignacion = ?`,
            [id_criterio, id_asignacion]
        );
        res.json(notas);
    } catch (error) {
        console.error("Error al obtener notas por criterio:", error);
        res.status(500).json({ msg: "Ocurrió un error interno en el servidor" });
    }
};