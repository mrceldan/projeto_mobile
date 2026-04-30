// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db = require('./database');

// Importar rotas
const produtosRoutes = require('./routes/produtos');
const categoriasRoutes = require('./routes/categorias');
const syncRoutes = require('./routes/sync');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rotas
app.use('/api/produtos', produtosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'Dezlumbrante API',
    version: '1.0.0',
    endpoints: {
      auth: {
        cadastrar: 'POST /api/auth/cadastrar',
        login: 'POST /api/auth/login',
        validar: 'GET /api/auth/validar',
        logout: 'POST /api/auth/logout',
        recuperar_senha: 'POST /api/auth/recuperar-senha',
        alterar_senha: 'PUT /api/auth/alterar-senha'
      },
      produtos: {
        listar: 'GET /api/produtos',
        buscar: 'GET /api/produtos/:id',
        criar: 'POST /api/produtos',
        atualizar: 'PUT /api/produtos/:id',
        deletar: 'DELETE /api/produtos/:id'
      },
      categorias: {
        listar: 'GET /api/categorias',
        criar: 'POST /api/categorias'
      },
      sync: {
        full: 'POST /api/sync/full',
        allData: 'GET /api/sync/all-data'
      }
    }
  });
});

// Inicializar servidor
async function startServer() {
  try {
    await db.openDb();
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║     🚀 SERVIDOR DEZLUMBRANTE RODANDO!                    ║
╠══════════════════════════════════════════════════════════╣
║  📡 URL: http://localhost:${PORT}                         ║
║  💚 Status: Online                                       ║
╠══════════════════════════════════════════════════════════╣
║  📱 ENDPOINTS DISPONÍVEIS:                               ║
║                                                          ║
║  🔐 AUTH:                                                ║
║     POST /api/auth/cadastrar     - Criar conta          ║
║     POST /api/auth/login         - Fazer login          ║
║     GET  /api/auth/validar       - Validar token        ║
║     POST /api/auth/logout        - Sair                 ║
║                                                          ║
║  📦 PRODUTOS:                                            ║
║     GET  /api/produtos           - Listar produtos      ║
║     POST /api/produtos           - Criar produto        ║
║     PUT  /api/produtos/:id       - Atualizar produto    ║
║     DELETE /api/produtos/:id     - Deletar produto      ║
║                                                          ║
║  🏷️  CATEGORIAS:                                         ║
║     GET  /api/categorias         - Listar categorias    ║
║     POST /api/categorias         - Criar categoria      ║
║                                                          ║
║  🔄 SYNC:                                                ║
║     POST /api/sync/full          - Sincronização total  ║
║     GET  /api/sync/all-data      - Buscar todos dados   ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
  }
}

startServer();