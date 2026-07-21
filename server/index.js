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

// ============================================
// CONFIGURACIÓN CORS CORREGIDA PARA PRODUCCIÓN
// ============================================

const whitelist = [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://sia-apijamg.netlify.app',
    'https://sia-api-7m74.onrender.com',
    'https://sia-api.onrender.com',
    process.env.FRONTEND_URL
].filter(Boolean);

console.log('📝 Whitelist CORS configurada:', whitelist);
console.log('📝 NODE_ENV:', process.env.NODE_ENV);
console.log('📝 FRONTEND_URL:', process.env.FRONTEND_URL);

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir solicitudes sin origin (Postman, curl, etc.)
        if (!origin) {
            console.log('✅ CORS: Solicitud sin origin permitida (Postman/curl)');
            return callback(null, true);
        }
        
        console.log('🔍 CORS - Origin recibido:', origin);
        
        if (whitelist.indexOf(origin) !== -1) {
            console.log('✅ CORS: Origin permitido:', origin);
            callback(null, true);
        } else {
            console.error('❌ CORS BLOQUEADO para origin:', origin);
            console.error('❌ Whitelist actual:', whitelist);
            callback(new Error('No permitido por CORS (Seguridad del Sistema)'));
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
    preflightContinue: false,
    optionsSuccessStatus: 200 // Algunos navegadores (Chrome) tienen problemas con 204
};

// ============================================
// MIDDLEWARES EN ORDEN CORRECTO
// ============================================

// 1. CORS PRIMERO (antes que cualquier otra cosa)
app.use(cors(corsOptions));

// 2. Manejo explícito de OPTIONS para TODAS las rutas
app.options('*', cors(corsOptions));

// 3. Helmet con configuración ajustada para CORS
app.use(helmet({
    contentSecurityPolicy: {
        directives:{
            defaultSrc:["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", process.env.VITE_API_URL || "http://localhost:5000", "http://localhost:5173", "https://sia-apijamg.netlify.app"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin"}
}));

// 4. Body parsers
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Cookie parser
app.use(cookieParser());

// 6. Logger
app.use(requestLogger);

// 7. Redirect HTTP a HTTPS en producción
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// 8. CSRF desactivado temporalmente para pruebas
// NOTA: Cuando quieras activar CSRF, descomenta estas líneas
// app.use('/api', csrfProtection);
// app.use('/api', csrfTokenMiddleware);
// app.use('/api', csrfHeaderCheck);

// 9. Rate limiting
app.use('/api', apiLimiter);

// 10. Archivos estáticos con seguridad
app.use('/uploads', async (req, res, next) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
    const ext = path.extname(req.path).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return res.status(403).json({ msg:'Este tipo de archivo no es permitido' });
    }

    const filePath = path.join(__dirname, 'uploads', req.path);
    if (fs.existsSync(filePath)){
        try {
            const buffer = fs.readFileSync(filePath);
            const type = await fileType.fromBuffer(buffer);
            if (!type) {
                return res.status(403).json({ msg: 'Archivo corrupto o inválido' });
            }
        } catch (error) {
            return res.status(500).json({ msg: 'Error al verificar el archivo' });
        }
    }
    next();
}, fileAccess, express.static(path.join(__dirname, 'uploads')));

// ============================================
// RUTAS DE LA API
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
// MANEJO DE ERRORES
// ============================================

// 404 - Ruta no encontrada
app.use((req, res) =>{
    res.status(404).json({ msg: 'Ruta no encontrada' });
});

// Error global
app.use((err, req, res, next) => {
    console.error('❌ Error global: ', err);

    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ msg: 'Token CSRF inválido o expirado' });
    }

    res.status(500).json({
        msg:'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }); 
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});