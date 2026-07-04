// src/routes/asistencias.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/asistencias.controller');
const { requireAuth } = require('../middlewares/require-auth'); // 👈 reutiliza este

router.get('/', requireAuth, controller.getAll);
router.post('/', requireAuth, controller.marcar);

module.exports = router;