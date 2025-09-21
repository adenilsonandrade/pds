const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '192.168.0.6',
    user: 'pds_user',
    password: 'MARIADB@3f4za89b##',
    database: 'augendapet_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;