// src/services/tutorias.service.js
const modelTutorias = require('../models/tutorias.models');

exports.getAllTutorias = async() => {
    return await modelTutorias.findAll();
};

exports.createTutoria = async(data) => {
    return await modelTutorias.insert(data);
};

exports.updateTutoria = async(id, data) => {
    return await modelTutorias.update(id, data);
};

exports.deleteTutoria = async(id) => {
    return await modelTutorias.remove(id);
};