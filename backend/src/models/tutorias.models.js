const db = require('../config/db');

// ====================
//   LISTAR TUTORÍAS
// ====================
async function findAll() {
    const result = await db.query('SELECT * FROM fn_tutorias_find_all();');
    return result.rows;
}

// ====================
//     INSERTAR
// ====================
async function insert(data) {
    const {
        codigo_materia,
        tutor_nombre,
        titulo,
        descripcion,
        modalidad,
        aula,
        cupo_maximo,
        fecha,
        hora_inicio,
        hora_fin
    } = data;

    // 1) Validar materia
    const matRes = await db.query(
        'SELECT id FROM materias WHERE codigo = $1', [codigo_materia]
    );
    if (matRes.rowCount === 0) {
        const err = new Error(`No existe materia con código "${codigo_materia}".`);
        err.status = 400;
        throw err;
    }
    const materiaId = matRes.rows[0].id;

    // 2) Validar tutor
    const tutRes = await db.query(
        `SELECT id
       FROM users
      WHERE TRIM(first_name || ' ' || last_name) = TRIM($1)`, [tutor_nombre]
    );
    if (tutRes.rowCount === 0) {
        const err = new Error(`No existe tutor con nombre "${tutor_nombre}".`);
        err.status = 400;
        throw err;
    }
    const tutorId = tutRes.rows[0].id;

    // 3) Insertar vía SP
    await db.query(
        'CALL sp_insertar_tutoria($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);', [
            materiaId,
            tutorId,
            titulo,
            descripcion,
            modalidad,
            aula,
            cupo_maximo,
            fecha,
            hora_inicio,
            hora_fin
        ]
    );
}

// ====================
//       EDITAR
// ====================
async function update(id, data) {
    const {
        codigo_materia,
        tutor_nombre,
        titulo,
        descripcion,
        modalidad,
        aula,
        cupo_maximo,
        hora_inicio,
        hora_fin
    } = data;

    // 1) Validar materia
    const matRes = await db.query(
        'SELECT id FROM materias WHERE codigo = $1', [codigo_materia]
    );
    if (matRes.rowCount === 0) {
        const err = new Error(`No existe materia con código "${codigo_materia}".`);
        err.status = 400;
        throw err;
    }
    const materiaId = matRes.rows[0].id;

    // 2) Validar tutor
    const tutRes = await db.query(
        `SELECT id
       FROM users
      WHERE TRIM(first_name || ' ' || last_name) = TRIM($1)`, [tutor_nombre]
    );
    if (tutRes.rowCount === 0) {
        const err = new Error(`No existe tutor con nombre "${tutor_nombre}".`);
        err.status = 400;
        throw err;
    }
    const tutorId = tutRes.rows[0].id;

    // 3) Actualizar vía SP
    await db.query(
        'CALL sp_actualizar_tutoria($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);', [
            id,
            materiaId,
            tutorId,
            titulo,
            descripcion,
            modalidad,
            aula,
            cupo_maximo,
            hora_inicio,
            hora_fin
        ]
    );
}

// ====================
//      ELIMINAR
// ====================
async function remove(id) {
    await db.query('CALL sp_eliminar_tutoria($1);', [id]);
}

module.exports = {
    findAll,
    insert,
    update,
    remove,
};