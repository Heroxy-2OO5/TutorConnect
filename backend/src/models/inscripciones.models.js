// Exportamos la conexión
const db = require('../config/db');

// Listado con filtros opcionales por tutoriaId y/o estudianteEmail
exports.findAll = async({ tutoriaId, estudianteEmail }) => {
    const params = [];
    let where = '1=1';

    if (tutoriaId) {
        params.push(Number(tutoriaId));
        where += ` AND i.tutoria_id = $${params.length}`;
    }
    if (estudianteEmail) {
        params.push(estudianteEmail);
        where += ` AND u.email = $${params.length}`;
    }

    const sql = `
    SELECT
        i.id,
        i.tutoria_id,
        u.email AS estudiante_email,
        i.estado,
        i.creado_en AS created_at
    FROM inscripciones i
    JOIN users u ON u.id = i.estudiante_id
    WHERE ${where}
    ORDER BY i.creado_en DESC`;

    const result = await db.query(sql, params);
    return result.rows;
};

exports.inscribir = async(tutoriaId, estudianteEmail) => {
    // 1) Buscar id del estudiante por email
    const userRes = await db.query(
        'SELECT id FROM users WHERE email = $1', [estudianteEmail]
    );

    if (userRes.rowCount === 0) {
        throw new Error(`No existe estudiante con email ${estudianteEmail}`);
    }

    const estudianteId = userRes.rows[0].id;

    // 2) Llamar al procedimiento almacenado
    await db.query(
        'CALL sp_inscribir_estudiante($1,$2);', [tutoriaId, estudianteId]
    );
};

exports.actualizarEstado = async(id, estado) => {
    const sql = `
    UPDATE inscripciones
    SET estado = $2
    WHERE id = $1
    RETURNING id, tutoria_id, estudiante_id, estado, creado_en;
  `;

    const result = await db.query(sql, [Number(id), estado]);

    if (result.rowCount === 0) {
        throw new Error('Inscripción no encontrada');
    }

    return result.rows[0];
};