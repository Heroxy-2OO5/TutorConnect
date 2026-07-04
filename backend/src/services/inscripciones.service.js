// Servicio: delega todo al model
const model = require('../models/inscripciones.models');

exports.getAll = async(filters = {}) => {
    // filters puede traer: { tutoriaId?, estudianteEmail? }
    return await model.findAll(filters);
};

exports.inscribirEnTutoria = async(tutoriaId, estudianteEmail) => {
    return await model.inscribir(tutoriaId, estudianteEmail);
};