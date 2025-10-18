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
    const [rows] = await pool.query('SELECT id, name, description, value FROM services WHERE business_id = ? ORDER BY name', [businessId]);
    return res.json(rows);
  } catch (error) {
    if (error && error.status) return res.status(error.status).json({ message: error.message });
    console.error('Error in listServices:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
