const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

const whitelist = ['http://localhost:5173', 'http://localhost:3000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (whitelist.indexOf(origin) !== -1) {
            callback(null,true);
        } else {
            callback(new Error('No permitido por CORS (Seguridad del Sistema)'))
        }
    },
    credentials: true
}

// Middlewares
app.use(cors(corsOptions));
app.use(express.json()); // Para que el servidor entienda JSON
app.use(cookieParser())

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
app.use('/uploads', express.static('uploads'));
app.use('/api/periodos', require('./routes/periodoRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});