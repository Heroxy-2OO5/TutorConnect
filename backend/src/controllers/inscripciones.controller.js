const model = require('../models/inscripciones.models');
const inscripcionesService = require('../services/inscripciones.service');

exports.getAll = async(req, res) => {
    try {
        const { tutoriaId, estudianteEmail } = req.query;
        const data = await model.findAll({ tutoriaId, estudianteEmail });
        res.json(data);
    } catch (err) {
        console.error('Error en getAll:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.join = async(req, res) => {
    try {
        const { tutoriaId, estudianteEmail } = req.body;

        console.log('[Inscripciones] join body:', req.body);

        if (!tutoriaId || !estudianteEmail) {
            return res
                .status(400)
                .json({ error: 'tutoriaId y estudianteEmail son requeridos' });
        }

        // 👉 usa el nombre "inscripcionesService", no "service"
        await inscripcionesService.inscribirEnTutoria(
            Number(tutoriaId),
            estudianteEmail
        );

        res.status(201).json({ message: 'Inscripción realizada correctamente' });
    } catch (err) {
        console.error('[Inscripciones] join error:', err);
        res.status(400).json({ error: err.message });
    }
};

exports.updateEstado = async(req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ error: 'El campo "estado" es requerido' });
        }

        const updated = await model.actualizarEstado(id, estado);
        res.json(updated);
    } catch (err) {
        console.error('[Inscripciones] updateEstado error:', err);
        res.status(400).json({ error: err.message });
    }
};