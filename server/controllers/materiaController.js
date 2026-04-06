const db = require('../config/db');

exports.crearMateria = async (req, res) => {
    const { codigo_materia, nombre_materia, descripcion, intensidad_horaria_semanal} = req.body;

    try {
        const [resultado] = await db.query(
            `INSERT INTO materia (codigo_materia, nombre_materia, descripcion, intensidad_horaria_semanal, activo)
            VALUES (?, ?, ?, ?, 1)`,
            [codigo_materia, nombre_materia, descripcion, intensidad_horaria_semanal]
        );

        res.status(201).json(
            {
                msg: "Materua registrada exitosamente",
                id_materia: resultado.insertId
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg:"Error al registrar la materia",
            error: error.message
        });
    }
};

exports.obtenerMaterias = async (req, res) => {
    try {
        const [materias] = await db.query("SELECT * FROM materia WHERE activo = 1");
        res.json(materias);
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener las materias"
        });
    }
};