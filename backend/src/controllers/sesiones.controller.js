// src/controllers/sesiones.controller.js
const svc = require('../services/sesiones.service');

exports.getAll = async(req, res) => {
    try {
        const { tutoriaId } = req.query;
        const data = await svc.getAll({ tutoriaId });
        res.json(data);
    } catch (err) {
        console.error('[Sesiones] getAll error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.create = async(req, res) => {
    try {
        const { tutoriaId, fecha, inicio, fin, aula } = req.body;

        if (!tutoriaId || !fecha || !inicio || !fin) {
            return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        }

        const row = await svc.create({
            tutoriaId,
            fecha,
            inicio,
            fin,
            aula
        });

        res.status(201).json(row);
    } catch (err) {
        console.error('[Sesiones] create error:', err);
        res.status(500).json({ error: err.message || 'Error al crear sesión' });
    }
};

exports.remove = async(req, res) => {
    try {
        const { id } = req.params;
        await svc.remove(id);
        res.status(200).json({ message: 'Sesión eliminada correctamente' });
    } catch (err) {
        console.error('[Sesiones] remove error:', err);
        res.status(500).json({ error: err.message || 'Error al eliminar sesión' });
    }
};