//Exportamos lo que nesecitamos
const express = require('express');
const router = express.Router();
const controller = require('../controllers/materias.controller');
const { requireAuth } = require('../middlewares/require-auth');

//rutas de los end-points de materias
router.get('/', requireAuth, controller.getAll);
router.post('/', requireAuth, controller.createMaterias);
router.put('/:id', requireAuth, controller.updateMateria);
router.delete('/:id', requireAuth, controller.deleteMateria);

module.exports = router;