
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('dezlumbrante.db');


db.execSync(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    preco REAL NOT NULL,
    descricao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS produtos_api (
    id_api INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    preco REAL NOT NULL,
    descricao TEXT,
    marca TEXT,
    imagem TEXT,
    origem TEXT DEFAULT 'api',
    ultima_sincronizacao DATETIME,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_produtos_api_categoria ON produtos_api(categoria);
  CREATE INDEX IF NOT EXISTS idx_produtos_api_id_api ON produtos_api(id_api);
`);

export const initDatabase = async () => {
  console.log('✅ Banco de dados Dezlumbrante pronto (com suporte a sincronização)');
  return true;
};



export const getAllProdutos = async () => {
  try {
    const result = await db.getAllAsync('SELECT * FROM produtos ORDER BY id DESC');
    return result;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

export const getProdutoById = async (id) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );
    return result;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    throw error;
  }
};

export const createProduto = async (nome, categoria, preco, descricao) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO produtos (nome, categoria, preco, descricao) VALUES (?, ?, ?, ?)',
      [nome, categoria, preco, descricao || null]
    );
    return {
      id: result.lastInsertRowId,
      nome,
      categoria,
      preco,
      descricao,
    };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

export const updateProduto = async (id, nome, categoria, preco, descricao) => {
  try {
    const result = await db.runAsync(
      'UPDATE produtos SET nome = ?, categoria = ?, preco = ?, descricao = ? WHERE id = ?',
      [nome, categoria, preco, descricao || null, id]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

export const deleteProduto = async (id) => {
  try {
    const result = await db.runAsync(
      'DELETE FROM produtos WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};

export const clearAllProdutos = async () => {
  try {
    await db.runAsync('DELETE FROM produtos');
    console.log('Todos os produtos foram removidos');
    return true;
  } catch (error) {
    console.error('Erro ao limpar produtos:', error);
    throw error;
  }
};

export const getProdutosAPILocais = async (categoria = null) => {
  try {
    let query = 'SELECT * FROM produtos_api';
    const params = [];
    
    if (categoria) {
      query += ' WHERE categoria = ?';
      params.push(categoria);
    }
    
    query += ' ORDER BY nome';
    
    return await db.getAllAsync(query, params);
  } catch (error) {
    console.error('Erro ao buscar produtos da API:', error);
    return [];
  }
};

export const limparCacheAPI = async () => {
  try {
    await db.runAsync('DELETE FROM produtos_api');
    console.log('🧹 Cache da API limpo');
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    throw error;
  }
};

export const getUltimaSincronizacao = async () => {
  try {
    const result = await db.getFirstAsync(
      'SELECT valor FROM config WHERE chave = ?',
      ['ultima_sincronizacao']
    );
    return result?.valor || null;
  } catch (error) {
    console.error('Erro ao buscar última sincronização:', error);
    return null;
  }
};

export default db;



export const getAllProdutosWithSync = async () => {
  try {
    const result = await db.getAllAsync(`
      SELECT p.*, 
             pa.id_api as sync_id,
             pa.sync_status 
      FROM produtos p
      LEFT JOIN produtos_sync pa ON p.id = pa.produto_local_id
      ORDER BY p.id DESC
    `);
    return result;
  } catch (error) {
    console.error('Erro ao buscar produtos com sync:', error);
    return [];
  }
};

export const createProdutoWithSync = async (produto) => {
  try {
    // Insere no banco local
    const result = await db.runAsync(
      'INSERT INTO produtos (nome, categoria, preco, descricao) VALUES (?, ?, ?, ?)',
      [produto.nome, produto.categoria, produto.preco || 10, produto.descricao]
    );
    
    const novoProduto = {
      id: result.lastInsertRowId,
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco || 10,
      descricao: produto.descricao,
      sync_status: 'pending' 
    };
    
 
    await db.runAsync(
      `INSERT INTO produtos_sync (produto_local_id, sync_status, created_at) 
       VALUES (?, 'pending', ?)`,
      [result.lastInsertRowId, new Date().toISOString()]
    );
    
    return novoProduto;
  } catch (error) {
    console.error('Erro ao criar produto com sync:', error);
    throw error;
  }
};

export const updateProdutoWithSync = async (id, produto) => {
  try {
    await db.runAsync(
      'UPDATE produtos SET nome = ?, categoria = ?, preco = ?, descricao = ? WHERE id = ?',
      [produto.nome, produto.categoria, produto.preco, produto.descricao, id]
    );
    

    const existing = await db.getFirstAsync(
      'SELECT * FROM produtos_sync WHERE produto_local_id = ?',
      [id]
    );
    
    if (existing) {
      await db.runAsync(
        'UPDATE produtos_sync SET sync_status = "pending", updated_at = ? WHERE produto_local_id = ?',
        [new Date().toISOString(), id]
      );
    } else {
      await db.runAsync(
        `INSERT INTO produtos_sync (produto_local_id, sync_status, created_at) 
         VALUES (?, 'pending', ?)`,
        [id, new Date().toISOString()]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar produto com sync:', error);
    throw error;
  }
};

export const deleteProdutoWithSync = async (id) => {
  try {
   
    await db.runAsync(
      `INSERT OR REPLACE INTO produtos_sync (produto_local_id, sync_status, sync_action, updated_at) 
       VALUES (?, 'pending', 'delete', ?)`,
      [id, new Date().toISOString()]
    );
    

    await db.runAsync('DELETE FROM produtos WHERE id = ?', [id]);
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar produto com sync:', error);
    throw error;
  }
};


export const getPendingSyncProdutos = async () => {
  try {
    const result = await db.getAllAsync(`
      SELECT ps.*, p.* 
      FROM produtos_sync ps
      JOIN produtos p ON ps.produto_local_id = p.id
      WHERE ps.sync_status = 'pending'
    `);
    return result;
  } catch (error) {
    console.error('Erro ao buscar produtos pendentes:', error);
    return [];
  }
};

export const markAsSynced = async (produtoLocalId) => {
  try {
    await db.runAsync(
      'UPDATE produtos_sync SET sync_status = "synced", synced_at = ? WHERE produto_local_id = ?',
      [new Date().toISOString(), produtoLocalId]
    );
    return true;
  } catch (error) {
    console.error('Erro ao marcar como sincronizado:', error);
    return false;
  }
};


export const createSyncTables = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS produtos_sync (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_local_id INTEGER NOT NULL,
        sync_id INTEGER,
        sync_status TEXT DEFAULT 'pending',
        sync_action TEXT DEFAULT 'create',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        synced_at DATETIME,
        FOREIGN KEY (produto_local_id) REFERENCES produtos(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_produtos_sync_status ON produtos_sync(sync_status);
      CREATE INDEX IF NOT EXISTS idx_produtos_sync_local_id ON produtos_sync(produto_local_id);
    `);
    console.log('✅ Tabelas de sincronização criadas');
  } catch (error) {
    console.error('Erro ao criar tabelas de sync:', error);
  }
};