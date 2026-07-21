const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            const dir = './uploads/incapacidades';

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true});
            }
            cb(null,dir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'incap-' + uniqueSuffix + path.extname(file.originalname));

        }
    }
);

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);

    }
    cb(new Error("Solo se permiten archivos de imagen (JPG, PNG) o PDF"))
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5},
    fileFilter: fileFilter
});


exports.uploadMiddleware = upload.single('archivo');

exports.subirIncapacidad = async (req, res) => {

    if (!req.file) {
        return res.status(400).json(
            {
                msg: "Debe subir un justificante médico válido (PDF o Imagen)"
            }
        );
    }

    const { fecha_inicio, fecha_fin, motivo, docente_id_docente } = req.body;
    const archivo_url = req.file.filename;

    if (!fecha_inicio) {
        const filePath = path.join(__dirname, '../uploads/incapacidades', archivo_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({
            msg: "La fecha de inicio es obligatoria"
        });
    }

    if (!fecha_fin) {
        const filePath = path.join(__dirname, '../uploads/incapacidades', archivo_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({
            msg: "La fecha de fin es obligatoria"
        });
    }

    if (!motivo) {
        const filePath = path.join(__dirname, '../uploads/incapacidades', archivo_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({ 
            msg: "El motivo es obligatorio"
        });
    }
    if (!docente_id_docente) {
        const filePath = path.join(__dirname, '../uploads/incapacidades', archivo_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({
            msg: "El ID del docente es obligatorio"
        });
    }

    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        const filePath = path.join(__dirname, '../uploads/incapacidades', archivo_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({
            msg: "Fechas inválidas"
        });
    }

    if (fechaFin < fechaInicio) {
        const filePath = path.join(__dirname, '../uploads/incapacidades', archivo_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({
            msg: "La fecha de fin debe ser posterior a la fecha de inicio"
        });
    }

    const [docenteExiste] = await db.query(
        'SELECT id_docente FROM docente WHERE id_docente = ? AND estado = "activo"',
        [docente_id_docente]
    );

    if (docenteExiste.length === 0) {
        const filePath = path.join(__dirname, '../uploads/incapacidades', archivo_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(404).json({
            msg: "Docente no encontrado o inactivo"
        });
    } 

    try {
            const [resultado] = await db.query(
                `INSERT INTO incapacidad (
                fecha_inicio,
                fecha_fin, motivo, archivo_url, docente_id_docente, estado
                ) VALUES (?, ?, ?, ?, ?, 'pendiente')`,
                [fecha_inicio, fecha_fin, motivo, archivo_url, docente_id_docente]
            );

            res.status(201).json({
                msg:"Incapacidad reportada exitosamente. Queda sujeta a revisión administrativa.",
                id_incapacidad: resultado.insertId,
                archivo: archivo_url
            });

    } catch (error) {
            
            const filePath = path.join(__dirname, '../uploads/incapacidades', archivo_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            console.error("Error al registrar incapacidad:", error);
            res.status(500).json({
                msg:"Error interno en el servidor"
            })
    }
};

exports.obtenerIncapacidades = async (req, res) => {

    try {
        const [lista] = await db.query(
            `SELECT i.*, p.nombres, p.apellido_paterno, p.apellido_materno, d.especialidad
            FROM incapacidad i
            JOIN docente d ON i.docente_id_docente = d.id_docente
            JOIN persona p ON d.persona_id_persona = p.id_persona
            ORDER BY i.fecha_inicio DESC`
        );
        res.json(lista);
    } catch (error) {
        console.error("Error al obtener incapacidad:", error)
        res.status(500).json({
            msg: "Ocurrió un error interno en el servidor"
        });
    }
};

exports.revisarIncapacidad = async (req, res) => {
    const { id_incapacidad } = req.params;
    const { nuevo_estado } = req.body; // 'aprobada' o 'rechazada'

    if (!id_incapacidad || isNaN(id_incapacidad)) {
        return res.status(400).json({ 
            msg: "ID de incapacidad inválido"
        });
    }
    if (!nuevo_estado || !['aprobada', 'rechazada'].includes(nuevo_estado)) {
        return res.status(400).json({
            msg: "Estado inválido. Debe ser 'aprobada' o 'rechazada'"
        });
    }

    try {
        const [incapcaidadExiste] = await db.query(
            'SELECT id_incapacidad FROM incapacidad WHERE id_incapacidad = ?',
            [id_incapacidad]
        );

        if (incapcaidadExiste.length === 0) {
            return res.status(404).json({
                msg: "Incapacidad no encontrada"
            });
        }
        
        await db.query(
            "UPDATE incapacidad SET estado = ? WHERE id_incapacidad = ?",
            [nuevo_estado, id_incapacidad]
        );
        res.json({ msg: `Incapacidad ${nuevo_estado} correctamente` });
    } catch (error) {
        console.error("Ocurrio un error en la revisión de la incapacidad:", error);
        res.status(500).json({ msg: "Ocurrió un error interno en el servidor"});
    }
};
