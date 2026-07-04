// src/services/asistencias.service.js
const model = require('../models/asistencias.models');

exports.list = async({ sesionId, estudianteId }) => {
    // ✅ pásalo como objeto
    return await model.list({ sesionId, estudianteId });
};

exports.marcar = async({ sesionId, estudianteId, estado, observacion, registradoPor }) => {
    // ✅ pásalo como objeto
    return await model.upsert({
        sesionId,
        estudianteId,
        estado,
        observacion,
        registradoPor,
    });
};