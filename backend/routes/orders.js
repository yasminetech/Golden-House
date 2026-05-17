const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Create order
router.post('/', verifyToken, async (req, res) => {
    const { total_amount, items, payment_method } = req.body;
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        console.log('Creating order for user:', req.userId, 'payment_method:', payment_method);

        if (!Array.isArray(items) || items.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Le panier est vide ou invalide.' });
        }

        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total_amount, payment_method) VALUES (?, ?, ?)',
            [req.userId, total_amount, payment_method || 'card']
        );
        const orderId = orderResult.insertId;

        for (const item of items) {
            // Validate product exists and stock availability
            const [productRows] = await connection.execute('SELECT id, name, stock, price FROM products WHERE id = ?', [item.id]);
            if (productRows.length === 0) {
                await connection.rollback();
                return res.status(400).json({ error: `Produit introuvable (id=${item.id}).` });
            }
            const product = productRows[0];
            if (product.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ error: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}` });
            }
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );
            
            // Optional: Reduce stock
            await connection.execute(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.id]
            );
        }

        // Orders stay 'pending' until the payment gateway confirms success via /payment routes
        let orderStatus = 'pending';

        await connection.commit();
        res.status(201).json({ message: 'Order created successfully', orderId, status: orderStatus });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Get all orders (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                o.id as order_id, 
                o.total_amount, 
                o.payment_method,
                o.status, 
                o.created_at,
                u.username,
                u.email,
                oi.id as item_id,
                oi.product_id,
                oi.quantity,
                oi.price as item_price,
                p.name as product_name,
                p.image_url
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            ORDER BY o.created_at DESC
        `);

        const ordersMap = rows.reduce((acc, row) => {
            if (!acc[row.order_id]) {
                acc[row.order_id] = {
                    id: row.order_id,
                    username: row.username,
                    email: row.email,
                    total_amount: row.total_amount,
                    payment_method: row.payment_method,
                    status: row.status,
                    created_at: row.created_at,
                    items: []
                };
            }
            
            if (row.item_id) {
                acc[row.order_id].items.push({
                    id: row.item_id,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    image_url: row.image_url,
                    quantity: row.quantity,
                    price: row.item_price
                });
            }
            
            return acc;
        }, {});

        res.json(Object.values(ordersMap));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user orders with items
router.get('/user', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                o.id as order_id, 
                o.total_amount, 
                o.payment_method,
                o.status, 
                o.created_at,
                oi.id as item_id,
                oi.product_id,
                oi.quantity,
                oi.price as item_price,
                p.name as product_name,
                p.image_url
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [req.userId]);

        // Group rows by order_id
        const ordersMap = rows.reduce((acc, row) => {
            if (!row.order_id) return acc;
            
            if (!acc[row.order_id]) {
                acc[row.order_id] = {
                    id: row.order_id,
                    total_amount: row.total_amount,
                    payment_method: row.payment_method,
                    status: row.status,
                    created_at: row.created_at,
                    items: []
                };
            }
            
            if (row.item_id) {
                acc[row.order_id].items.push({
                    id: row.item_id,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    image_url: row.image_url,
                    quantity: row.quantity,
                    price: row.item_price
                });
            }
            
            return acc;
        }, {});

        res.json(Object.values(ordersMap));
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
