const mysql = require('mysql2');
require('dotenv').config();

const dbHost = process.env.DB_HOST || '';
const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || dbHost.includes('clever-cloud') || dbHost.includes('mysql.services');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sia_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    acquireTimeout: 10000,
    timeout: 10000,
    reconnect: true,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
});

module.exports = pool.promise();
