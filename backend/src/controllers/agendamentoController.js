const pool = require('../db/database.js');

exports.createAgendamento = async (req, res) => {
    // Nota: Em produção, o business_id virá de um middleware do token.
    const businessId = 'b212c40c-333d-4c3e-8f55-1f9e20a44f2d';

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
        // --- 1. Encontrar ou criar o cliente ---
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

        // --- 2. Encontrar ou criar o pet ---
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

        // --- 3. Encontrar o ID do serviço ---
        const [serviceRows] = await pool.query(
            'SELECT id FROM services WHERE name = ? AND business_id = ?',
            [servicoNome, businessId]
        );
        const serviceId = serviceRows.length > 0 ? serviceRows[0].id : null;

        // --- 4. Inserir o agendamento ---
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
            'scheduled' // <-- Valor para a coluna `status`
        ];

        await pool.query(query, values);

        res.status(201).json({ message: 'Agendamento criado com sucesso!' });

    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};