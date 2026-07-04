// src/models/sesiones.models.js
const db = require('../config/db');

// Ya existía
exports.findAll = async({ tutoriaId }) => {
    const params = [];
    let where = '1=1';

    if (tutoriaId) {
        params.push(Number(tutoriaId));
        where += ` AND tutoria_id = $${params.length}`;
    }

    const sql = `
    SELECT
      id,
      tutoria_id,
      fecha,
      inicio,
      fin,
      aula
    FROM sesiones
    WHERE ${where}
    ORDER BY fecha ASC, inicio ASC`;

    const result = await db.query(sql, params);
    return result.rows;
};

// 👉 NUEVO: crear sesión
exports.insert = async({ tutoriaId, fecha, inicio, fin, aula }) => {
    const params = [
        Number(tutoriaId),
        fecha,
        inicio,
        fin,
        aula || null
    ];

    const sql = `
    INSERT INTO sesiones (tutoria_id, fecha, inicio, fin, aula)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      tutoria_id,
      fecha,
      inicio,
      fin,
      aula
  `;

    const result = await db.query(sql, params);
    return result.rows[0];
};

// 👉 NUEVO: eliminar sesión
exports.remove = async(id) => {
    await db.query('DELETE FROM sesiones WHERE id = $1', [Number(id)]);
};