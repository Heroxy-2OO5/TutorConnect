// src/routes/sesiones.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/sesiones.controller');
const { requireAuth } = require('../middlewares/require-auth');

router.get('/', requireAuth, controller.getAll); // listar sesiones
router.post('/', requireAuth, controller.create); // 👉 crear sesión
router.delete('/:id', requireAuth, controller.remove); // 👉 eliminar sesión

module.exports = router;