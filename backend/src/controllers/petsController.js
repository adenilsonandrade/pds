const pool = require('../db/database.js');

async function getRequesterInfo(userId) {
  const [rows] = await pool.query('SELECT id, role, business_id FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows && rows.length ? rows[0] : null;
}

exports.listPets = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });
    const { business_id: queryBusinessId } = req.query || {};

    if (requester.role === 'support') {
      let sql = `SELECT p.id, p.name, p.species, p.breed, p.age, p.weight, p.color, p.gender,
                p.customer_id, c.name AS customer_name, p.notes, p.vaccines, p.special_needs,
                p.business_id, b.brand_name AS business_name, p.created_at, p.updated_at
         FROM pets p
         LEFT JOIN customers c ON p.customer_id = c.id
         LEFT JOIN businesses b ON p.business_id = b.id`;
      const where = [];
      const params = [];
      if (queryBusinessId) {
        where.push('p.business_id = ?');
        params.push(queryBusinessId);
      }
      if (where.length) sql += ` WHERE ` + where.join(' AND ');
      sql += ` ORDER BY p.created_at DESC`;
      const [rows] = await pool.query(sql, params);
      return res.status(200).json(rows);
    }

    if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id) {
        return res.status(400).json({ message: 'Usuário não pertence a um business válido' });
      }
      const [rows] = await pool.query(
        `SELECT p.id, p.name, p.species, p.breed, p.age, p.weight, p.color, p.gender,
                p.customer_id, c.name AS customer_name, p.notes, p.vaccines, p.special_needs,
                p.business_id, b.brand_name AS business_name, p.created_at, p.updated_at
         FROM pets p
         LEFT JOIN customers c ON p.customer_id = c.id
         LEFT JOIN businesses b ON p.business_id = b.id
         WHERE p.business_id = ?
         ORDER BY p.created_at DESC`,
        [requester.business_id]
      );
      return res.status(200).json(rows);
    }

    return res.status(403).json({ message: 'Permissão negada' });
  } catch (err) {
    console.error('Error listing pets:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.getPet = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const petId = req.params.id;
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.species, p.breed, p.age, p.weight, p.color, p.gender,
              p.customer_id, c.name AS customer_name, p.notes, p.vaccines, p.special_needs,
              p.business_id, b.brand_name AS business_name, p.created_at, p.updated_at
       FROM pets p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN businesses b ON p.business_id = b.id
       WHERE p.id = ? LIMIT 1`,
      [petId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Pet não encontrado' });
    }

    const pet = rows[0];

    if (requester.role === 'support') {
      return res.status(200).json(pet);
    }

    if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id || pet.business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para visualizar este pet' });
      }
      return res.status(200).json(pet);
    }

    return res.status(403).json({ message: 'Permissão negada' });
  } catch (err) {
    console.error('Error getting pet:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.createPet = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const { name, species, breed, age, weight, color, gender, customer_id, notes, vaccines, special_needs, business_id } = req.body || {};

    if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });
    if (!species) return res.status(400).json({ message: 'Espécie é obrigatória' });

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
        return res.status(403).json({ message: 'Não autorizado para criar pet para outro business' });
      }
      finalBusinessId = requester.business_id;
    } else {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    if (customer_id) {
      const [customerRows] = await pool.query(
        'SELECT id, business_id FROM customers WHERE id = ? LIMIT 1',
        [customer_id]
      );
      if (!customerRows || customerRows.length === 0) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }
      if (customerRows[0].business_id !== finalBusinessId) {
        return res.status(400).json({ message: 'Cliente não pertence ao mesmo petshop' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO pets (name, species, breed, age, weight, color, gender, customer_id, notes, vaccines, special_needs, business_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        species,
        breed || null,
        age || null,
        weight || null,
        color || null,
        gender || null,
        customer_id || null,
        notes || null,
        vaccines !== undefined ? vaccines : true,
        special_needs || null,
        finalBusinessId
      ]
    );

    const newId = result.insertId;
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.species, p.breed, p.age, p.weight, p.color, p.gender,
              p.customer_id, c.name AS customer_name, p.notes, p.vaccines, p.special_needs,
              p.business_id, b.brand_name AS business_name, p.created_at, p.updated_at
       FROM pets p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN businesses b ON p.business_id = b.id
       WHERE p.id = ? LIMIT 1`,
      [newId]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating pet:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const petId = req.params.id;
    const { name, species, breed, age, weight, color, gender, customer_id, notes, vaccines, special_needs, business_id } = req.body || {};

    const [targetRows] = await pool.query(
      'SELECT id, business_id, customer_id FROM pets WHERE id = ? LIMIT 1',
      [petId]
    );
    if (!targetRows || targetRows.length === 0) {
      return res.status(404).json({ message: 'Pet não encontrado' });
    }
    const target = targetRows[0];

    if (requester.role === 'support') {
    } else if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id || target.business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para atualizar este pet' });
      }
      if (business_id && business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para transferir pet para outro business' });
      }
    } else {
      return res.status(403).json({ message: 'Permissão negada' });
    }

    if (customer_id && customer_id !== target.customer_id) {
      const [customerRows] = await pool.query(
        'SELECT id, business_id FROM customers WHERE id = ? LIMIT 1',
        [customer_id]
      );
      if (!customerRows || customerRows.length === 0) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }
      const finalBusinessId = business_id || target.business_id;
      if (customerRows[0].business_id !== finalBusinessId) {
        return res.status(400).json({ message: 'Cliente não pertence ao mesmo petshop' });
      }
    }

    const updates = [];
    const params = [];

    if (typeof name !== 'undefined') { updates.push('name = ?'); params.push(name); }
    if (typeof species !== 'undefined') { updates.push('species = ?'); params.push(species); }
    if (typeof breed !== 'undefined') { updates.push('breed = ?'); params.push(breed); }
    if (typeof age !== 'undefined') { updates.push('age = ?'); params.push(age); }
    if (typeof weight !== 'undefined') { updates.push('weight = ?'); params.push(weight); }
    if (typeof color !== 'undefined') { updates.push('color = ?'); params.push(color); }
    if (typeof gender !== 'undefined') { updates.push('gender = ?'); params.push(gender); }
    if (typeof customer_id !== 'undefined') { updates.push('customer_id = ?'); params.push(customer_id); }
    if (typeof notes !== 'undefined') { updates.push('notes = ?'); params.push(notes); }
    if (typeof vaccines !== 'undefined') { updates.push('vaccines = ?'); params.push(vaccines); }
    if (typeof special_needs !== 'undefined') { updates.push('special_needs = ?'); params.push(special_needs); }

    if (typeof business_id !== 'undefined' && requester.role === 'support') {
      updates.push('business_id = ?'); params.push(business_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    params.push(petId);
    const sql = `UPDATE pets SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await pool.query(sql, params);

    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.species, p.breed, p.age, p.weight, p.color, p.gender,
              p.customer_id, c.name AS customer_name, p.notes, p.vaccines, p.special_needs,
              p.business_id, b.brand_name AS business_name, p.created_at, p.updated_at
       FROM pets p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN businesses b ON p.business_id = b.id
       WHERE p.id = ? LIMIT 1`,
      [petId]
    );

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error updating pet:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const requesterId = req.user && req.user.sub;
    if (!requesterId) return res.status(401).json({ message: 'Não autenticado' });
    const requester = await getRequesterInfo(requesterId);
    if (!requester) return res.status(404).json({ message: 'Usuário solicitante não encontrado' });

    const petId = req.params.id;
    const [targetRows] = await pool.query(
      'SELECT id, business_id FROM pets WHERE id = ? LIMIT 1',
      [petId]
    );
    if (!targetRows || targetRows.length === 0) {
      return res.status(404).json({ message: 'Pet não encontrado' });
    }
    const target = targetRows[0];

    if (requester.role === 'support') {
      await pool.query('DELETE FROM pets WHERE id = ?', [petId]);
      return res.status(200).json({ message: 'Pet apagado com sucesso' });
    }

    if (requester.role === 'admin' || requester.role === 'user') {
      if (!requester.business_id || target.business_id !== requester.business_id) {
        return res.status(403).json({ message: 'Não autorizado para apagar este pet' });
      }
      await pool.query('DELETE FROM pets WHERE id = ?', [petId]);
      return res.status(200).json({ message: 'Pet apagado com sucesso' });
    }

    return res.status(403).json({ message: 'Permissão negada' });
  } catch (err) {
    console.error('Error deleting pet:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
