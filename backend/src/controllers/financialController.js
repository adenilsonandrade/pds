const pool = require('../db/database.js');
const businessController = require('./businessController');

const DEFAULT_BUSINESS_ID = process.env.DEFAULT_BUSINESS_ID || null;

async function getRequesterInfo(userId) {
  const [rows] = await pool.query('SELECT id, role, business_id FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows && rows.length ? rows[0] : null;
}

async function resolveBusinessId(requester, handle, bodyBusinessId) {
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
    if (bodyBusinessId && bodyBusinessId !== requester.business_id) throw { status: 403, message: 'Não autorizado para este business' };
    return requester.business_id;
  }
  throw { status: 403, message: 'Permissão negada' };
}

exports.getFinancialOverview = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const handle = req.query.handle || null;
    const businessId = await resolveBusinessId(requester, handle, req.query.business_id);

    const start = req.query.start_date ? String(req.query.start_date).substring(0,10) : null;
    const end = req.query.end_date ? String(req.query.end_date).substring(0,10) : null;
    let qStart = start; let qEnd = end;
    if (!qStart || !qEnd) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth()+1).padStart(2,'0');
      qStart = `${y}-${m}-01`;
      const lastDay = new Date(y, now.getMonth()+1, 0).getDate();
      qEnd = `${y}-${m}-${String(lastDay).padStart(2,'0')}`;
    }

    const sql = `SELECT f.id AS financial_id, f.appointment_id, f.amount, f.type, f.date AS financial_date, f.status AS financial_status, f.description AS financial_description, a.status AS appointment_status, c.name AS client_name, p.name AS pet_name, s.id AS service_id, s.name AS service_name
      FROM financial f
      LEFT JOIN appointments a ON f.appointment_id = a.id
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE f.business_id = ? AND DATE(f.date) BETWEEN ? AND ?
      ORDER BY f.date DESC LIMIT 500`;

    const [rows] = await pool.query(sql, [businessId, qStart, qEnd]);

    let totalrevenue = 0;
    let totalExpenses = 0;
    const byStatus = { confirmed: 0, received: 0, pending: 0 };
    const serviceMap = {};
    const recent = [];
    let includedRevenueCount = 0;

    for (const r of rows) {
      const value = r.amount !== null && r.amount !== undefined ? Number(r.amount) : 0;
      const status = (r.financial_status || r.appointment_status || 'pending').toLowerCase();

      if (status === 'canceled') {
        recent.push({
          id: r.financial_id,
          appointment_id: r.appointment_id,
          date: r.financial_date,
          description: r.service_name ? `${r.service_name} - ${r.pet_name || '-'} ` : (r.service_name || '-'),
          service: r.service_name || '-',
          client: r.client_name || '-',
          pet: r.pet_name || '-',
          amount: value,
          status: status,
          type: (r.type && String(r.type).toLowerCase() === 'expense') ? 'expense' : 'revenue'
        });
        continue;
      }

      if (r.type && String(r.type).toLowerCase() === 'expense') {
        totalExpenses += value;
          recent.push({
            id: r.financial_id,
            appointment_id: r.appointment_id,
            date: r.financial_date,
            description: (r.financial_description && String(r.financial_description).trim().length) ? r.financial_description : (r.service_name ? `${r.service_name} - ${r.pet_name || '-'} ` : (r.service_name || '-')),
            service: r.service_name || '-',
            client: r.client_name || '-',
            pet: r.pet_name || '-',
            amount: value,
            status: status,
            type: 'expense'
          });
      } else {
        totalrevenue += value;
        includedRevenueCount += 1;
        if (status === 'confirmed') byStatus.confirmed += value;
        else if (status === 'received') byStatus.received += value;
        else if (status === 'pending' || status === 'scheduled') byStatus.pending += value;

        const sid = r.service_id || 'none';
        const sname = r.service_name || (sid === 'none' ? 'Sem serviço' : `Serviço ${sid}`);
        if (!serviceMap[sid]) serviceMap[sid] = { name: sname, total: 0 };
        serviceMap[sid].total += value;

        recent.push({
          id: r.financial_id,
          appointment_id: r.appointment_id,
          date: r.financial_date,
          description: r.service_name ? `${r.service_name} - ${r.pet_name || '-'} ` : (r.service_name || '-'),
          service: r.service_name || '-',
          client: r.client_name || '-',
          pet: r.pet_name || '-',
          amount: value,
          status: status,
          type: 'revenue'
        });
      }
    }

    const serviceList = Object.keys(serviceMap).map(k => ({ name: serviceMap[k].name, value: serviceMap[k].total }));

    const totalExpensesComputed = totalExpenses;
    const netRevenue = totalrevenue - totalExpensesComputed;
    const ticketAvg = includedRevenueCount > 0 ? (totalrevenue / includedRevenueCount) : 0;

    return res.json({
      totalrevenue,
      totalExpenses: totalExpensesComputed,
      netRevenue,
      ticketAvg,
      confirmedRevenue: byStatus.confirmed,
      receivedRevenue: byStatus.received,
      pendingRevenue: byStatus.pending,
      revenueByService: serviceList,
      recentTransactions: recent.slice(0,50)
    });
  } catch (error) {
    console.error('Error in financial overview:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.createFinancial = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const handle = req.query.handle || null;
    const businessId = await resolveBusinessId(requester, handle, req.body.business_id);

    const amount = req.body.amount != null ? Number(req.body.amount) : null;
    const type = req.body.type ? String(req.body.type).toLowerCase() : 'revenue';
    const date = req.body.date ? String(req.body.date).substring(0,10) : (new Date()).toISOString().substring(0,10);
    const status = req.body.status ? String(req.body.status).toLowerCase() : 'pending';
    const description = req.body.description ? String(req.body.description) : null;
    const appointmentId = req.body.appointment_id || null;

    if (amount == null || Number.isNaN(amount)) return res.status(400).json({ message: 'amount is required and must be a number' });
    if (!['revenue','expense'].includes(type)) return res.status(400).json({ message: 'type must be revenue or expense' });

    const [result] = await pool.query('INSERT INTO financial (business_id, appointment_id, amount, type, date, status, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [businessId, appointmentId, amount, type, date, status, description]);
    const insertedId = result.insertId;
    const [rows] = await pool.query('SELECT * FROM financial WHERE id = ? LIMIT 1', [insertedId]);
    return res.status(201).json(rows && rows.length ? rows[0] : { id: insertedId });
  } catch (error) {
    console.error('Error creating financial record:', error);
    return res.status(500).json({ message: 'Erro ao criar registro financeiro.' });
  }
};

exports.updateFinancial = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const handle = req.query.handle || null;
    const businessId = await resolveBusinessId(requester, handle, req.body.business_id);

    const id = req.params.id;
    const [existing] = await pool.query('SELECT * FROM financial WHERE id = ? LIMIT 1', [id]);
    if (!existing || !existing.length) return res.status(404).json({ message: 'Registro financeiro não encontrado' });
    const row = existing[0];
    if (row.business_id != businessId) return res.status(403).json({ message: 'Não autorizado para modificar este registro' });

    const updates = [];
    const params = [];
    if (req.body.amount != null) { updates.push('amount = ?'); params.push(Number(req.body.amount)); }
    if (req.body.type) { updates.push('type = ?'); params.push(String(req.body.type)); }
    if (req.body.date) { updates.push('date = ?'); params.push(String(req.body.date).substring(0,10)); }
    if (req.body.status) { updates.push('status = ?'); params.push(String(req.body.status)); }
    if (req.body.description != null) { updates.push('description = ?'); params.push(String(req.body.description)); }

    if (updates.length === 0) return res.status(400).json({ message: 'Nenhuma propriedade para atualizar' });

    params.push(id);
    const sql = `UPDATE financial SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, params);
    const [rows] = await pool.query('SELECT * FROM financial WHERE id = ? LIMIT 1', [id]);
    return res.json(rows && rows.length ? rows[0] : {});
  } catch (error) {
    console.error('Error updating financial record:', error);
    return res.status(500).json({ message: 'Erro ao atualizar registro financeiro.' });
  }
};
