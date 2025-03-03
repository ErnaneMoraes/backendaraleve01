require('dotenv').config(); // Carrega as variáveis do .env

const express = require('express');
const meuAPP = express();
const { connectDB, sql } = require('./db'); // Importa a função de conexão
const PORT = process.env.PORT || 8080; // Defina a porta corretamente

connectDB();

meuAPP.get("/", function (req, res) {
  res.send("Olá mundo");
});

meuAPP.get("/usuarios", async (req, res) => {
  try {
    const result = await new sql.Request().query("SELECT * FROM tb_usuario");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

meuAPP.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
