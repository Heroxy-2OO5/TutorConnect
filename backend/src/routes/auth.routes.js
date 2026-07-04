// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/require-auth');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/me', requireAuth, authCtrl.me);
router.get('/tutors', requireAuth, authCtrl.listTutors);

module.exports = router;