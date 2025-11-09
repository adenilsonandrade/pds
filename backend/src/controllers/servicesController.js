const pool = require('../db/database.js');
const businessController = require('./businessController.js');

async function getRequesterInfo(userId) {
  const [rows] = await pool.query('SELECT id, role, business_id FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows && rows.length ? rows[0] : null;
}

async function resolveBusinessId(requester, handle, bodyBusinessId) {
  const DEFAULT_BUSINESS_ID = process.env.DEFAULT_BUSINESS_ID || null;
  if (requester.role === 'support') {
    if (handle) {
      const b = await businessController.getBusinessIdByHandle(handle);
      if (!b) throw { status: 404, message: 'Business not found for handle' };
      return b;
    }
    if (bodyBusinessId) return bodyBusinessId;
    if (DEFAULT_BUSINESS_ID) return DEFAULT_BUSINESS_ID;
    throw { status: 400, message: 'Business id or handle is required' };
  } else if (requester.role === 'admin' || requester.role === 'user') {
    if (!requester.business_id) throw { status: 400, message: 'Usuário não pertence a um business válido' };
    if (bodyBusinessId && bodyBusinessId !== requester.business_id) throw { status: 403, message: 'Não autorizado' };
    return requester.business_id;
  }
  throw { status: 403, message: 'Permissão negada' };
}

exports.listServices = async (req, res) => {
  try {
    const handle = req.params.handle || null;
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const businessId = await resolveBusinessId(requester, handle, req.query.business_id);
    try {
      const [rows] = await pool.query('SELECT id, name, description, value, active FROM services WHERE business_id = ? ORDER BY name', [businessId]);
      return res.json(rows.map(r => ({ ...r, active: r.active !== undefined ? (r.active ? 1 : 0) : 1 })));
    } catch (e) {
      if (e && e.code === 'ER_BAD_FIELD_ERROR') {
        const [rows] = await pool.query('SELECT id, name, description, value FROM services WHERE business_id = ? ORDER BY name', [businessId]);
        return res.json(rows.map(r => ({ ...r, active: 1 })));
      }
      throw e;
    }
  } catch (error) {
    if (error && error.status) return res.status(error.status).json({ message: error.message });
    console.error('Error in listServices:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.createService = async (req, res) => {
  try {
    const handle = req.params.handle || null;
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const businessId = await resolveBusinessId(requester, handle, req.body.business_id);
    const { name, description, value, active } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome do serviço é obrigatório' });

    const [cols] = await pool.query("SHOW COLUMNS FROM services LIKE 'active'");
    const hasActive = !!(cols && cols.length);

    let result;
    if (hasActive) {
      [result] = await pool.query('INSERT INTO services (business_id, name, description, value, active) VALUES (?, ?, ?, ?, ?)', [businessId, name, description || null, (value !== undefined ? value : null), (active === undefined ? 1 : (active ? 1 : 0))]);
    } else {
      [result] = await pool.query('INSERT INTO services (business_id, name, description, value) VALUES (?, ?, ?, ?)', [businessId, name, description || null, (value !== undefined ? value : null)]);
    }
    const insertedId = result.insertId || result.insert_id || null;
    let rows;
    try {
      [rows] = await pool.query('SELECT id, name, description, value, active FROM services WHERE id = ? LIMIT 1', [insertedId]);
    } catch (e) {
      if (e && e.code === 'ER_BAD_FIELD_ERROR') {
        const [[r]] = await pool.query('SELECT id, name, description, value FROM services WHERE id = ? LIMIT 1', [insertedId]);
        return res.status(201).json({ id: r.id, name: r.name, description: r.description, value: r.value, active: 1 });
      }
      throw e;
    }
    return res.status(201).json(rows && rows.length ? rows[0] : { id: insertedId, name, description, value, active });
  } catch (error) {
    if (error && error.status) return res.status(error.status).json({ message: error.message });
    console.error('Error in createService:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const handle = req.params.handle || null;
    const serviceId = req.params.id;
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

  const businessId = await resolveBusinessId(requester, handle, req.body.business_id);
    const [existing] = await pool.query('SELECT id, business_id FROM services WHERE id = ? LIMIT 1', [serviceId]);
    if (!existing || existing.length === 0) return res.status(404).json({ message: 'Serviço não encontrado' });
    if (existing[0].business_id !== businessId) return res.status(403).json({ message: 'Não autorizado a modificar este serviço' });

    const { name, description, value, active } = req.body;
    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (value !== undefined) { updates.push('value = ?'); params.push(value); }
    if (active !== undefined) {
      const [cols] = await pool.query("SHOW COLUMNS FROM services LIKE 'active'");
      const hasActive = !!(cols && cols.length);
      if (hasActive) {
        updates.push('active = ?'); params.push(active ? 1 : 0);
      }
    }
    if (updates.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    params.push(serviceId);
    const sql = `UPDATE services SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, params);
    let rows;
    try {
      [rows] = await pool.query('SELECT id, name, description, value, active FROM services WHERE id = ? LIMIT 1', [serviceId]);
    } catch (e) {
      if (e && e.code === 'ER_BAD_FIELD_ERROR') {
        const [[r]] = await pool.query('SELECT id, name, description, value FROM services WHERE id = ? LIMIT 1', [serviceId]);
        return res.json({ id: r.id, name: r.name, description: r.description, value: r.value, active: 1 });
      }
      throw e;
    }
    return res.json(rows && rows.length ? rows[0] : {});
  } catch (error) {
    if (error && error.status) return res.status(error.status).json({ message: error.message });
    console.error('Error in updateService:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const handle = req.params.handle || null;
    const serviceId = req.params.id;
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const businessId = await resolveBusinessId(requester, handle, req.body && req.body.business_id);
    const [existing] = await pool.query('SELECT id, business_id FROM services WHERE id = ? LIMIT 1', [serviceId]);
    if (!existing || existing.length === 0) return res.status(404).json({ message: 'Serviço não encontrado' });
    if (existing[0].business_id !== businessId) return res.status(403).json({ message: 'Não autorizado a remover este serviço' });

    await pool.query('DELETE FROM services WHERE id = ?', [serviceId]);
    return res.status(204).send();
  } catch (error) {
    if (error && error.status) return res.status(error.status).json({ message: error.message });
    console.error('Error in deleteService:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
