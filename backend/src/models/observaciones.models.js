// src/models/observaciones.models.js
const db = require('../config/db');

async function getUserIdByEmail(email) {
    const r = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (r.rowCount === 0) throw new Error(`No existe usuario con email ${email}`);
    return r.rows[0].id;
}

exports.findAll = async({ tutoriaId, sesionId, estudianteEmail }) => {
    const params = [];
    const where = [];

    if (tutoriaId) {
        params.push(Number(tutoriaId));
        where.push(`o.tutoria_id = $${params.length}`);
    }
    if (sesionId) {
        params.push(Number(sesionId));
        where.push(`o.sesion_id = $${params.length}`);
    }
    if (estudianteEmail) {
        params.push(estudianteEmail);
        where.push(`ue.email = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
    SELECT
      o.id,
      o.tutoria_id,
      o.sesion_id,
      ue.email  AS estudiante_email,
      ua.email  AS autor_email,
      o.fecha,
      o.tipo,
      o.texto,
      o.pendiente,
      o.calificacion
    FROM observaciones o
    JOIN users ue ON ue.id = o.estudiante_id
    JOIN users ua ON ua.id = o.autor_id
    ${whereSql}
    ORDER BY o.fecha DESC, o.id DESC
  `;

    const result = await db.query(sql, params);
    return result.rows;
};

exports.create = async({ tutoriaId, sesionId, estudianteEmail, tipo, texto, pendiente, calificacion, autorId }) => {
    const estudianteId = await getUserIdByEmail(estudianteEmail);

    const sql = `
    INSERT INTO observaciones
      (tutoria_id, sesion_id, estudiante_id, autor_id, fecha, tipo, texto, pendiente, calificacion)
    VALUES
      ($1, $2, $3, $4, NOW(), $5, $6, $7, $8)
    RETURNING
      id, tutoria_id, sesion_id, estudiante_id, autor_id, fecha, tipo, texto, pendiente, calificacion
  `;

    const result = await db.query(sql, [
        Number(tutoriaId),
        sesionId ? Number(sesionId) : null,
        estudianteId,
        Number(autorId),
        tipo,
        texto, !!pendiente,
        calificacion ? calificacion : null,
    ]);

    return await exports.findById(result.rows[0].id);
};

exports.update = async(id, patch = {}) => {
    const fields = [];
    const params = [];
    let i = 1;

    const allowed = ['tipo', 'texto', 'pendiente', 'calificacion', 'sesionId'];
    for (const k of allowed) {
        if (patch[k] === undefined) continue;

        if (k === 'sesionId') {
            fields.push(`sesion_id = $${i++}`);
            params.push(patch.sesionId ? Number(patch.sesionId) : null);
            continue;
        }

        fields.push(`${k} = $${i++}`);
        params.push(patch[k]);
    }

    if (!fields.length) return null;

    params.push(Number(id));

    const sql = `
    UPDATE observaciones
    SET ${fields.join(', ')}
    WHERE id = $${i}
    RETURNING id, tutoria_id, sesion_id, estudiante_id, autor_id, fecha, tipo, texto, pendiente, calificacion
  `;

    const result = await db.query(sql, params);
    if (!result.rows[0]) return null;
    return await exports.findById(result.rows[0].id);
};

exports.remove = async(id) => {
    await db.query('DELETE FROM observaciones WHERE id = $1', [Number(id)]);
};

exports.togglePendiente = async(id) => {
    const result = await db.query(
        `
    UPDATE observaciones
    SET pendiente = NOT pendiente
    WHERE id = $1
    RETURNING id, tutoria_id, sesion_id, estudiante_id, autor_id, fecha, tipo, texto, pendiente, calificacion
    `, [Number(id)]
    );
    if (!result.rows[0]) return null;
    return await exports.findById(result.rows[0].id);

};

exports.findById = async(id) => {
    const sql = `
    SELECT
      o.id,
      o.tutoria_id,
      o.sesion_id,
      ue.email AS estudiante_email,
      ua.email AS autor_email,
      o.fecha,
      o.tipo,
      o.texto,
      o.pendiente,
      o.calificacion
    FROM observaciones o
    JOIN users ue ON ue.id = o.estudiante_id
    JOIN users ua ON ua.id = o.autor_id
    WHERE o.id = $1
  `;
    const r = await db.query(sql, [Number(id)]);
    return r.rows[0] || null;
};