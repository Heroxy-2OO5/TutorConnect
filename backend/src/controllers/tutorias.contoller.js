// src/controllers/tutorias.contoller.js
const servicioTutorias = require('../services/tutorias.service');

exports.getAll = async(req, res) => {
    try {
        const data = await servicioTutorias.getAllTutorias();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async(req, res) => {
    try {
        await servicioTutorias.createTutoria(req.body);
        res.status(201).json({ message: 'Tutoría creada correctamente' });
    } catch (err) {
        console.error('[Tutorias] create error:', err);
        const status = err.status || 500;
        res.status(status).json({ error: err.message || 'Error al crear la tutoría' });
    }
};

exports.update = async(req, res) => {
    try {
        const { id } = req.params;
        await servicioTutorias.updateTutoria(id, req.body);
        res.status(200).json({ message: 'Tutoría actualizada correctamente' });
    } catch (err) {
        console.error('[Tutorias] update error:', err);
        const status = err.status || 500;
        res.status(status).json({ error: err.message || 'Error al actualizar la tutoría' });
    }
};

exports.remove = async(req, res) => {
    try {
        const { id } = req.params;
        await servicioTutorias.deleteTutoria(id);
        res.status(200).json({ message: 'Tutoría eliminada correctamente' });
    } catch (err) {
        console.error('[Tutorias] delete error:', err);
        const status = err.status || 500;
        res.status(status).json({ error: err.message || 'Error al eliminar la tutoría' });
    }
};