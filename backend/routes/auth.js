const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token não fornecido' });
  }
  
  const usuario = await db.validarToken(token);
  
  if (!usuario) {
    return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
  }
  
  req.usuario = usuario.usuario;
  next();
};

// CADASTRO
router.post('/cadastrar', async (req, res) => {
  try {
    const { nome, email, senha, telefone, endereco, data_nascimento } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, error: 'Nome, email e senha são obrigatórios' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Email inválido' });
    }
    
    if (senha.length < 6) {
      return res.status(400).json({ success: false, error: 'Senha deve ter no mínimo 6 caracteres' });
    }
    
    const result = await db.criarUsuario({ nome, email, senha, telefone, endereco, data_nascimento });
    
    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, error: 'Email já cadastrado' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, senha, dispositivo_id } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
    }
    
    const result = await db.loginUsuario(email, senha, dispositivo_id);
    
    if (!result) {
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
    }
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// VALIDAR TOKEN
router.get('/validar', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    data: { usuario: req.usuario, token_valido: true }
  });
});

// LOGOUT
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { todos_dispositivos } = req.body;
    
    await db.logoutUsuario(token, todos_dispositivos);
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RECUPERAR SENHA
router.post('/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email é obrigatório' });
    }
    
    res.json({
      success: true,
      message: 'Se o email existir, enviaremos as instruções de recuperação'
    });
  } catch (error) {
    console.error('Erro na recuperação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ALTERAR SENHA
router.put('/alterar-senha', authMiddleware, async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    
    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ success: false, error: 'Senha atual e nova senha são obrigatórias' });
    }
    
    if (nova_senha.length < 6) {
      return res.status(400).json({ success: false, error: 'Nova senha deve ter no mínimo 6 caracteres' });
    }
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;