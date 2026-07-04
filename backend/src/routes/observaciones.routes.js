const express = require('express');
const router = express.Router();
const controller = require('../controllers/observaciones.controller');
const { requireAuth } = require('../middlewares/require-auth');

router.get('/', requireAuth, controller.getAll);
router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);
router.patch('/:id/toggle-pendiente', requireAuth, controller.togglePendiente);

module.exports = router;