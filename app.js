const express = require('express');
const cors = require('cors');
const meuAPP = express();
const { connectDB, pool } = require('./database');
const { router: loginRouter, verifyJWT } = require('./src/models/login');
const statusRouter = require('./src/models/status'); 
const estoqueRoutes = require('./estoqueRoutes');
const itemRoutes = require('./itemRoutes'); 
const usuarioRoutes = require('./usuarioRoutes');
const bodyParser = require('body-parser');

const path = require('path');

require('dotenv').config();

const PORT = process.env.PORT || 8080;

meuAPP.use(cors()); // Adicionado para permitir requisições do frontend
meuAPP.use(express.json());
meuAPP.use(express.urlencoded({ extended: true }));

connectDB();

//Alteração Luan

// Middlewares
meuAPP.use(cors());
meuAPP.use(bodyParser.json());

// Rotas
meuAPP.use('/api', usuarioRoutes);

const pedidoRoutes = require('./pedidoRoutes');

// Middlewares
meuAPP.use(cors());
meuAPP.use(bodyParser.json());

// Rotas
meuAPP.use('/pedidos', pedidoRoutes);


// Middlewares
meuAPP.use(cors());
meuAPP.use(bodyParser.json());

meuAPP.use('/estoque', estoqueRoutes);



meuAPP.use('/sistema', verifyJWT, express.static(path.join(__dirname, 'sistema_aralev-master')));

// Rota para buscar usuários
meuAPP.get("/usuarios", verifyJWT, async (req, res) => {
//meuAPP.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tb_usuario");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).send("Erro ao buscar usuário");
  }
});

meuAPP.post("/usuarios", verifyJWT, async (req, res) => {
//meuAPP.post("/usuarios", async (req, res) => {
  const { nome, login, senha, nivelAcesso } = req.body;
  const Usuario = require('./src/models/usuario');
  const user = new Usuario();
  const resultado = await user.criarUsuario(nome, login, senha, nivelAcesso);

  if (resultado.erro) {
    // Se o erro for login duplicado
    if (resultado.erro === "Login já está em uso") {
      return res.status(409).json({ mensagem: resultado.erro });
    }

    // Outros erros
    return res.status(500).json({ mensagem: resultado.erro, detalhe: resultado.detalhe });
  }

  // Sucesso
  res.status(201).json({ sucesso: true, id: resultado.id });
});

meuAPP.delete("/usuarios/:id", verifyJWT, async (req, res) => {
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

meuAPP.put("/usuarios/:id", async (req, res) => {
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






meuAPP.get("/inicio", verifyJWT, (req, res) => {
  res.redirect("http://127.0.0.1:5500/sistema_aralev-master/inicio.html");
});

const { router: verifyTokenRouter } = require("./src/models/login");
meuAPP.use(verifyTokenRouter);


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
meuAPP.use('/login', loginRouter); 


meuAPP.use('/logout', loginRouter); 

meuAPP.use(statusRouter); 

meuAPP.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} http://localhost:${PORT}/`);
});


meuAPP.use(cors());
meuAPP.use(bodyParser.json());

// Rotas
meuAPP.use('/api/itens', itemRoutes); // Rotas para itens
meuAPP.use('/api/estoque', estoqueRoutes); // Suas rotas existentes

