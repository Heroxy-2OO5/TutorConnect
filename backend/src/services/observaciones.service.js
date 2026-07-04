const model = require('../models/observaciones.models');

exports.list = async({ user, tutoriaId, sesionId, estudianteEmail }) => {
    // STUDENT: solo sus observaciones
    if (user.role === 'STUDENT') {
        return await model.findAll({
            estudianteEmail: user.email,
        });
    }

    // STAFF
    return await model.findAll({
        tutoriaId,
        sesionId,
        estudianteEmail,
    });
};

exports.create = async({ user, data }) => {
    if (user.role !== 'ADMIN' && user.role !== 'TUTOR') {
        throw new Error('No autorizado');
    }

    const {
        tutoriaId,
        sesionId,
        estudianteId, // email
        tipo,
        texto,
        pendiente,
        calificacion,
    } = data;

    if (!tutoriaId || !estudianteId || !tipo || !texto) {
        throw new Error('Faltan datos obligatorios');
    }

    return await model.create({
        tutoriaId,
        sesionId,
        estudianteEmail: estudianteId,
        tipo,
        texto,
        pendiente,
        calificacion,
        autorId: user.id,
    });
};

exports.update = async({ user, id, patch }) => {
    if (user.role !== 'ADMIN' && user.role !== 'TUTOR') {
        throw new Error('No autorizado');
    }

    return await model.update(id, patch);
};

exports.remove = async({ user, id }) => {
    if (user.role !== 'ADMIN' && user.role !== 'TUTOR') {
        throw new Error('No autorizado');
    }

    await model.remove(id);
};

exports.togglePendiente = async({ user, id }) => {
    if (user.role !== 'ADMIN' && user.role !== 'TUTOR') {
        throw new Error('No autorizado');
    }

    return await model.togglePendiente(id);
};