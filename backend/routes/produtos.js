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

// LISTAR PRODUTOS (público)
router.get('/', async (req, res) => {
  try {
    const { categoria, search } = req.query;
    const produtos = await db.getProdutos({ categoria, search });
    res.json({
      success: true,
      data: produtos,
      total: produtos.length
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// BUSCAR PRODUTO POR ID (público)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await db.getProdutoById(id);
    
    if (!produto) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    
    res.json({ success: true, data: produto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CRIAR PRODUTO (requer login)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, categoria, preco, descricao, imagem, quantidade } = req.body;
    
    if (!nome || !categoria || !preco) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campos obrigatórios: nome, categoria, preco' 
      });
    }
    
    const novoProduto = await db.createProduto({
      nome, categoria, preco, descricao, imagem, quantidade
    });
    
    await db.registrarLogSync('create', 'produto', novoProduto.id, 'create', novoProduto, req.usuario?.id);
    
    res.status(201).json({ success: true, data: novoProduto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ATUALIZAR PRODUTO (requer login)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const produtoExistente = await db.getProdutoById(id);
    
    if (!produtoExistente) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    
    const produtoAtualizado = await db.updateProduto(id, req.body);
    await db.registrarLogSync('update', 'produto', id, 'update', produtoAtualizado, req.usuario?.id);
    
    res.json({ success: true, data: produtoAtualizado });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETAR PRODUTO (requer login)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const produtoExistente = await db.getProdutoById(id);
    
    if (!produtoExistente) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    
    await db.registrarLogSync('delete', 'produto', id, 'delete', produtoExistente, req.usuario?.id);
    await db.deleteProduto(id);
    
    res.json({ success: true, message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;