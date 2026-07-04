const db = require('../config/db');

/**
 * 📊 Stats para ESTUDIANTE
 */
async function statsForStudent(user) {
    const email = user.email;

    const r = await db.query(
        'SELECT * FROM fn_dashboard_stats_student($1);', [email]
    );

    const row = r.rows[0] || {
        tutorias_inscritas: 0,
        sesiones_con_asistencia: 0,
        asistencia_porcentaje: 0,
        horas_tutoria: 0,
    };

    return {
        tutoriasInscritas: row.tutorias_inscritas,
        sesionesConAsistencia: row.sesiones_con_asistencia,
        asistenciaPorcentaje: row.asistencia_porcentaje,
        horasTutoria: Number(row.horas_tutoria),
    };
}


/**
 * 📊 Stats para TUTOR / ADMIN
 */
async function statsForTutor(tutorId) {
    const result = await db.query(
        'SELECT * FROM fn_dashboard_stats_tutor($1);', [tutorId]
    );

    const row = result.rows[0] || {
        tutorias_activas: 0,
        estudiantes_inscritos: 0,
        sesiones_mes: 0,
        asistencias_registradas: 0,
    };

    console.log('[Dashboard] statsForTutor →', {
        tutorId,
        ...row,
    });

    return {
        tutoriasActivas: row.tutorias_activas,
        estudiantesInscritos: row.estudiantes_inscritos,
        sesionesMes: row.sesiones_mes,
        asistenciasRegistradas: row.asistencias_registradas,
    };
}

module.exports = {
    statsForStudent,
    statsForTutor,
};