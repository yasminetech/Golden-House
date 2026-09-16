const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
    try {
        const [products] = await db.execute('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Add product
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { name, description, price, image_url, category, stock } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO products (name, description, price, image_url, category, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, image_url, category, stock]
        );
        res.status(201).json({ message: 'Product added', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update product
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { name, description, price, image_url, category, stock } = req.body;
    try {
        await db.execute(
            'UPDATE products SET name=?, description=?, price=?, image_url=?, category=?, stock=? WHERE id=?',
            [name, description, price, image_url, category, stock, req.params.id]
        );
        res.json({ message: 'Product updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete product safely with foreign key cascade handling
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Delete dependent order_items referencing this product
        await connection.execute('DELETE FROM order_items WHERE product_id = ?', [req.params.id]);

        // 2. Delete product from products table
        await connection.execute('DELETE FROM products WHERE id = ?', [req.params.id]);

        await connection.commit();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
