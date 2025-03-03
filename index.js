var express = require("express");
var meuAPP = express();
var { connectDB, sql } = require("./db"); // Agora importando corretamente

connectDB();

meuAPP.get("/", function (req, res) {
  res.send("Olá mundo");
});

// Rota para consultar usuários
meuAPP.get("/usuarios", async (req, res) => {
  try {
    const result = await new sql.Request().query("SELECT * FROM tb_usuario");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

meuAPP.listen(8080, () => {
  console.log("Servidor rodando na porta 8080");
});
