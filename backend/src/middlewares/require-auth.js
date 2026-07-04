// src/middlewares/require-auth.js
const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
    const hdr = req.headers['authorization'] || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // { id, email, role }
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};