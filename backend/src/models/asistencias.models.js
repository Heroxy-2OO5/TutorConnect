const db = require('../config/db');

// LISTAR ASISTENCIAS (por sesión y/o estudiante)
exports.list = async({ sesionId, estudianteId }) => {
    const params = [
        sesionId ? Number(sesionId) : null, //  sesionId sí es numérico
        estudianteId || null, //  EMAIL, sin Number()
    ];

    const result = await db.query(
        'SELECT * FROM fn_asistencias_list($1,$2);',
        params
    );

    return result.rows;
};

// INSERTAR / ACTUALIZAR (UPSERT) ASISTENCIA
exports.upsert = async({ sesionId, estudianteId, estado, observacion, registradoPor }) => {
    const result = await db.query(
        'SELECT * FROM fn_asistencias_upsert($1,$2,$3,$4,$5::int);', [
            Number(sesionId),
            estudianteId, // email citext
            estado, // texto que coincide con enum estado_asist
            observacion || null,
            Number(registradoPor), // ✅ integer
        ]
    );

    return result.rows[0];
};