// src/controllers/dashboard.controller.js
const svc = require('../services/dashboard.service');

exports.getStats = async(req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        const stats = await svc.getStatsForUser(req.user);
        res.json(stats);
    } catch (err) {
        console.error('[Dashboard] getStats error:', err);
        res.status(500).json({ error: err.message || 'Error al obtener estadísticas' });
    }
};