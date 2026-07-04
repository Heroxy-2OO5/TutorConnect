const express = require('express');
const router = express.Router();
const controller = require('../controllers/inscripciones.controller');
const { requireAuth } = require('../middlewares/require-auth');

// GET /api/inscripciones
// GET /api/inscripciones?tutoriaId=2
// GET /api/inscripciones?estudianteEmail=estudiante@utmachala.edu.ec
router.get('/', requireAuth, controller.getAll);
router.post('/', requireAuth, controller.join);
router.put('/:id', requireAuth, controller.updateEstado);

module.exports = router;