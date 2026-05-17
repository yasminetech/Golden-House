const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoutes);

// 404 Handler for API
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API Route not found' });
});

app.get('/', (req, res) => {
    res.send('Meriams Shop API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

const ensurePaymentMethodColumn = async () => {
    try {
        // Some MySQL/MariaDB versions don't accept parameter placeholders for SHOW statements.
        const [rows] = await db.execute("SHOW COLUMNS FROM orders LIKE 'payment_method'");
        if (rows.length === 0) {
            console.log('Adding missing payment_method column to orders table.');
            await db.execute("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'card'");
        }
    } catch (err) {
        console.error('Error ensuring orders schema:', err);
    }
};

const startServer = async () => {
    try {
        await ensurePaymentMethodColumn();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
