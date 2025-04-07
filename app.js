const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { connectDB, pool } = require('./database');
const { router: loginRouter, verifyJWT, router: verifyTokenRouter } = require('./src/models/login');
const statusRouter = require('./src/models/status');
const usuarioRoutes = require('./usuarioRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const estoqueRoutes = require('./estoqueRoutes');
const itemRoutes = require('./itemRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Conexão com o banco de dados
connectDB();

// CORS — configuração única e correta
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true
}));

app.options('*', cors()); // Suporte a preflight

// Middlewares globais
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rotas protegidas e públicas
app.use('/api', usuarioRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/api/itens', itemRoutes);
app.use('/api/estoque', estoqueRoutes);

// Rota protegida para o sistema (acesso a arquivos estáticos)
app.use('/sistema', verifyJWT, express.static(path.join(__dirname, 'sistema_aralev-master')));

// Rotas diretas
app.get("/usuarios", verifyJWT, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tb_usuario");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).send("Erro ao buscar usuários");
  }
});

app.post("/usuarios", verifyJWT, async (req, res) => {
  const { nome, login, senha, nivelAcesso } = req.body;
  const Usuario = require('./src/models/usuario');
  const user = new Usuario();
  const resultado = await user.criarUsuario(nome, login, senha, nivelAcesso);

  if (resultado.erro) {
    if (resultado.erro === "Login já está em uso") {
      return res.status(409).json({ mensagem: resultado.erro });
    }
    return res.status(500).json({ mensagem: resultado.erro, detalhe: resultado.detalhe });
  }

  res.status(201).json({ sucesso: true, id: resultado.id });
});

app.delete("/usuarios/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const Usuario = require('./src/models/usuario');
  const user = new Usuario();

  try {
    const resultado = await user.excluirUsuario(id);

    if (resultado.sucesso) {
      return res.status(200).json({ sucesso: true, mensagem: "Usuário excluído com sucesso." });
    } else {
      return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado." });
    }
  } catch (erro) {
    console.error("Erro ao excluir usuário:", erro);
    return res.status(500).json({ sucesso: false, mensagem: "Erro interno ao excluir o usuário." });
  }
});

app.put("/usuarios/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const { nome, login, senha, nivelAcesso } = req.body;

  if (!nome || !login) {
    return res.status(400).json({ sucesso: false, mensagem: "Preencha todos os campos corretamente." });
  }

  const Usuario = require('./src/models/usuario');
  const user = new Usuario();

  try {
    const resultado = await user.atualizarUsuario(id, { nome, login, senha, nivelAcesso });

    if (resultado.sucesso) {
      return res.status(200).json({ sucesso: true, mensagem: "Usuário atualizado com sucesso." });
    } else {
      return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado." });
    }
  } catch (erro) {
    console.error("Erro ao atualizar usuário:", erro);
    return res.status(500).json({ sucesso: false, mensagem: "Erro interno ao atualizar o usuário." });
  }
});

app.get("/desc", async (req, res) => {
  try {
    const [rows] = await pool.query("DESCRIBE tb_usuario;");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar descrição da tabela:", err);
    res.status(500).send("Erro ao buscar descrição da tabela");
  }
});

// Redirecionamento local para testes
app.get("/inicio", verifyJWT, (req, res) => {
  res.redirect("http://127.0.0.1:5500/sistema_aralev-master/inicio.html");
});

// Autenticação
app.use('/login', loginRouter);
app.use('/logout', loginRouter);
app.use(verifyTokenRouter);

// Status da API
app.use(statusRouter);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} http://localhost:${PORT}/`);
});
