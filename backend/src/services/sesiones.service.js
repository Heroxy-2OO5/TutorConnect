// src/services/sesiones.service.js
const model = require('../models/sesiones.models');

exports.getAll = async(filters = {}) => {
    return await model.findAll(filters);
};

exports.create = async(data) => {
    return await model.insert(data);
};

exports.remove = async(id) => {
    return await model.remove(id);
};