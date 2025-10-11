const pool = require('../db/database.js');
const businessController = require('./businessController.js');

const DEFAULT_BUSINESS_ID = process.env.DEFAULT_BUSINESS_ID || null;

exports.createAgendamento = async (req, res) => {
    
    const handle = req.params.handle || null;
    let businessId = null;
    try {
        if (handle) {
            businessId = await businessController.getBusinessIdByHandle(handle);
            if (!businessId) return res.status(404).json({ message: 'Business not found for handle' });
        } else if (DEFAULT_BUSINESS_ID) {
            businessId = DEFAULT_BUSINESS_ID;
        } else {
            return res.status(400).json({ message: 'Business handle is required' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    const {
        nomePet,
        especie,
        nomeCliente,
        telefone,
        servico: servicoNome,
        data,
        hora,
        observacoes
    } = req.body;
    try {
        let [customerRows] = await pool.query(
            'SELECT id FROM customers WHERE phone = ? AND business_id = ?',
            [telefone, businessId]
        );
        let customerId;
        if (customerRows.length > 0) {
            customerId = customerRows[0].id;
        } else {
            const [result] = await pool.query(
                'INSERT INTO customers (business_id, name, phone) VALUES (?, ?, ?)',
                [businessId, nomeCliente, telefone]
            );
            customerId = result.insertId;
        }
        let [petRows] = await pool.query(
            'SELECT id FROM pets WHERE name = ? AND customer_id = ? AND business_id = ?',
            [nomePet, customerId, businessId]
        );
        let petId;
        if (petRows.length > 0) {
            petId = petRows[0].id;
        } else {
            const [result] = await pool.query(
                'INSERT INTO pets (business_id, customer_id, name, species) VALUES (?, ?, ?, ?)',
                [businessId, customerId, nomePet, especie]
            );
            petId = result.insertId;
        }
        const [serviceRows] = await pool.query(
            'SELECT id FROM services WHERE name = ? AND business_id = ?',
            [servicoNome, businessId]
        );
        const serviceId = serviceRows.length > 0 ? serviceRows[0].id : null;
        const query = `
    INSERT INTO appointments (
        business_id, 
        customer_id, 
        pet_id, 
        service_id, 
        date, 
        time, 
        notes, 
        status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;
        const values = [
            businessId,
            customerId,
            petId,
            serviceId,
            data,
            hora,
            observacoes,
            'scheduled'
        ];
        await pool.query(query, values);
        res.status(201).json({ message: 'Agendamento criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};