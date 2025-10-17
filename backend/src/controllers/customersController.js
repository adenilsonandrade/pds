const pool = require('../db/database.js');

async function getRequesterInfo(userId) {
  const [rows] = await pool.query('SELECT id, role, business_id FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows && rows.length ? rows[0] : null;
}

exports.listCustomers = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });
    const { business_id: queryBusinessId, q } = req.query || {};

    if (requester.role === 'support') {
      let sql = `SELECT c.id, c.name, c.email, c.phone, c.address, c.city, c.notes, 
                c.business_id, b.brand_name AS business_name, c.created_at, c.updated_at 
                 FROM customers c 
                 LEFT JOIN businesses b ON c.business_id = b.id`;
      const where = [];
      const params = [];
      if (queryBusinessId) { where.push('c.business_id = ?'); params.push(queryBusinessId); }
      if (q) { where.push('(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
      if (where.length) sql += ` WHERE ` + where.join(' AND ');
      sql += ` ORDER BY c.created_at DESC`;
      const [rows] = await pool.query(sql, params);
      return res.status(200).json(rows);
    }

    if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id) {
        return res.status(400).json({ message: 'Usuário não pertence a um business válido' });
      }
      let sql = `SELECT c.id, c.name, c.email, c.phone, c.address, c.city, c.notes, 
                c.business_id, b.brand_name AS business_name, c.created_at, c.updated_at 
                 FROM customers c 
                 LEFT JOIN businesses b ON c.business_id = b.id 
                 WHERE c.business_id = ?`;
      const params = [requester.business_id];
      if (q) { sql += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)`; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
      sql += ` ORDER BY c.created_at DESC`;
      const [rows] = await pool.query(sql, params);
      return res.status(200).json(rows);
    }

    return res.status(403).json({ message: 'Permissão negada' });
  } catch (err) {
    console.error('Error listing customers:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const customerId = req.params.id;
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.email, c.phone, c.address, c.city, c.notes, 
              c.business_id, b.brand_name AS business_name, c.created_at, c.updated_at 
       FROM customers c 
       LEFT JOIN businesses b ON c.business_id = b.id 
       WHERE c.id = ? LIMIT 1`,
      [customerId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const customer = rows[0];

    if (requester.role === 'support') {
      return res.status(200).json(customer);
    }

    if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id || customer.business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para visualizar este cliente' });
      }
      return res.status(200).json(customer);
    }

    return res.status(403).json({ message: 'Permissão negada' });
  } catch (err) {
    console.error('Error getting customer:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const { name, email, phone, address, city, notes, business_id } = req.body || {};

    if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });

    let finalBusinessId = business_id;

    if (requester.role === 'support') {
      if (!business_id) {
        return res.status(400).json({ message: 'Business ID é obrigatório para support' });
      }
    } else if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id) {
        return res.status(400).json({ message: 'Usuário não pertence a um business válido' });
      }
      if (business_id && business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para criar cliente para outro business' });
      }
      finalBusinessId = requester.business_id;
    } else {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    if (email) {
      const [existing] = await pool.query(
        'SELECT id FROM customers WHERE email = ? AND business_id = ? LIMIT 1',
        [email, finalBusinessId]
      );
      if (existing && existing.length) {
        return res.status(409).json({ message: 'Já existe um cliente com este email neste petshop' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO customers (name, email, phone, address, city, notes, business_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email || null, phone || null, address || null, city || null, notes || null, finalBusinessId]
    );

    const newId = result.insertId;
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.email, c.phone, c.address, c.city, c.notes, 
              c.business_id, b.brand_name AS business_name, c.created_at, c.updated_at 
       FROM customers c 
       LEFT JOIN businesses b ON c.business_id = b.id 
       WHERE c.id = ? LIMIT 1`,
      [newId]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const customerId = req.params.id;
    const { name, email, phone, address, city, notes, business_id } = req.body || {};

    const [targetRows] = await pool.query(
      'SELECT id, business_id FROM customers WHERE id = ? LIMIT 1',
      [customerId]
    );
    if (!targetRows || targetRows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    const target = targetRows[0];

    if (requester.role === 'support') {
    } else if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id || target.business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para atualizar este cliente' });
      }
      if (business_id && business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para transferir cliente para outro business' });
      }
    } else {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    const updates = [];
    const params = [];

    if (typeof name !== 'undefined') { updates.push('name = ?'); params.push(name); }
    if (typeof email !== 'undefined') { updates.push('email = ?'); params.push(email); }
    if (typeof phone !== 'undefined') { updates.push('phone = ?'); params.push(phone); }
    if (typeof address !== 'undefined') { updates.push('address = ?'); params.push(address); }
    if (typeof city !== 'undefined') { updates.push('city = ?'); params.push(city); }
    if (typeof notes !== 'undefined') { updates.push('notes = ?'); params.push(notes); }
    
    if (typeof business_id !== 'undefined' && requester.role === 'support') {
      updates.push('business_id = ?'); params.push(business_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    params.push(customerId);
    const sql = `UPDATE customers SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await pool.query(sql, params);

    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.email, c.phone, c.address, c.city, c.notes, 
              c.business_id, b.brand_name AS business_name, c.created_at, c.updated_at 
       FROM customers c 
       LEFT JOIN businesses b ON c.business_id = b.id 
       WHERE c.id = ? LIMIT 1`,
      [customerId]
    );

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error updating customer:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const customerId = req.params.id;
    const [targetRows] = await pool.query(
      'SELECT id, business_id FROM customers WHERE id = ? LIMIT 1',
      [customerId]
    );
    if (!targetRows || targetRows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    const target = targetRows[0];

    if (requester.role === 'support') {
      await pool.query('DELETE FROM customers WHERE id = ?', [customerId]);
      return res.status(200).json({ message: 'Cliente apagado com sucesso' });
    }

    if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id || target.business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para apagar este cliente' });
      }
      await pool.query('DELETE FROM customers WHERE id = ?', [customerId]);
      return res.status(200).json({ message: 'Cliente apagado com sucesso' });
    }

    return res.status(403).json({ message: 'Permissão negada' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
