const mysql = require('mysql2');
require('dotenv').config();

const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
});

module.exports = pool.promise();
