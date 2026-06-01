const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Akses ditolak. Token tidak ada.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Berisi id, username, dan tier (free/pro)
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token tidak valid.' });
    }
};

module.exports = authenticate;