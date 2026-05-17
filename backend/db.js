const mysql = require('mysql2');
require('dotenv').config();

// Create a function to get config safely
const getDbConfig = () => {
    if (process.env.DATABASE_URL) {
        let databaseUrl;
        try {
            databaseUrl = new URL(process.env.DATABASE_URL);
        } catch (err) {
            console.warn('Ignoring invalid DATABASE_URL. Falling back to DB_* variables.');
            return getDbConfigFromVariables();
        }

        if (!['mysql:', 'mysql2:'].includes(databaseUrl.protocol)) {
            console.warn('Ignoring non-MySQL DATABASE_URL. Falling back to DB_* variables.');
            return getDbConfigFromVariables();
        }

        return { 
            uri: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        };
    }

    return getDbConfigFromVariables();
};

const getDbConfigFromVariables = () => {
    return {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
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
