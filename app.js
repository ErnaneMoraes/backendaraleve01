const express = require('express');
const cors = require('cors');
const meuAPP = express();
const { connectDB, pool } = require('./database');
const loginRouter = require('./src/models/login');  // Importa o router de login
const statusRouter = require('./src/models/status');  // Importa o router de status

require('dotenv').config();

const PORT = process.env.PORT || 8080;

meuAPP.use(cors()); // Adicionado para permitir requisições do frontend
meuAPP.use(express.json());
meuAPP.use(express.urlencoded({ extended: true }));

connectDB();

// Rota principal
meuAPP.get("/", (req, res) => {
  res.send("Olá mundo");
});

// Rota para buscar usuários
meuAPP.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tb_usuario");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

// Rota para descrição da tabela
meuAPP.get("/desc", async (req, res) => {
  try {
    const [rows] = await pool.query("DESCRIBE tb_usuario;");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

// Usando o router de login para a rota /login
meuAPP.use('/login', loginRouter); // Agora usa o router para a autenticação

// Usando o router de status para a rota /status
meuAPP.use(statusRouter); // Agora usa o router de status

meuAPP.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} http://localhost:8080/`);
});
