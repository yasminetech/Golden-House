const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all messages (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [messages] = await db.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await db.execute(
            'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
