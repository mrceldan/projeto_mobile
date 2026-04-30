// backend/controllers/categoriaController.js
const db = require('../database');

exports.listarCategorias = async (req, res) => {
  try {
    const categorias = await db.getCategorias();
    res.json({ success: true, data: categorias });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.criarCategoria = async (req, res) => {
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
};