// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Esperamos un header: Authorization: Bearer <token>
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Falta header Authorization.' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Formato de Authorization inválido.' });
    }

    const token = parts[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        req.user = payload;
        next();
    } catch (err) {
        console.error('[auth.middleware] error:', err);
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};