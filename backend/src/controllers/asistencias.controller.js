// src/controllers/asistencias.controller.js
const svc = require('../services/asistencias.service');

exports.getAll = async(req, res) => {
    try {
        const { sesionId, estudianteId } = req.query;
        const data = await svc.list({ sesionId, estudianteId });
        res.json(data);
    } catch (err) {
        console.error('[Asistencias] getAll error:', err);
        res.status(500).json({ error: err.message || 'Error al obtener asistencias' });
    }
};

exports.marcar = async(req, res) => {
    try {
        const { sesionId, estudianteId, estado, observacion } = req.body;

        // usa el ID numérico (coincide con registrado_por INTEGER)
        const registradoPor = req.user ? req.user.id : null;

        if (!sesionId || !estudianteId || !estado || !registradoPor) {
            return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        }

        const row = await svc.marcar({
            sesionId,
            estudianteId, // email del estudiante (TEXT/CITEXT)
            estado,
            observacion: observacion ? observacion : null,
            registradoPor, // id numérico del tutor/admin
        });

        res.json(row);
    } catch (err) {
        console.error('[Asistencias] marcar error:', err);
        res.status(500).json({ error: err.message || 'Error al marcar asistencia' });
    }
};