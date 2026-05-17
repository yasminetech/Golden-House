const mysql = require('mysql2');
require('dotenv').config();

// Create a function to get config safely
const getDbConfig = () => {
    if (process.env.DATABASE_URL) {
        return { 
            uri: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        };
    }
    return {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'meriams_shop'
    };
};

const pool = mysql.createPool({
    ...getDbConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
