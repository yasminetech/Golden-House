const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
// Diagnostic: log presence of DB env vars (do not print secrets)
console.log('DB env:', {
    DB_HOST: !!process.env.DB_HOST,
    DB_USER: !!process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'EMPTY',
    DB_NAME: !!process.env.DB_NAME
});

const db = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5500;
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
const frontendIndexPath = path.join(frontendBuildPath, 'index.html');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
}

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoutes);

// Health check for Railway/Vercel
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// 404 Handler for API
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API Route not found' });
});

app.get(/^(?!\/api).*/, (req, res) => {
    if (fs.existsSync(frontendIndexPath)) {
        return res.sendFile(frontendIndexPath);
    }
    res.send('Golden House API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

const ensurePaymentMethodColumn = async () => {
    try {
        console.log('Checking database connection...');
        // Some MySQL/MariaDB versions don't accept parameter placeholders for SHOW statements.
        const [rows] = await db.execute("SHOW COLUMNS FROM orders LIKE 'payment_method'");
        if (rows.length === 0) {
            console.log('Adding missing payment_method column to orders table.');
            await db.execute("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'card'");
        }
        console.log('Database check complete.');
    } catch (err) {
        console.error('Database connection failed. Check your DATABASE_URL/DB variables.', err.message);
        // We don't exit here so the server can still start and show a health check
    }
};

const startServer = async () => {
    // Start listening immediately so Railway doesn't timeout
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Visit http://0.0.0.0:${PORT} to check`);
        
        // Then try to connect to the DB
        ensurePaymentMethodColumn();
    });
};

startServer();
