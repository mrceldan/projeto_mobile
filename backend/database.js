// backend/database.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');

let db;

async function openDb() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, 'database', 'dezlumbrante.db'),
      driver: sqlite3.Database
    });
    
    await initTables();
    console.log('✅ Banco de dados SQLite conectado');
  }
  return db;
}

async function initTables() {
  const database = await openDb();
  
  // Tabela de produtos
  await database.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      preco REAL NOT NULL,
      descricao TEXT,
      imagem TEXT,
      quantidade INTEGER DEFAULT 0,
      sync_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tabela de categorias
  await database.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT,
      cor TEXT,
      icone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tabela de usuários
  await database.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      telefone TEXT,
      endereco TEXT,
      data_nascimento TEXT,
      avatar TEXT,
      tipo TEXT DEFAULT 'cliente',
      status TEXT DEFAULT 'ativo',
      ultimo_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tabela de tokens/sessões
  await database.exec(`
    CREATE TABLE IF NOT EXISTS sessoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      dispositivo_id TEXT,
      expira_em DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);
  
  // Tabela de logs de sincronização
  await database.exec(`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      entidade TEXT NOT NULL,
      entidade_id INTEGER,
      acao TEXT NOT NULL,
      dados TEXT,
      dispositivo_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Inserir categorias padrão se não existirem
  const categoriasExistentes = await database.get('SELECT COUNT(*) as total FROM categorias');
  if (categoriasExistentes.total === 0) {
    await database.exec(`
      INSERT INTO categorias (nome, descricao, cor, icone) VALUES 
      ('Boca', 'Produtos para os lábios', '#E91E8C', '💄'),
      ('Olhos', 'Produtos para os olhos', '#9C27B0', '👁️'),
      ('Pele', 'Produtos para a pele', '#FF9800', '✨'),
      ('Rosto', 'Produtos para o rosto', '#4CAF50', '😊')
    `);
    console.log('📦 Categorias padrão inseridas');
  }
  
  console.log('📋 Tabelas do banco verificadas/criadas');
}

// ========== FUNÇÕES PARA PRODUTOS ==========
async function getProdutos(filtros = {}) {
  const database = await openDb();
  let query = 'SELECT * FROM produtos WHERE 1=1';
  const params = [];
  
  if (filtros.categoria) {
    query += ' AND categoria = ?';
    params.push(filtros.categoria);
  }
  
  if (filtros.search) {
    query += ' AND nome LIKE ?';
    params.push(`%${filtros.search}%`);
  }
  
  query += ' ORDER BY id DESC';
  
  return await database.all(query, params);
}

async function getProdutoById(id) {
  const database = await openDb();
  return await database.get('SELECT * FROM produtos WHERE id = ?', [id]);
}

async function createProduto(produto) {
  const database = await openDb();
  const result = await database.run(
    `INSERT INTO produtos (nome, categoria, preco, descricao, imagem, quantidade) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [produto.nome, produto.categoria, produto.preco, produto.descricao, produto.imagem, produto.quantidade || 0]
  );
  return await getProdutoById(result.lastID);
}

async function updateProduto(id, produto) {
  const database = await openDb();
  await database.run(
    `UPDATE produtos SET 
      nome = COALESCE(?, nome),
      categoria = COALESCE(?, categoria),
      preco = COALESCE(?, preco),
      descricao = COALESCE(?, descricao),
      imagem = COALESCE(?, imagem),
      quantidade = COALESCE(?, quantidade),
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [produto.nome, produto.categoria, produto.preco, produto.descricao, produto.imagem, produto.quantidade, id]
  );
  return await getProdutoById(id);
}

async function deleteProduto(id) {
  const database = await openDb();
  const result = await database.run('DELETE FROM produtos WHERE id = ?', [id]);
  return result.changes > 0;
}

// ========== FUNÇÕES PARA CATEGORIAS ==========
async function getCategorias() {
  const database = await openDb();
  return await database.all('SELECT * FROM categorias ORDER BY nome');
}

async function createCategoria(categoria) {
  const database = await openDb();
  const result = await database.run(
    'INSERT INTO categorias (nome, descricao, cor, icone) VALUES (?, ?, ?, ?)',
    [categoria.nome, categoria.descricao, categoria.cor, categoria.icone]
  );
  return await database.get('SELECT * FROM categorias WHERE id = ?', [result.lastID]);
}

// ========== FUNÇÕES DE AUTENTICAÇÃO ==========
function hashSenha(senha) {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

function gerarToken(usuarioId) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return crypto.createHash('sha256').update(`${usuarioId}-${timestamp}-${random}`).digest('hex');
}

function getDataExpiracao() {
  const data = new Date();
  data.setDate(data.getDate() + 7);
  return data.toISOString();
}

async function criarUsuario(usuario) {
  const database = await openDb();
  const senhaHash = hashSenha(usuario.senha);
  
  const result = await database.run(
    `INSERT INTO usuarios (nome, email, senha, telefone, endereco, data_nascimento, tipo, status) 
     VALUES (?, ?, ?, ?, ?, ?, 'cliente', 'ativo')`,
    [usuario.nome, usuario.email, senhaHash, usuario.telefone || null, usuario.endereco || null, usuario.data_nascimento || null]
  );
  
  const token = gerarToken(result.lastID);
  const expiracao = getDataExpiracao();
  
  await database.run(
    `INSERT INTO sessoes (usuario_id, token, expira_em) VALUES (?, ?, ?)`,
    [result.lastID, token, expiracao]
  );
  
  const novoUsuario = await database.get('SELECT id, nome, email, tipo FROM usuarios WHERE id = ?', [result.lastID]);
  
  return { usuario: novoUsuario, token, expira_em: expiracao };
}

async function loginUsuario(email, senha, dispositivoId) {
  const database = await openDb();
  
  const usuario = await database.get('SELECT * FROM usuarios WHERE email = ?', [email]);
  
  if (!usuario) return null;
  
  const senhaHash = hashSenha(senha);
  if (usuario.senha !== senhaHash) return null;
  
  if (usuario.status !== 'ativo') return null;
  
  const token = gerarToken(usuario.id);
  const expiracao = getDataExpiracao();
  
  if (dispositivoId) {
    await database.run(`DELETE FROM sessoes WHERE usuario_id = ? AND dispositivo_id = ?`, [usuario.id, dispositivoId]);
  }
  
  await database.run(
    `INSERT INTO sessoes (usuario_id, token, dispositivo_id, expira_em) VALUES (?, ?, ?, ?)`,
    [usuario.id, token, dispositivoId || null, expiracao]
  );
  
  await database.run(`UPDATE usuarios SET ultimo_login = ? WHERE id = ?`, [new Date().toISOString(), usuario.id]);
  
  delete usuario.senha;
  
  return { usuario, token, expira_em: expiracao };
}

async function validarToken(token) {
  const database = await openDb();
  
  const sessao = await database.get(
    `SELECT s.*, u.id as usuario_id, u.nome, u.email, u.tipo, u.status 
     FROM sessoes s
     JOIN usuarios u ON s.usuario_id = u.id
     WHERE s.token = ? AND s.expira_em > datetime('now')`,
    [token]
  );
  
  if (!sessao || sessao.status !== 'ativo') return null;
  
  return {
    usuario: {
      id: sessao.usuario_id,
      nome: sessao.nome,
      email: sessao.email,
      tipo: sessao.tipo
    }
  };
}

async function logoutUsuario(token, todosDispositivos = false) {
  const database = await openDb();
  
  if (todosDispositivos) {
    const sessao = await database.get('SELECT usuario_id FROM sessoes WHERE token = ?', [token]);
    if (sessao) {
      await database.run('DELETE FROM sessoes WHERE usuario_id = ?', [sessao.usuario_id]);
    }
  } else {
    await database.run('DELETE FROM sessoes WHERE token = ?', [token]);
  }
  
  return true;
}

// ========== FUNÇÕES DE LOG ==========
async function registrarLogSync(tipo, entidade, entidadeId, acao, dados, dispositivoId = null) {
  const database = await openDb();
  await database.run(
    `INSERT INTO sync_logs (tipo, entidade, entidade_id, acao, dados, dispositivo_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tipo, entidade, entidadeId, acao, JSON.stringify(dados), dispositivoId]
  );
}

module.exports = {
  openDb,
  getProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
  deleteProduto,
  getCategorias,
  createCategoria,
  criarUsuario,
  loginUsuario,
  validarToken,
  logoutUsuario,
  registrarLogSync
};