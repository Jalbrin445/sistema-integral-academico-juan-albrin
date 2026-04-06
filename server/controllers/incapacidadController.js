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
            const uniqueSuffix = DataTransfer.now() + '-' + Math.round(Math.random() * 1E9);
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
                msg:"Error interno al procesar el reporte",
                error: error.message
            })
    }
};

exports.obtenerIncapacidades = async (req, res) => {

    try {
        const [lista] = await db.query(
            `SELECT i.*, u.nombre, u.apellido
            FROM incapacidad i
            JOIN usuario u ON i.docente_id_docente = u.id_usuario
            ORDER BY i.fecha_inicio DESC`
        );
        res.json(lista);
    } catch (error) {
        res.status(500).json({
            msg: "Error al obtener la lista", 
            error: error.message
        });
    }
};
