const service = require('../services/observaciones.service');

exports.getAll = async(req, res) => {
    try {
        const data = await service.list({
            user: req.user,
            tutoriaId: req.query.tutoriaId,
            sesionId: req.query.sesionId,
            estudianteEmail: req.query.estudianteId,
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async(req, res) => {
    try {
        const row = await service.create({
            user: req.user,
            data: req.body,
        });
        res.status(201).json(row);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async(req, res) => {
    try {
        const row = await service.update({
            user: req.user,
            id: req.params.id,
            patch: req.body,
        });
        res.json(row);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.remove = async(req, res) => {
    try {
        await service.remove({
            user: req.user,
            id: req.params.id,
        });
        res.json({ message: 'Eliminado' });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};

exports.togglePendiente = async(req, res) => {
    try {
        const row = await service.togglePendiente({
            user: req.user,
            id: req.params.id,
        });
        res.json(row);
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};