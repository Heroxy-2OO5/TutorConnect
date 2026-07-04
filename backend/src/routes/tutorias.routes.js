// src/routes/tutorias.routes.js
const express = require('express');
const router = express.Router();
const controllerTutorias = require('../controllers/tutorias.contoller');
const { requireAuth } = require('../middlewares/require-auth');

//Rutas de los end-points de tutorias
router.get('/', requireAuth, controllerTutorias.getAll);
router.post('/', requireAuth, controllerTutorias.create);
router.put('/:id', requireAuth, controllerTutorias.update); // 👈 NUEVO
router.delete('/:id', requireAuth, controllerTutorias.remove); // 👈 NUEVO

module.exports = router;