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

// LISTAR CATEGORIAS (público)
router.get('/', async (req, res) => {
  try {
    const categorias = await db.getCategorias();
    res.json({ success: true, data: categorias });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CRIAR CATEGORIA (requer login)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, descricao, cor, icone } = req.body;
    
    if (!nome) {
      return res.status(400).json({ success: false, error: 'Nome da categoria é obrigatório' });
    }
    
    const novaCategoria = await db.createCategoria({ nome, descricao, cor, icone });
    res.status(201).json({ success: true, data: novaCategoria });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;