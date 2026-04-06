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