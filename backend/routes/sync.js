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

// Sincronização em massa (enviar dados do app para o backend)
router.post('/full', authMiddleware, async (req, res) => {
  try {
    const { produtos, categorias, dispositivo_id } = req.body;
    let produtosAtualizados = 0;
    let produtosInseridos = 0;
    let erros = [];
    
    // Sincronizar produtos
    if (produtos && Array.isArray(produtos)) {
      for (const produto of produtos) {
        try {
          const existente = await db.getProdutoById(produto.id);
          
          if (existente) {
            await db.updateProduto(produto.id, produto);
            produtosAtualizados++;
          } else {
            await db.createProduto(produto);
            produtosInseridos++;
          }
          
          await db.registrarLogSync('sync', 'produto', produto.id || 0, 'sync', produto, dispositivo_id || req.usuario?.id);
        } catch (error) {
          erros.push({ produto: produto.nome, error: error.message });
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        produtos_inseridos: produtosInseridos,
        produtos_atualizados: produtosAtualizados,
        erros: erros
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buscar todos os dados para sincronização inicial
router.get('/all-data', authMiddleware, async (req, res) => {
  try {
    const produtos = await db.getProdutos();
    const categorias = await db.getCategorias();
    
    res.json({
      success: true,
      data: {
        produtos,
        categorias,
        ultima_sync: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;