const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.set('trust proxy', true);
const port = process.env.PORT || 3001;
const pool = require('./db/database.js');
const agendamentoRoutes = require('./routes/agendamentoRoutes.js');
const businessRoutes = require('./routes/businessRoutes.js');
app.use(cors());
app.use(express.json());
app.use('/api', (req, res, next) => {
    try {
        const logEntry = {
            time: new Date().toISOString(),
            method: req.method,
            path: req.originalUrl,
            ip: req.ip,
            headers: {
                host: req.headers.host,
                'x-forwarded-for': req.headers['x-forwarded-for'] || null,
                'content-type': req.headers['content-type'] || null
            },
            body: req.body || null
        };
        fs.appendFileSync(path.join(__dirname, '../server.log'), JSON.stringify(logEntry) + '\n');
    } catch (err) {
        console.error('Request log error:', err.message);
    }
    next();
});
app.get('/api', (req, res) => {
    res.send('API do PetShop funcionando!');
});
app.get('/api/db-test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.status(200).json({
            message: 'Conexão com o banco de dados bem-sucedida!',
            solution: rows[0].solution
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Erro ao conectar com o banco de dados.',
            error: error.message
        });
    }
});
app.use('/api/agendamentos-publicos', agendamentoRoutes);
app.use('/api/business', businessRoutes);
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port} (env=${process.env.NODE_ENV || 'development'})`);
});
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
