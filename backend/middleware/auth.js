// backend/middleware/auth.js
const db = require('../database');

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token não fornecido' 
      });
    }
    
    const database = await db.openDb();
    
    const sessao = await database.get(
      `SELECT s.*, u.id as usuario_id, u.nome, u.email, u.tipo, u.status 
       FROM sessoes s
       JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.token = ? AND s.expira_em > datetime('now')`,
      [token]
    );
    
    if (!sessao) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido ou expirado' 
      });
    }
    
    if (sessao.status !== 'ativo') {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuário inativo' 
      });
    }
    
    req.usuario_id = sessao.usuario_id;
    req.usuario = {
      id: sessao.usuario_id,
      nome: sessao.nome,
      email: sessao.email,
      tipo: sessao.tipo
    };
    
    next();
    
  } catch (error) {
    console.error('Erro no middleware de auth:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = authMiddleware;