// Exportamos lo necesario
const { Pool } = require('pg');
require('dotenv').config();

// Creamos la conexion a la bd
const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE
});

pool.on('connect', (client) => {
    client.query('SET search_path TO tutorconnect, public');
});

module.exports = pool;