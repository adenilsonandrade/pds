const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3001;
const pool = require('./db/database.js'); 

const agendamentoRoutes = require('./routes/agendamentoRoutes.js');
const businessRoutes = require('./routes/businessRoutes.js'); // <-- Nova importação

// Middleware para parsear JSON e CORS
app.use(cors());
app.use(express.json());

// Rota de teste da API
app.get('/api', (req, res) => {
    res.send('API do PetShop funcionando!');
});

// Nova rota para testar a conexão com o banco de dados
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

// Rotas da API
app.use('/api/agendamentos-publicos', agendamentoRoutes);
app.use('/api/business', businessRoutes); // <-- Nova rota

// Serve arquivos estáticos da pasta `dist` do frontend. 
// Esta linha deve ser a ÚLTIMA rota.
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});