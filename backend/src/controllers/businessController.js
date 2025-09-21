const pool = require('../db/database.js');

// Controller para buscar informações do negócio e seus serviços
exports.getBusinessInfo = async (req, res) => {
    const businessId = 'b212c40c-333d-4c3e-8f55-1f9e20a44f2d'; 

    console.log('Fetching business info for UUID:', businessId); // <-- LINHA DE DIAGNÓSTICO

    try {
        const [rows] = await pool.query('SELECT brand_name, phone, contact_email, custom_domain, logo_url, location, maps_url FROM businesses WHERE id = ?', [businessId]);
        
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Business not found' });
        }
    } catch (error) {
        console.error('Error fetching business info:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller para buscar todos os serviços de um negócio
exports.getServices = async (req, res) => {
    // Nota: O businessId virá do seu middleware de autenticação
    const businessId = 'b212c40c-333d-4c3e-8f55-1f9e20a44f2d';

    try {
        const [rows] = await pool.query('SELECT id, name, description, value FROM services WHERE business_id = ?', [businessId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};