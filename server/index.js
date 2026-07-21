const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
const fileType = require('file-type');
require('dotenv').config();

const { apiLimiter } = require('./middleware/rateLimiter');
const { csrfProtection, csrfTokenMiddleware, csrfHeaderCheck } = require('./middleware/csrf');
const { requestLogger } = require('./utils/logger');
const { checkSessionTimeout } = require('./middleware/sessionControl')
const {fileAccess} = require('./middleware/fileAccess');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: {
        directives:{
            defaultSrc:["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", process.env.VITE_API_URL || "http://localhost:5000", "http://localhost:5173"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin"}
}));



const whitelist = [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://sia-apijamg.netlify.app',
    process.env.FRONTEND_URL].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (whitelist.indexOf(origin) !== -1) {
            callback(null,true);
        } else {
            callback(new Error('No permitido por CORS (Seguridad del Sistema)'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN'
    ],
    exposedHeaders:['XSRF-TOKEN']
};

// Middlewares
app.use(cors(corsOptions));

app.use(express.json({ limit:'10mb' })); // Para que el servidor entienda JSON
app.use(express.urlencoded({ extended: true, limit: '10mb'}));

app.use(cookieParser());

app.use(requestLogger);

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
})

app.use('/api', csrfProtection);
app.use('/api', csrfTokenMiddleware);
app.use('/api', csrfHeaderCheck);

// El rate limiting general para todas las rutas de la API REST
app.use('/api', apiLimiter);

// Esto es para los archivos estáticos con seguridad mejorada (no se usará en esta versión, pero para tenerlo en cuenta)
app.use('/uploads', async (req, res, next) => {
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
    const ext = path.extname(req.path).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        res.status(403).json({
            msg:'Este tipo de archivo no es permitido'
        });
    }

    const filePath = path.join(__dirname, 'uploads', req.path);

    if (fs.existsSync(filePath)){
        try {
            const buffer = fs.readFileSync(filePath);
            const type = await fileType.fromBuffer(buffer);
            if (!type) {
                return res.status(403).json({
                    msg: 'Archivo corrupto o inválido'
                });
            }
        } catch (error) {
            return res.status(500).json({
                msg: 'Error al verificar el archivo'
            });
        }
    }
    next();
}, fileAccess, express.static(path.join(__dirname, 'uploads')));

// Las rutas de los endpoints

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/estudiantes', require('./routes/estudianteRoutes'));
app.use('/api/grupos', require('./routes/grupoRoutes'));
app.use('/api/grados', require('./routes/gradoRoutes'));
app.use('/api/docentes', require('./routes/docenteRoutes'));
app.use('/api/materias', require('./routes/materiaRoutes'));
app.use('/api/asignaciones', require('./routes/asignacionRoutes'));
app.use('/api/notas', require('./routes/notaRoutes'));
app.use('/api/incapacidades', require('./routes/incapacidadRoutes'));
app.use('/api/periodos', require('./routes/periodoRoutes'));

// Manejo de errores en las rutas

app.use((req, res) =>{
    res.status(404).json({
        msg: 'Ruta no encontrada'
    });
});

app.use((err, req, res, next) => {
    console.error('Error global: ', err);

    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            msg: 'Token CSRF inválido o expirado'
        });
    }

    res.status(500).json({
        msg:'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }); 
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});