// src/services/dashboard.service.js
const model = require('../models/dashboard.models');

exports.getStatsForUser = async(user) => {
    if (user.role === 'STUDENT') {
        const data = await model.statsForStudent(user); // 👈 le paso id + email
        return { role: 'STUDENT', ...data };
    }

    const data = await model.statsForTutor(user.id);
    return { role: user.role, ...data };
};