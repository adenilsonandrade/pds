const mysql = require('mysql2/promise');

console.log('DB pool config:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'augendapet_db',
    user: process.env.DB_USER || 'pds_user'
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'pds_user',
    password: process.env.DB_PASSWORD || 'MARIADB@3f4za89b##',
    database: process.env.DB_NAME || 'augendapet_db',
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10,
    queueLimit: 0
});

module.exports = pool;
