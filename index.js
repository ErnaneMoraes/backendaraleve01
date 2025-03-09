const express = require('express');
const cors = require('cors');
const meuAPP = express();
const { connectDB, pool } = require('./db');
require('dotenv').config();

const PORT = process.env.PORT || 8080;

meuAPP.use(cors()); // Adicionado para permitir requisições do frontend
meuAPP.use(express.json());
meuAPP.use(express.urlencoded({ extended: true }));

connectDB();

meuAPP.get("/", (req, res) => {
  res.send("Olá mundo");
});

meuAPP.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tb_usuario");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

meuAPP.get("/desc", async (req, res) => {
  try {
    const [rows] = await pool.query("DESCRIBE tb_usuario;");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

meuAPP.post("/login", async (req, res) => {
  // Verificando se os dados estão no corpo da requisição
  const { LOGIN, SENHA } = req.body;
  console.log(req.body);  // Verifique o conteúdo da requisição

  try {
    const [rows] = await pool.query(
      "SELECT * FROM tb_usuario WHERE LOGIN = ? AND SENHA = ?",
      [LOGIN, SENHA]  // Certifique-se de que 'LOGIN' e 'SENHA' estão sendo passados corretamente
    );

    if (rows.length > 0) {
      res.status(200).json({ sucesso: true, mensagem: "Login efetuado com sucesso!" });
    } else {
      res.status(401).json({ sucesso: false, mensagem: "Usuário ou senha inválidos" });
    }
  } catch (err) {
    console.error("Erro na autenticação:", err);
    res.status(500).json({ sucesso: false, mensagem: "Erro no servidor" });
  }
});



meuAPP.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} http://localhost:8080/`);
});
