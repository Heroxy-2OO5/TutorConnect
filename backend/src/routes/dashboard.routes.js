// src/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middlewares/require-auth');

router.get('/stats', requireAuth, controller.getStats);

module.exports = router;