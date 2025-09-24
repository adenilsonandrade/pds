const pool = require('../db/database.js');

const DEFAULT_BUSINESS_ID = process.env.DEFAULT_BUSINESS_ID || null;

async function getBusinessIdByHandle(handle) {
    if (!handle) return null;
    try {
        const [rowsHandle] = await pool.query('SELECT id FROM businesses WHERE handle = ? LIMIT 1', [handle]);
        if (rowsHandle && rowsHandle.length > 0) return rowsHandle[0].id;
    } catch (err) {
        if (err && err.code !== 'ER_BAD_FIELD_ERROR') {
            throw err;
        }
    }
    try {
        const [rowsDomain] = await pool.query('SELECT id FROM businesses WHERE custom_domain = ? LIMIT 1', [handle]);
        if (rowsDomain && rowsDomain.length > 0) return rowsDomain[0].id;
    } catch (err) {
        throw err;
    }
    return null;
}

exports.getBusinessIdByHandle = getBusinessIdByHandle;

exports.getBusinessInfo = async (req, res) => {
    const handle = req.params.handle || null;
    try {
        let businessId = null;
        if (handle) {
            businessId = await getBusinessIdByHandle(handle);
            if (!businessId) return res.status(404).json({ message: 'Business not found for handle' });
        } else if (DEFAULT_BUSINESS_ID) {
            businessId = DEFAULT_BUSINESS_ID;
        } else {
            return res.status(400).json({ message: 'Business handle is required' });
        }
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

exports.getServices = async (req, res) => {
    const handle = req.params.handle || null;
    try {
        let businessId = null;
        if (handle) {
            businessId = await getBusinessIdByHandle(handle);
            if (!businessId) return res.status(404).json({ message: 'Business not found for handle' });
        } else if (DEFAULT_BUSINESS_ID) {
            businessId = DEFAULT_BUSINESS_ID;
        } else {
            return res.status(400).json({ message: 'Business handle is required' });
        }
        const [rows] = await pool.query('SELECT id, name, description, value FROM services WHERE business_id = ?', [businessId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};