const express = require('express');
<<<<<<< HEAD
const app = express();
const port = 3001; // Usamos 3001 para não conflitar com o React
=======
const path = require('path');
const app = express();
const port = 3001;
const pool = require('./database'); // Adicione esta linha
>>>>>>> 94e29c4 (Initial commit for the pds project)

// Middleware para parsear JSON
app.use(express.json());

<<<<<<< HEAD
// Rota de teste
app.get('/', (req, res) => {
  res.send('API do PetShop funcionando!');
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
=======
// Middleware para servir os arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

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

// Rota curinga para servir o index.html em qualquer rota do frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
>>>>>>> 94e29c4 (Initial commit for the pds project)
