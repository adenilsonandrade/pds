const pool = require('../db/database.js');
const businessController = require('./businessController.js');

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
    if (bodyBusinessId && bodyBusinessId !== requester.business_id) throw { status: 403, message: 'Não autorizado para criar agendamento para outro business' };
    return requester.business_id;
  }
  throw { status: 403, message: 'Permissão negada' };
}

exports.listAppointments = async (req, res) => {
  try {
    const handle = req.params.handle || null;
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const { start_date, end_date, date } = req.query;
    let qStart = null;
    let qEnd = null;
    if (start_date && end_date) {
      qStart = String(start_date).substring(0, 10);
      qEnd = String(end_date).substring(0, 10);
    } else if (date) {
      qStart = String(date).substring(0, 10);
      qEnd = qStart;
    } else {

      const today = new Date().toISOString().substring(0, 10);
      qStart = today; qEnd = today;
    }

    const businessId = await resolveBusinessId(requester, handle, req.query.business_id);

    const sql = `SELECT a.id, a.date, a.time, a.status, c.name AS customer_name, p.name AS pet_name,
      s.id AS service_id, s.name AS service_name, s.value AS price, s.description AS service_description
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.business_id = ? AND DATE(a.date) BETWEEN ? AND ?
      ORDER BY a.date, a.time`;

    const [rows] = await pool.query(sql, [businessId, qStart, qEnd]);
    return res.json(rows);
  } catch (error) {
    if (error && error.status) return res.status(error.status).json({ message: error.message });
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '../../appointments_errors.log');
      const entry = {
        time: new Date().toISOString(),
        route: 'listAppointments',
        error: error && error.stack ? error.stack : String(error),
        user: req.user || null,
        query: req.query || null
      };
      fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error('Failed to write appointments error log', e);
    }
    console.error('Error in listAppointments:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.createAppointment = async (req, res) => {
  const handle = req.params.handle || null;
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const {
      petName,
      species,
      customerName,
      phone,
      service,
      date,
      time,
      notes,
      business_id: bodyBusinessId,
      petId: bodyPetId,
      customerId: bodyCustomerId
    } = req.body || {};

    const businessId = await resolveBusinessId(requester, handle, bodyBusinessId);

    let customerId = null;
    let petId = null;
    if (bodyPetId) {
      const [petRows] = await pool.query('SELECT id, customer_id, business_id FROM pets WHERE id = ? LIMIT 1', [bodyPetId]);
      if (!petRows || petRows.length === 0) return res.status(404).json({ message: 'Pet não encontrado' });
      const petRow = petRows[0];
      if (String(petRow.business_id) !== String(businessId)) {
        return res.status(403).json({ message: 'Pet não pertence a este business' });
      }
      petId = petRow.id;
      customerId = petRow.customer_id;
    } else if (bodyCustomerId) {
      const [custRows] = await pool.query('SELECT id FROM customers WHERE id = ? AND business_id = ? LIMIT 1', [bodyCustomerId, businessId]);
      if (!custRows || custRows.length === 0) return res.status(404).json({ message: 'Cliente não encontrado' });
      customerId = bodyCustomerId;
      if (!petName) return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
      const [petRows] = await pool.query('SELECT id FROM pets WHERE name = ? AND customer_id = ? AND business_id = ?', [petName, customerId, businessId]);
      if (petRows.length > 0) petId = petRows[0].id;
      else {
        const [r] = await pool.query('INSERT INTO pets (business_id, customer_id, name, species) VALUES (?, ?, ?, ?)', [businessId, customerId, petName, species]);
        petId = r.insertId;
      }
    } else {
      if (!petName || !customerName || !phone || !date || !time) {
        return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
      }

      let [customerRows] = await pool.query('SELECT id FROM customers WHERE phone = ? AND business_id = ?', [phone, businessId]);
      if (customerRows.length > 0) {
        customerId = customerRows[0].id;
      } else {
        const [result] = await pool.query('INSERT INTO customers (business_id, name, phone) VALUES (?, ?, ?)', [businessId, customerName, phone]);
        customerId = result.insertId;
      }

      let [petRows] = await pool.query('SELECT id FROM pets WHERE name = ? AND customer_id = ? AND business_id = ?', [petName, customerId, businessId]);
      if (petRows.length > 0) {
        petId = petRows[0].id;
      } else {
        const [result] = await pool.query('INSERT INTO pets (business_id, customer_id, name, species) VALUES (?, ?, ?, ?)', [businessId, customerId, petName, species]);
        petId = result.insertId;
      }
    }

    let serviceId = null;
    let serviceValue = null;
    if (service) {
      const [serviceRows] = await pool.query('SELECT id, value FROM services WHERE name = ? AND business_id = ?', [service, businessId]);
      if (serviceRows && serviceRows.length > 0) {
        serviceId = serviceRows[0].id;
        serviceValue = serviceRows[0].value;
      }
    }

  const insertQuery = `INSERT INTO appointments (business_id, customer_id, pet_id, service_id, date, time, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [businessId, customerId, petId, serviceId, date, time, notes || null, 'scheduled'];
    await pool.query(insertQuery, values);
  return res.status(201).json({ message: 'Agendamento criado com sucesso!' });
  } catch (error) {
    if (error && error.status) return res.status(error.status).json({ message: error.message });
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '../../appointments_errors.log');
      const entry = {
        time: new Date().toISOString(),
        route: 'createAppointment',
        error: error && error.stack ? error.stack : String(error),
        user: req.user || null,
        query: req.query || null,
        body: req.body || null
      };
      fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error('Failed to write appointments error log', e);
    }
    console.error('Error in createAppointment:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { status, price, time, date, notes } = req.body;
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const [rows] = await pool.query('SELECT id, business_id FROM appointments WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Agendamento não encontrado' });
    const appointment = rows[0];

    if (requester.role === 'support') {
    } else if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id || appointment.business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para atualizar este agendamento' });
      }
    } else {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    const updates = [];
    const params = [];
    if (status) { updates.push('status = ?'); params.push(status); }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (time) { updates.push('time = ?'); params.push(time); }
    if (date) { updates.push('date = ?'); params.push(date); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
    params.push(id);
    const query = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, params);
    return res.json({ message: 'Appointment updated' });
  } catch (error) {
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '../../appointments_errors.log');
      const entry = {
        time: new Date().toISOString(),
        route: 'updateAppointment',
        error: error && error.stack ? error.stack : String(error),
        user: req.user || null,
        query: req.query || null,
        body: req.body || null,
        params: req.params || null
      };
      fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error('Failed to write appointments error log', e);
    }
    console.error('Error in updateAppointment:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
