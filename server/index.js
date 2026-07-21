const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');
require('dotenv').config();

const { apiLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./utils/logger');
const { fileAccess } = require('./middleware/fileAccess');

const app = express();

app.set('trust proxy', 1);

// ============================================
// CONFIGURACIÓN CORS
// ============================================

const whitelist = [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://sia-apijamg.netlify.app',
    'https://sia-api-7m74.onrender.com',
    'https://sia-api.onrender.com'
];

if (process.env.FRONTEND_URL) {
    whitelist.push(process.env.FRONTEND_URL);
}

console.log('📝 Whitelist CORS:', whitelist);
console.log('📝 NODE_ENV:', process.env.NODE_ENV || 'not set');

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('❌ CORS bloqueado:', origin);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'Accept',
        'Origin',
        'X-Requested-With'
    ],
    exposedHeaders: ['XSRF-TOKEN'],
    optionsSuccessStatus: 200
};

// CORS primero - ESTO YA MANEJA OPTIONS AUTOMÁTICAMENTE
app.use(cors(corsOptions));

// ❌ ELIMINADO: app.options('*', cors(corsOptions)); 
// Express 5 no acepta '*' como patrón de ruta
// El middleware cors() ya maneja las peticiones OPTIONS

// ============================================
// HELMET
// ============================================

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "https://sia-apijamg.netlify.app", "http://localhost:5173"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ============================================
// BODY PARSERS
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// LOGGER
// ============================================

app.use(requestLogger);

// ============================================
// REDIRECT HTTP A HTTPS
// ============================================

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
});

// ============================================
// RATE LIMITING
// ============================================

app.use('/api', apiLimiter);

// ============================================
// ARCHIVOS ESTÁTICOS
// ============================================

app.use('/uploads', (req, res, next) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
    const ext = path.extname(req.path).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
        return res.status(403).json({ msg: 'Tipo de archivo no permitido' });
    }
    next();
}, fileAccess, express.static(path.join(__dirname, 'uploads')));

// ============================================
// RUTAS API
// ============================================

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

// ============================================
// 404
// ============================================

app.use((req, res) => {
    res.status(404).json({ msg: 'Ruta no encontrada' });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ msg: err.message });
    }

    res.status(500).json({
        msg: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});