const express = require('express');
const app = express();
const port = 3001; // Usamos 3001 para não conflitar com o React

// Middleware para parsear JSON
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do PetShop funcionando!');
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});