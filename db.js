require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Obrigatório para Azure
    enableArithAbort: true,
  },
};

async function connectDB() {
  try {
    await sql.connect(config);
    console.log("Conectado ao banco de dados com sucesso!");
  } catch (err) {
    console.error("Erro ao conectar no banco de dados:", err);
  }
}

module.exports = { connectDB, sql };

