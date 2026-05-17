const mysql = require('mysql2');
require('dotenv').config();

// Support for both separate variables and a single DATABASE_URL (standard on cloud)
const dbConfig = process.env.DATABASE_URL || {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'meriams_shop',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : null // Enable SSL if using a URL (cloud)
};

const pool = mysql.createPool({
    ...(typeof dbConfig === 'string' ? { uri: dbConfig } : dbConfig),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
