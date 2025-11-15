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

    // date range
    const start = req.query.start_date ? String(req.query.start_date).substring(0,10) : null;
    const end = req.query.end_date ? String(req.query.end_date).substring(0,10) : null;
    let qStart = start; let qEnd = end;
    if (!qStart || !qEnd) {
      // default: current month
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth()+1).padStart(2,'0');
      qStart = `${y}-${m}-01`;
      const lastDay = new Date(y, now.getMonth()+1, 0).getDate();
      qEnd = `${y}-${m}-${String(lastDay).padStart(2,'0')}`;
    }

    // fetch appointments with service info
    const sql = `SELECT a.id, a.date, a.time, a.status, c.name AS client_name, p.name AS pet_name, s.id AS service_id, s.name AS service_name, s.value AS service_value
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.business_id = ? AND DATE(a.date) BETWEEN ? AND ?
      ORDER BY a.date DESC, a.time DESC LIMIT 500`;

    const [rows] = await pool.query(sql, [businessId, qStart, qEnd]);

    // compute totals
    let totalIncome = 0;
    let totalExpenses = 0; // no expenses table; keep 0 for now
    const byStatus = { confirmed: 0, received: 0, pending: 0 };
    const serviceMap = {}; // id -> { name, total }
    const recent = [];

    for (const r of rows) {
      const value = r.service_value !== null && r.service_value !== undefined ? Number(r.service_value) : 0;
      const status = (r.status || 'scheduled').toLowerCase();
      totalIncome += value;
      if (status === 'confirmed') byStatus.confirmed += value;
      else if (status === 'received') byStatus.received += value;
      else if (status === 'pending' || status === 'scheduled') byStatus.pending += value;

      const sid = r.service_id || 'none';
      const sname = r.service_name || (sid === 'none' ? 'Sem serviço' : `Serviço ${sid}`);
      if (!serviceMap[sid]) serviceMap[sid] = { name: sname, total: 0 };
      serviceMap[sid].total += value;

      recent.push({
        id: r.id,
        date: r.date,
        description: r.service_name ? `${r.service_name} - ${r.pet_name || '-'} ` : (r.service_name || '-'),
        service: r.service_name || '-',
        client: r.client_name || '-',
        pet: r.pet_name || '-',
        amount: value,
        status: status,
        type: 'income'
      });
    }

    const serviceList = Object.keys(serviceMap).map(k => ({ name: serviceMap[k].name, value: serviceMap[k].total }));

    const totalExpensesComputed = totalExpenses;
    const netRevenue = totalIncome - totalExpensesComputed;
    const ticketAvg = rows.length > 0 ? (totalIncome / rows.length) : 0;

    return res.json({
      totalIncome,
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
