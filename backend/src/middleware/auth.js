const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_secure_secret_in_prod';

module.exports = function (req, res, next) {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth || typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token ausente' });
    }
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};
