const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Para que el servidor entienda JSON

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/estudiantes', require('./routes/estudianteRoutes'));
app.use('/api/grupos', require('./routes/grupoRoutes'));
app.use('/api/docentes', require('./routes/docenteRoutes'));
app.use('/api/materias', require('./routes/materiaRoutes'));
app.use('/api/asignaciones', require('./routes/asignacionRoutes'));
app.use('/api/notas', require('./routes/notaRoutes'));
app.use('/api/incapacidades', require('./routes/incapacidadRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});