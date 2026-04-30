// backend/criar-admin.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');

async function criarAdmin() {
  const db = await open({
    filename: path.join(__dirname, 'database', 'dezlumbrante.db'),
    driver: sqlite3.Database
  });

  function hashSenha(senha) {
    return crypto.createHash('sha256').update(senha).digest('hex');
  }

  const senhaHash = hashSenha('admin123');
  
  try {
    // Verificar se admin já existe
    const existe = await db.get('SELECT id FROM usuarios WHERE email = ?', ['admin@dezlumbrante.com']);
    
    if (existe) {
      console.log('✅ Admin já existe!');
    } else {
      // Criar admin
      await db.run(
        `INSERT INTO usuarios (nome, email, senha, tipo, status) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Administrador', 'admin@dezlumbrante.com', senhaHash, 'admin', 'ativo']
      );
      console.log('✅ Admin criado com sucesso!');
      console.log('📧 Email: admin@dezlumbrante.com');
      console.log('🔑 Senha: admin123');
    }
    
    // Listar usuários
    const usuarios = await db.all('SELECT id, nome, email, tipo FROM usuarios');
    console.log('\n📋 Usuários cadastrados:');
    usuarios.forEach(u => {
      console.log(`   ${u.id} - ${u.nome} (${u.email}) - ${u.tipo}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.close();
  }
}

criarAdmin();