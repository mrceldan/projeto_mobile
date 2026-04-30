// backend/controllers/authController.js
const db = require('../database');
const crypto = require('crypto');

// Função para gerar hash da senha
function hashSenha(senha) {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

// Função para gerar token
function gerarToken(usuarioId) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return crypto.createHash('sha256').update(`${usuarioId}-${timestamp}-${random}`).digest('hex');
}

// Função para calcular expiração (7 dias)
function getDataExpiracao() {
  const data = new Date();
  data.setDate(data.getDate() + 7);
  return data.toISOString();
}

// CADASTRO DE USUÁRIO
exports.cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, telefone, endereco, data_nascimento } = req.body;
    
    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome, email e senha são obrigatórios' 
      });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email inválido' 
      });
    }
    
    if (senha.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Senha deve ter no mínimo 6 caracteres' 
      });
    }
    
    const database = await db.openDb();
    
    // Verificar se email já existe
    const usuarioExistente = await database.get(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (usuarioExistente) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email já cadastrado' 
      });
    }
    
    // Criar usuário
    const senhaHash = hashSenha(senha);
    const result = await database.run(
      `INSERT INTO usuarios (nome, email, senha, telefone, endereco, data_nascimento, tipo, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'cliente', 'ativo')`,
      [nome, email, senhaHash, telefone || null, endereco || null, data_nascimento || null]
    );
    
    // Gerar token para login automático
    const token = gerarToken(result.lastID);
    const expiracao = getDataExpiracao();
    
    await database.run(
      `INSERT INTO sessoes (usuario_id, token, expira_em) VALUES (?, ?, ?)`,
      [result.lastID, token, expiracao]
    );
    
    // Registrar sincronização inicial
    await database.run(
      `INSERT INTO usuario_sync (usuario_id, ultima_sincronizacao) VALUES (?, ?)`,
      [result.lastID, new Date().toISOString()]
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      data: {
        usuario: {
          id: result.lastID,
          nome,
          email,
          tipo: 'cliente'
        },
        token,
        expira_em: expiracao
      }
    });
    
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, senha, dispositivo_id } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email e senha são obrigatórios' 
      });
    }
    
    const database = await db.openDb();
    
    // Buscar usuário
    const usuario = await database.get(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email ou senha incorretos' 
      });
    }
    
    // Verificar senha
    const senhaHash = hashSenha(senha);
    if (usuario.senha !== senhaHash) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email ou senha incorretos' 
      });
    }
    
    // Verificar status do usuário
    if (usuario.status !== 'ativo') {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuário inativo. Entre em contato com o suporte.' 
      });
    }
    
    // Gerar novo token
    const token = gerarToken(usuario.id);
    const expiracao = getDataExpiracao();
    
    // Invalidar tokens antigos do mesmo dispositivo (opcional)
    if (dispositivo_id) {
      await database.run(
        `DELETE FROM sessoes WHERE usuario_id = ? AND dispositivo_id = ?`,
        [usuario.id, dispositivo_id]
      );
    }
    
    // Criar nova sessão
    await database.run(
      `INSERT INTO sessoes (usuario_id, token, dispositivo_id, expira_em) VALUES (?, ?, ?, ?)`,
      [usuario.id, token, dispositivo_id || null, expiracao]
    );
    
    // Atualizar último login
    await database.run(
      `UPDATE usuarios SET ultimo_login = ? WHERE id = ?`,
      [new Date().toISOString(), usuario.id]
    );
    
    // Remover senha do retorno
    delete usuario.senha;
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        usuario,
        token,
        expira_em: expiracao
      }
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// VALIDAR TOKEN
exports.validarToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token não fornecido' });
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
      return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
    }
    
    if (sessao.status !== 'ativo') {
      return res.status(401).json({ success: false, error: 'Usuário inativo' });
    }
    
    res.json({
      success: true,
      data: {
        usuario: {
          id: sessao.usuario_id,
          nome: sessao.nome,
          email: sessao.email,
          tipo: sessao.tipo
        },
        token_valido: true
      }
    });
    
  } catch (error) {
    console.error('Erro na validação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { todos_dispositivos } = req.body;
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }
    
    const database = await db.openDb();
    
    if (todos_dispositivos) {
      // Buscar usuário pelo token
      const sessao = await database.get(
        'SELECT usuario_id FROM sessoes WHERE token = ?',
        [token]
      );
      
      if (sessao) {
        // Remover todas as sessões do usuário
        await database.run(
          'DELETE FROM sessoes WHERE usuario_id = ?',
          [sessao.usuario_id]
        );
      }
    } else {
      // Remover apenas a sessão atual
      await database.run('DELETE FROM sessoes WHERE token = ?', [token]);
    }
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// RECUPERAR SENHA (esqueci minha senha)
exports.recuperarSenha = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email é obrigatório' });
    }
    
    const database = await db.openDb();
    
    const usuario = await database.get(
      'SELECT id, nome, email FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (!usuario) {
      // Por segurança, não informamos que o email não existe
      return res.json({
        success: true,
        message: 'Se o email existir, enviaremos as instruções de recuperação'
      });
    }
    
    // Aqui você implementaria o envio de email
    // Por enquanto, retornamos um token temporário para teste
    
    const tokenTemp = gerarToken(usuario.id);
    const expiracao = new Date();
    expiracao.setHours(expiracao.getHours() + 1);
    
    await database.run(
      `INSERT INTO sessoes (usuario_id, token, expira_em) VALUES (?, ?, ?)`,
      [usuario.id, tokenTemp, expiracao.toISOString()]
    );
    
    res.json({
      success: true,
      message: 'Token de recuperação gerado (em produção, enviaríamos por email)',
      token_temp: tokenTemp // Apenas para testes
    });
    
  } catch (error) {
    console.error('Erro na recuperação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ALTERAR SENHA
exports.alterarSenha = async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    const usuario_id = req.usuario_id; // Vindo do middleware de autenticação
    
    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Senha atual e nova senha são obrigatórias' 
      });
    }
    
    if (nova_senha.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nova senha deve ter no mínimo 6 caracteres' 
      });
    }
    
    const database = await db.openDb();
    
    const usuario = await database.get(
      'SELECT senha FROM usuarios WHERE id = ?',
      [usuario_id]
    );
    
    const senhaAtualHash = hashSenha(senha_atual);
    if (usuario.senha !== senhaAtualHash) {
      return res.status(401).json({ 
        success: false, 
        error: 'Senha atual incorreta' 
      });
    }
    
    const novaSenhaHash = hashSenha(nova_senha);
    await database.run(
      'UPDATE usuarios SET senha = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [novaSenhaHash, usuario_id]
    );
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};