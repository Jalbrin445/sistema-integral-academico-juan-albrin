const db = require('../config/db');

exports.crearMateria = async (req, res) => {
    const { codigo_materia, nombre_materia, descripcion, intensidad_horaria_semanal} = req.body;

    if (!codigo_materia) {
        return res.status(400).json({
            msg: "El código de materia es obligatorio"
        });
    }
    if (!nombre_materia) {
        return res.status(400).json({
            msg: "El nombre de la materia es obligatorio"
        });
    }
    if (!intensidad_horaria_semanal) {
        return res.status(400).json({
            msg: "La intensidad horario semanal es obligatoria"
        })
    }

    if (isNaN(intensidad_horaria_semanal) || intensidad_horaria_semanal < 1 || intensidad_horaria_semanal > 20){
        return res.status(400).json({
            msg: "La intensidad horaria debe ser un número entre 1 y 20"
        });
    }

    const [codigoExiste] = await db.query(
        'SELECT id_materia FROM materia WHERE codigo_materia = ?',
        [codigo_materia]
    );

    if (codigoExiste.length > 0) {
        return res.status(400).json({
            msg: "Ya existe una materia con este códgio"
        });
    }

    const [nombreExiste] = await db.query(
        'SELECT id_materia FROM materia WHERE nombre_materia = ? AND activo = 1',
        [nombre_materia]
    );
    if (nombreExiste.length > 0) {
        return res.status(400).json({
            msg: "Ya existe una materia con este nombre"
        });
    }

    try {
        const [resultado] = await db.query(
            `INSERT INTO materia (codigo_materia, nombre_materia, descripcion, intensidad_horaria_semanal, activo)
            VALUES (?, ?, ?, ?, 1)`,
            [codigo_materia, nombre_materia, descripcion, intensidad_horaria_semanal]
        );

        res.status(201).json(
            {
                msg: "Materia registrada exitosamente",
                id_materia: resultado.insertId
            }
        );
    } catch (error) {
        console.error("Error al crear una materia",error);
        res.status(500).json({
            msg:"Ocurrió un error interno en el servidor"
        });
    }
};

exports.obtenerMaterias = async (req, res) => {
    try {
        const [materias] = await db.query("SELECT * FROM materia WHERE activo = 1");
        res.json(materias);
    } catch (error) {
        console.error("Error al obtener una materia: ", error)
        res.status(500).json({
            msg: "Ocurrió un error interno en el servidor"
        });
    }
};