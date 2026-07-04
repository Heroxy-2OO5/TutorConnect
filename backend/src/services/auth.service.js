// src/services/auth.service.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const FIELDS = `id, first_name, last_name, email, role, created_at`;

function toUserRow(r) {
    return {
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        role: r.role,
        createdAt: r.created_at
    };
}

function signToken(payload) {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES || '7d';
    return jwt.sign(payload, secret, { expiresIn });
}

async function getByEmail(email) {
    const q = `SELECT ${FIELDS}, password_hash FROM users WHERE email=$1`;
    const { rows } = await db.query(q, [email]);
    return rows[0] || null;
}

async function getById(id) {
    const q = `SELECT ${FIELDS} FROM users WHERE id=$1`;
    const { rows } = await db.query(q, [id]);
    if (!rows[0]) throw new Error('Not found');
    return toUserRow(rows[0]);
}

async function register({ firstName, lastName, email, role, password }) {
    if (!/@utmachala\.edu\.ec$/i.test(email)) {
        throw new Error('El correo debe terminar en @utmachala.edu.ec');
    }
    const exists = await getByEmail(email);
    if (exists) throw new Error('El correo ya está registrado');

    const hash = await bcrypt.hash(password, 10);
    const q = `
    INSERT INTO users (first_name, last_name, email, role, password_hash)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING ${FIELDS}
  `;
    const { rows } = await db.query(q, [firstName, lastName, email, role, hash]);
    const user = toUserRow(rows[0]);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
}

async function login({ email, password }) {
    const row = await getByEmail(email);
    if (!row) throw new Error('Correo no registrado');
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) throw new Error('Contraseña incorrecta');

    const user = toUserRow(row);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
}

async function listTutors() {
    const q = `
      SELECT ${FIELDS}
      FROM users
      WHERE role = 'TUTOR'
      ORDER BY first_name, last_name
    `;
    const { rows } = await db.query(q);
    return rows.map(toUserRow);
}

module.exports = {
    getByEmail,
    getById,
    register,
    login,
    listTutors,
};