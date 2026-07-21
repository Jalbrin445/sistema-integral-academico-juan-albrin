const db = require('../config/db');


const obtenerPeriodosActivos = async (req, res) => {
    // Consultamos los periodos activos ordenados por número
    try {
        // Ahora el 'await' funcionará correctamente
        const [rows] = await db.query(
            'SELECT id_periodo, nombre_periodo, anio_escolar, numero_periodo, activo FROM periodo_academico WHERE activo = 1 ORDER BY numero_periodo ASC');

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener los periodos: ", error);
        res.status(500).json({
            msg: "Error al obtener periodos"
        });
    }
};

module.exports = {
    obtenerPeriodosActivos
};