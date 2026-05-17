const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Signup
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log(`Login attempt failed: User ${email} not found.`);
            return res.status(404).json({ message: 'Compte non trouvé. Veuillez vous inscrire.' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Login attempt failed: Invalid password for ${email}`);
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log(`User logged in: ${user.email}, Role: ${user.role}`);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Database Error during login:', error.message);
        res.status(500).json({ error: 'Erreur de connexion à la base de données.' });
    }
});

module.exports = router;
