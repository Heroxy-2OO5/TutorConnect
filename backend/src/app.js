// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const materiasRoutes = require('./routes/materias.routes');
const tutoriasRoutes = require('./routes/tutorias.routes');
const inscripcionesRoutes = require('./routes/inscripciones.routes');
const authRoutes = require('./routes/auth.routes');
const sesionesRoutes = require('./routes/sesiones.routes');
const asistenciasRoutes = require('./routes/asistencias.routes');
const observacionesRoutes = require('./routes/observaciones.routes');
const dashboardRoutes = require('./routes/dashboard.routes');




const app = express();

app.use(cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false // usamos JWT por header, no cookies
}));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/materias', materiasRoutes);
app.use('/api/tutorias', tutoriasRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sesiones', sesionesRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/observaciones', observacionesRoutes);
app.use('/api/dashboard', dashboardRoutes);


module.exports = app;