const pool = require('../db/database.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_secure_secret_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
const crypto = require('crypto');

async function findUserByEmail(email) {
    const [rows] = await pool.query('SELECT id, email, password_hash, first_name, last_name, phone FROM users WHERE email = ? LIMIT 1', [email]);
    return rows && rows.length ? rows[0] : null;
}

exports.register = async (req, res) => {
    const { email, password, first_name, last_name, phone } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

    try {
        const existing = await findUserByEmail(email);
        if (existing) return res.status(409).json({ message: 'Email já cadastrado' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)', [email, hash, first_name || null, last_name || null, phone || null]);
        const userId = result.insertId;
        const token = jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
        await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [userId, refreshToken, expiresAt]);
        return res.status(201).json({ token, refreshToken, user: { id: userId, email, first_name: first_name || null, last_name: last_name || null, phone: phone || null } });
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

    try {
    const user = await findUserByEmail(email);
        if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

        if (!user.password_hash) return res.status(500).json({ message: 'Usuário sem senha configurada' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
        await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, expiresAt]);
        return res.status(200).json({ token, refreshToken, user: { id: user.id, email: user.email, first_name: user.first_name || null, last_name: user.last_name || null, phone: user.phone || null } });
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

exports.refresh = async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token é obrigatório' });
    try {
        const [rows] = await pool.query('SELECT id, user_id, expires_at, revoked FROM refresh_tokens WHERE token = ? LIMIT 1', [refreshToken]);
        if (!rows || rows.length === 0) return res.status(401).json({ message: 'Refresh token inválido' });
        const dbToken = rows[0];
        if (dbToken.revoked) return res.status(401).json({ message: 'Refresh token revogado' });
        if (dbToken.expires_at && new Date(dbToken.expires_at) < new Date()) return res.status(401).json({ message: 'Refresh token expirado' });

        
    const [userRows] = await pool.query('SELECT id, email, first_name, last_name, phone FROM users WHERE id = ? LIMIT 1', [dbToken.user_id]);
        if (!userRows || userRows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    const user = userRows[0];
        const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
        await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [dbToken.id]);
        await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, newRefreshToken, newExpiresAt]);

        return res.status(200).json({ token, refreshToken: newRefreshToken, user: { id: user.id, email: user.email, first_name: user.first_name || null, last_name: user.last_name || null, phone: user.phone || null } });
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token é obrigatório' });
    try {
        await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [refreshToken]);
        return res.status(200).json({ message: 'Logout realizado' });
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

exports.me = async (req, res) => {
    try {
        const userId = req.user && req.user.sub;
        if (!userId) return res.status(401).json({ message: 'Não autenticado' });
        const [rows] = await pool.query(
            'SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.business_id, b.brand_name AS business_name, u.created_at FROM users u LEFT JOIN businesses b ON u.business_id = b.id WHERE u.id = ? LIMIT 1',
            [userId]
        );
        if (!rows || rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    const user = rows[0];
    return res.status(200).json({ id: user.id, email: user.email, first_name: user.first_name || null, last_name: user.last_name || null, phone: user.phone || null, role: user.role || 'user', business_id: user.business_id || null, business_name: user.business_name || null, created_at: user.created_at });
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
