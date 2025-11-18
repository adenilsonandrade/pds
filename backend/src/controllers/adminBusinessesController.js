const pool = require('../db/database.js');

exports.listBusinesses = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const [r] = await pool.query('SELECT role FROM users WHERE id = ? LIMIT 1', [requesterId]);
    const requester = r && r.length ? r[0] : null;
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });
    if (!['support', 'admin'].includes(requester.role)) return res.status(403).json({ message: 'Permissão negada' });

    const [rows] = await pool.query('SELECT id, brand_name, contact_email, phone, custom_domain, location, maps_url, created_at FROM businesses');
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.createBusiness = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const [r] = await pool.query('SELECT role FROM users WHERE id = ? LIMIT 1', [requesterId]);
    const requester = r && r.length ? r[0] : null;
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });
    if (requester.role !== 'support') return res.status(403).json({ message: 'Permissão negada' });

    const { brand_name, contact_email, phone, custom_domain, location } = req.body || {};
    if (!brand_name || !contact_email) return res.status(400).json({ message: 'brand_name e contact_email são obrigatórios' });

    const mapsUrl = location ? `https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed` : null;

    const [result] = await pool.query('INSERT INTO businesses (id, brand_name, contact_email, phone, custom_domain, location, maps_url) VALUES (UUID(), ?, ?, ?, ?, ?, ?)', [brand_name, contact_email, phone || null, custom_domain || null, location || null, mapsUrl]);
    const [rows] = await pool.query('SELECT id, brand_name, contact_email, phone, custom_domain, location, maps_url, created_at FROM businesses WHERE id = ?', [result.insertId]);
    
    const [byEmail] = await pool.query('SELECT id, brand_name, contact_email, phone, custom_domain, location, maps_url, created_at FROM businesses WHERE contact_email = ? LIMIT 1', [contact_email]);
    return res.status(201).json(byEmail && byEmail.length ? byEmail[0] : {});
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const [r] = await pool.query('SELECT role FROM users WHERE id = ? LIMIT 1', [requesterId]);
    const requester = r && r.length ? r[0] : null;
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });
    if (!['support', 'admin'].includes(requester.role)) return res.status(403).json({ message: 'Permissão negada' });

    const id = req.params.id;
    const { brand_name, contact_email, phone, custom_domain, location } = req.body || {};
    const updates = [];
    const params = [];
    if (typeof brand_name !== 'undefined') { updates.push('brand_name = ?'); params.push(brand_name); }
    if (typeof contact_email !== 'undefined') { updates.push('contact_email = ?'); params.push(contact_email); }
    if (typeof phone !== 'undefined') { updates.push('phone = ?'); params.push(phone); }
    if (typeof custom_domain !== 'undefined') { updates.push('custom_domain = ?'); params.push(custom_domain); }
    if (typeof location !== 'undefined') {
      updates.push('location = ?'); params.push(location);
      const mapsForUpdate = location ? `https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed` : null;
      updates.push('maps_url = ?'); params.push(mapsForUpdate);
    }
    if (updates.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    params.push(id);
    const sql = `UPDATE businesses SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, params);
    const [rows] = await pool.query('SELECT id, brand_name, contact_email, phone, custom_domain, location, maps_url, created_at FROM businesses WHERE id = ? LIMIT 1', [id]);
    return res.status(200).json(rows && rows.length ? rows[0] : {});
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const [r] = await pool.query('SELECT role FROM users WHERE id = ? LIMIT 1', [requesterId]);
    const requester = r && r.length ? r[0] : null;
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });
    if (requester.role !== 'support') return res.status(403).json({ message: 'Permissão negada' });

    const id = req.params.id;
    await pool.query('DELETE FROM businesses WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Business apagado' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
