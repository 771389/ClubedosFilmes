const express = require('express');
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

// URL base do seu domínio
const BASE_URL = 'https://ed331.vercel.app';

// Chave secreta para autenticação
const SECRET_KEY = process.env.SECRET_KEY || 'androidx&clubedosfilmes';

// Lista fixa de ícones esperados
const iconNames = ['1', '2', '3', 'bem', 'config', 'info', 'off', 'trocar'];

// Middleware para interpretar JSON
app.use(express.json());

// Middleware de autenticação
const authMiddleware = expressJwt({
  secret: SECRET_KEY,
  algorithms: ['HS256']
}).unless({ path: ['/login'] });

// Rota de login para obter o token
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (usuario === 'vitor' && senha === 'spazio3132') {
    const token = jwt.sign({ usuario }, SECRET_KEY, { expiresIn: '1h' });

    return res.json({ token });
  }

  return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
});

// 🔐 Rota protegida que retorna um JSON no formato {"nome_do_icone": "link"}
app.get('/icons/lista', authMiddleware, (req, res) => {
  const iconsDir = path.join(__dirname, 'icons');

  fs.readdir(iconsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao listar os ícones.' });
    }

    const iconsList = {};

    // Garante que só os ícones da lista fixa serão incluídos
    iconNames.forEach(icon => {
      const file = files.find(f => path.parse(f).name === icon);
      if (file) {
        iconsList[icon] = `${BASE_URL}/icons/${file}`;
      }
    });

    res.json(iconsList);
  });
});

// Middleware para tratar erros de autenticação
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ erro: 'Token inválido ou não fornecido.' });
  }
  next(err);
});

// Inicia o servidor
app.listen(port, () => console.log(`Servidor rodando em ${BASE_URL}`));
