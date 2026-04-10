const db = require('../config/db');


exports.obtenerGrados = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM grado ORDER BY orden ASC'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los grados", error: error.message });
    }
};


exports.crearGrado = async (req, res) => {
    const { nombre_grado, orden, nivel_id_nivel } = req.body;

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
        console.error(error);
        res.status(500).json({ msg: "Error al crear el grado", error: error.message });
    }
};