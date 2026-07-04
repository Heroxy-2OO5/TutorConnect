// src/controllers/auth.controller.js
const authSvc = require('../services/auth.service');

exports.register = async(req, res) => {
    try {
        const { firstName, lastName, email, role, password } = req.body;
        const result = await authSvc.register({ firstName, lastName, email, role, password });
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message || 'Bad request' });
    }
};

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authSvc.login({ email, password });
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: err.message || 'No autorizado' });
    }
};

exports.me = async(req, res) => {
    try {
        const user = await authSvc.getById(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(404).json({ error: 'Usuario no encontrado' });
    }
};

exports.listTutors = async(req, res) => {
    try {
        const tutors = await authSvc.listTutors();
        res.json(tutors);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Error al listar tutores' });
    }
};