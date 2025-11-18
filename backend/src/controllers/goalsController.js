const pool = require('../db/database.js');

async function ensureTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS goals (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      business_id BIGINT NULL,
      amount DECIMAL(12,2) NOT NULL,
      period_start DATE NULL,
      period_end DATE NULL,
      description TEXT NULL,
      status VARCHAR(32) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(createSql);
}

async function listGoals(req, res) {
  try {
    await ensureTable();
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const [urows] = await pool.query('SELECT id, role, business_id FROM users WHERE id = ? LIMIT 1', [requesterId]);
    const requester = urows && urows.length ? urows[0] : null;
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    let businessId = req.query?.business_id ?? (req.body ? req.body.business_id : null) ?? null;
    if (requester.role !== 'support') {
      if (!requester.business_id) return res.status(400).json({ message: 'Usuário não pertence a um business válido' });
      businessId = requester.business_id;
    }

    let sql = 'SELECT * FROM goals';
    const params = [];
    if (businessId) {
      sql += ' WHERE business_id = ?';
      params.push(businessId);
    } else {
      return res.json({ goals: [] });
    }
    sql += ' ORDER BY period_start DESC, created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ goals: rows });
  } catch (err) {
    console.error('listGoals error', err);
    res.status(500).json({ message: err.message || 'Erro ao listar metas' });
  }
}

async function createGoal(req, res) {
  try {
    await ensureTable();
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const [urows] = await pool.query('SELECT id, role, business_id FROM users WHERE id = ? LIMIT 1', [requesterId]);
    const requester = urows && urows.length ? urows[0] : null;
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const { business_id, amount, period_start, period_end, description, status } = req.body || {};
    if (amount == null) return res.status(400).json({ message: 'amount é obrigatório' });

    let targetBusinessId = business_id || null;
    if (requester.role !== 'support') {
      targetBusinessId = requester.business_id;
    }
    const sql = `INSERT INTO goals (business_id, amount, period_start, period_end, description, status) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [targetBusinessId || null, amount, period_start || null, period_end || null, description || null, status || 'active']);
    const [rows] = await pool.query('SELECT * FROM goals WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createGoal error', err);
    res.status(500).json({ message: err.message || 'Erro ao criar meta' });
  }
}

async function updateGoal(req, res) {
  try {
    await ensureTable();
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const [urows] = await pool.query('SELECT id, role, business_id FROM users WHERE id = ? LIMIT 1', [requesterId]);
    const requester = urows && urows.length ? urows[0] : null;
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const id = req.params.id;
    const { amount, period_start, period_end, description, status, business_id } = req.body || {};
    const fields = [];
    const params = [];
    if (amount != null) { fields.push('amount = ?'); params.push(amount); }
    if (period_start !== undefined) { fields.push('period_start = ?'); params.push(period_start || null); }
    if (period_end !== undefined) { fields.push('period_end = ?'); params.push(period_end || null); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description || null); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (business_id !== undefined) { fields.push('business_id = ?'); params.push(business_id); }
    if (!fields.length) return res.status(400).json({ message: 'Nada para atualizar' });
    if (requester.role !== 'support') {
      const [existing] = await pool.query('SELECT business_id FROM goals WHERE id = ? LIMIT 1', [id]);
      if (!existing || !existing.length) return res.status(404).json({ message: 'Meta não encontrada' });
      const row = existing[0];
      if (row.business_id != requester.business_id) return res.status(403).json({ message: 'Não autorizado para modificar esta meta' });
    }
    const sql = `UPDATE goals SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);
    await pool.query(sql, params);
    const [rows] = await pool.query('SELECT * FROM goals WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('updateGoal error', err);
    res.status(500).json({ message: err.message || 'Erro ao atualizar meta' });
  }
}

async function deleteGoal(req, res) {
  try {
    await ensureTable();
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const [urows] = await pool.query('SELECT id, role, business_id FROM users WHERE id = ? LIMIT 1', [requesterId]);
    const requester = urows && urows.length ? urows[0] : null;
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const id = req.params.id;
    if (requester.role !== 'support') {
      const [existing] = await pool.query('SELECT business_id FROM goals WHERE id = ? LIMIT 1', [id]);
      if (!existing || !existing.length) return res.status(404).json({ message: 'Meta não encontrada' });
      const row = existing[0];
      if (row.business_id != requester.business_id) return res.status(403).json({ message: 'Não autorizado para excluir esta meta' });
    }

    await pool.query('DELETE FROM goals WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('deleteGoal error', err);
    res.status(500).json({ message: err.message || 'Erro ao excluir meta' });
  }
}

module.exports = { listGoals, createGoal, updateGoal, deleteGoal };
