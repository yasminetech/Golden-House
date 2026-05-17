const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided.' });

    const bearerToken = token.split(' ')[1];
    if (!bearerToken) return res.status(403).json({ message: 'Invalid token format.' });

    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Failed to authenticate token.' });
        if (!decoded.id) return res.status(400).json({ message: 'Invalid token payload.' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).send({ message: 'Require Admin Role!' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };
