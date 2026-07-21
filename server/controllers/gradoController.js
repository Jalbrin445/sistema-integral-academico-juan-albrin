const db = require('../config/db');


exports.obtenerGrados = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM grado ORDER BY orden ASC'
        );
        res.json(rows);
    } catch (error) {
        console.error("Ocurrió un error al intentar obtener los grados registrados: ",error);
        res.status(500).json({ msg: "Error al obtener los grados" });
    }
};


exports.crearGrado = async (req, res) => {
    const { nombre_grado, orden, nivel_id_nivel } = req.body;

    if (!nombre_grado) {
        return res.status(400).json({
            msg: "El nombre del grado es obligatorio"
        });
    }

    if (orden === undefined || orden === null) {
        return res.status(400).json({
            msg: "El orden del grado es obligatorio"
        });
    }
    if (isNaN(orden) || orden < 0) {
        return res.status(400).json({
            msg: "El orden debe ser un número válido"
        });
    }

    const [gradoExiste] = await db.query(
        'SELECT id_grado FROM grado WHERE nombre_grado = ?',
        [nombre_grado]
    );
    if (gradoExiste.length > 0) {
        return res.status(400).json({
            msg: "Ya existe un grado con este nombre"
        })
    }
    try {
        const [resultado] = await db.query(
            'INSERT INTO grado (nombre_grado, orden, nivel_id_nivel) VALUES (?, ?, ?)',
            [nombre_grado, orden, nivel_id_nivel || null]
        );

        res.status(201).json({ 
            msg: "Grado creado con éxito", 
            id_grado: resultado.insertId 
        });
    } catch (error) {
        console.error("Error al crear un grado nuevo: ",error);
        res.status(500).json({ msg: "Ocurrio un error interno en el servidor" });
    }
};