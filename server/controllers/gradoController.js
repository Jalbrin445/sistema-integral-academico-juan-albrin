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