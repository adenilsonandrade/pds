const pool = require('../db/database.js');
const bcrypt = require('bcrypt');

async function getRequesterInfo(userId) {
  const [rows] = await pool.query('SELECT id, role, business_id FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows && rows.length ? rows[0] : null;
}

exports.listUsers = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    if (requester.role === 'support') {
      const [rows] = await pool.query('SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.business_id, b.brand_name AS business_name, u.created_at FROM users u LEFT JOIN businesses b ON u.business_id = b.id');
      return res.status(200).json(rows);
    }

    if (requester.role === 'admin') {
  
  const [rows] = await pool.query('SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.business_id, b.brand_name AS business_name, u.created_at FROM users u LEFT JOIN businesses b ON u.business_id = b.id WHERE u.business_id = ? AND u.role <> ?', [requester.business_id, 'support']);
  return res.status(200).json(rows);
    }

    return res.status(403).json({ message: 'Permissão negada' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const targetId = req.params.id;
    const [targetRows] = await pool.query('SELECT id, business_id FROM users WHERE id = ? LIMIT 1', [targetId]);
    if (!targetRows || targetRows.length === 0) return res.status(404).json({ message: 'Usuário alvo não encontrado' });
    const target = targetRows[0];

    if (requester.role === 'support') {
      await pool.query('DELETE FROM users WHERE id = ?', [targetId]);
      return res.status(200).json({ message: 'Usuário apagado' });
    }

    if (requester.role === 'admin') {
      if (requester.business_id && target.business_id && requester.business_id === target.business_id) {
        await pool.query('DELETE FROM users WHERE id = ?', [targetId]);
        return res.status(200).json({ message: 'Usuário apagado' });
      }
      return res.status(403).json({ message: 'Não autorizado para apagar este usuário' });
    }

    return res.status(403).json({ message: 'Permissão negada' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

  const { email, first_name, last_name, name, phone, password, role, business_id } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email é obrigatório' });

    
    if (requester.role === 'admin') {
      if (!requester.business_id) return res.status(400).json({ message: 'Admin não pertence a um business válido' });
      if (business_id && business_id !== requester.business_id) return res.status(403).json({ message: 'Admin não pode criar usuários para outro business' });
      
      if (role === 'support') return res.status(403).json({ message: 'Admin não pode criar usuário support' });
    } else if (requester.role !== 'support') {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing && existing.length) return res.status(409).json({ message: 'Email já cadastrado' });

  const pwdHash = password ? await bcrypt.hash(password, 10) : null;
  const userRole = role || 'user';
  const bizId = userRole === 'support' ? null : (business_id || requester.business_id || null);

  const [result] = await pool.query('INSERT INTO users (email, password_hash, first_name, last_name, phone, role, business_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [email, pwdHash, first_name || (name || null), last_name || null, phone || null, userRole, bizId]);
    const newId = result.insertId;
  const [rows] = await pool.query('SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.business_id, b.brand_name AS business_name, u.created_at FROM users u LEFT JOIN businesses b ON u.business_id = b.id WHERE u.id = ? LIMIT 1', [newId]);
  return res.status(201).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

  const targetId = req.params.id;
  const { email, first_name, last_name, name, phone, password, role, business_id, status } = req.body || {};

    const [targetRows] = await pool.query('SELECT id, business_id, role FROM users WHERE id = ? LIMIT 1', [targetId]);
    if (!targetRows || targetRows.length === 0) return res.status(404).json({ message: 'Usuário alvo não encontrado' });
    const target = targetRows[0];

    
    if (requester.role === 'support') {
      
    } else if (requester.role === 'admin') {
      if (!requester.business_id || !target.business_id || requester.business_id !== target.business_id) {
        return res.status(403).json({ message: 'Não autorizado para atualizar este usuário' });
      }
      if (role === 'support') return res.status(403).json({ message: 'Admin não pode atribuir role support' });
    } else {
      
      if (requesterId !== targetId && requester.role !== 'support') return res.status(403).json({ message: 'Permissão negada' });
      
      if (typeof role !== 'undefined' || typeof business_id !== 'undefined') return res.status(403).json({ message: 'Usuário não pode alterar role ou business' });
    }

    const updates = [];
    const params = [];
    if (typeof email !== 'undefined') { updates.push('email = ?'); params.push(email); }
  if (typeof first_name !== 'undefined') { updates.push('first_name = ?'); params.push(first_name); }
  if (typeof last_name !== 'undefined') { updates.push('last_name = ?'); params.push(last_name); }
  if (typeof name !== 'undefined') { updates.push('first_name = ?'); params.push(name); }
  if (typeof phone !== 'undefined') { updates.push('phone = ?'); params.push(phone); }
  if (typeof role !== 'undefined') { updates.push('role = ?'); params.push(role); }
    if (typeof status !== 'undefined') { updates.push('status = ?'); params.push(status); }
    if (typeof business_id !== 'undefined') { updates.push('business_id = ?'); params.push(business_id); }
    if (typeof password !== 'undefined' && password !== null) {
      const pwdHash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?'); params.push(pwdHash);
    }

    if (updates.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });

    params.push(targetId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, params);
  const [rows] = await pool.query('SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.business_id, b.brand_name AS business_name, u.status, u.created_at FROM users u LEFT JOIN businesses b ON u.business_id = b.id WHERE u.id = ? LIMIT 1', [targetId]);
  return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
