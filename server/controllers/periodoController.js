const db = require('../config/db');

// AGREGAMOS 'async' AQUÍ
const getPeriodosActivos = async (req, res) => {
    // Consultamos los periodos activos ordenados por número
    try {
        // Ahora el 'await' funcionará correctamente
        const [rows] = await db.query('SELECT id_periodo, nombre_periodo, anio_escolar, numero_periodo FROM periodo_academico WHERE activo = 1');

        res.json(rows);
    } catch (error) {
        console.error("Error exacto en SQL: ", error);
        res.status(500).json({
            msg: "Error al obtener periodos"
        });
    }
};

module.exports = {
    getPeriodosActivos
};