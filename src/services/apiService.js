
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import * as Device from 'expo-device';

// ========== CONFIGURAÇÕES ==========
// Coloque o IP do seu computador na rede local
// Para descobrir: ipconfig (Windows) ou ifconfig (Mac/Linux)
const SEU_BACKEND_URL = 'http://192.168.0.9:3000/api'; // Mude para seu IP
const MAKEUP_API_URL = 'https://makeup-api.herokuapp.com/api/v1/products.json';

// Instâncias do axios
const backendClient = axios.create({
  baseURL: SEU_BACKEND_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const makeupClient = axios.create({
  timeout: 10000,
});

// ========== VARIÁVEIS DE AUTENTICAÇÃO ==========
let authToken = null;

// ========== VERIFICAR CONEXÃO ==========
export const isOnline = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable !== false;
};

// ========== GERENCIAMENTO DE TOKEN ==========
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    backendClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete backendClient.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => authToken;

// Storage helpers
const saveTokenToStorage = async (token) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('@dezlumbrante_token', token);
  } catch (error) {
    console.error('Erro ao salvar token:', error);
  }
};

const saveUserToStorage = async (usuario) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('@dezlumbrante_usuario', JSON.stringify(usuario));
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
  }
};

const getTokenFromStorage = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('@dezlumbrante_token');
  } catch (error) {
    return null;
  }
};

const getUserFromStorage = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userStr = await AsyncStorage.getItem('@dezlumbrante_usuario');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};

const clearStorage = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem('@dezlumbrante_token');
    await AsyncStorage.removeItem('@dezlumbrante_usuario');
  } catch (error) {
    console.error('Erro ao limpar storage:', error);
  }
};

// Carregar token na inicialização
export const carregarTokenSalvo = async () => {
  const token = await getTokenFromStorage();
  if (token) {
    setAuthToken(token);
    return true;
  }
  return false;
};

export const getUsuarioSalvo = async () => {
  return await getUserFromStorage();
};

// ========== AUTENTICAÇÃO ==========

// Cadastro de usuário
export const cadastrarUsuario = async (dados) => {
  try {
    const response = await backendClient.post('/auth/cadastrar', dados);
    if (response.data.success && response.data.data?.token) {
      setAuthToken(response.data.data.token);
      await saveTokenToStorage(response.data.data.token);
      if (response.data.data.usuario) {
        await saveUserToStorage(response.data.data.usuario);
      }
    }
    return response.data;
  } catch (error) {
    console.error('Erro no cadastro:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Erro na conexão com o servidor' 
    };
  }
};

// Login
export const loginUsuario = async (email, senha, dispositivoId = null) => {
  try {
    const deviceId = dispositivoId || Device.osBuildId || 'web';
    const response = await backendClient.post('/auth/login', { 
      email, 
      senha, 
      dispositivo_id: deviceId 
    });
    
    if (response.data.success && response.data.data?.token) {
      setAuthToken(response.data.data.token);
      await saveTokenToStorage(response.data.data.token);
      if (response.data.data.usuario) {
        await saveUserToStorage(response.data.data.usuario);
      }
    }
    return response.data;
  } catch (error) {
    console.error('Erro no login:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Erro na conexão com o servidor' 
    };
  }
};

// Validar token
export const validarToken = async () => {
  try {
    const token = await getTokenFromStorage();
    if (!token) return { success: false };
    
    setAuthToken(token);
    const response = await backendClient.get('/auth/validar');
    return response.data;
  } catch (error) {
    setAuthToken(null);
    return { success: false };
  }
};

// Logout
export const logoutUsuario = async (todosDispositivos = false) => {
  try {
    const response = await backendClient.post('/auth/logout', { 
      todos_dispositivos: todosDispositivos 
    });
    setAuthToken(null);
    await clearStorage();
    return response.data;
  } catch (error) {
    console.error('Erro no logout:', error);
    setAuthToken(null);
    await clearStorage();
    return { success: false, error: error.message };
  }
};

// Recuperar senha
export const recuperarSenha = async (email) => {
  try {
    const response = await backendClient.post('/auth/recuperar-senha', { email });
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Erro na conexão' 
    };
  }
};

// Alterar senha
export const alterarSenha = async (senhaAtual, novaSenha) => {
  try {
    const response = await backendClient.put('/auth/alterar-senha', { 
      senha_atual: senhaAtual, 
      nova_senha: novaSenha 
    });
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Erro ao alterar senha' 
    };
  }
};



// Produtos - CRUD completo
export const getProdutosBackend = async (filtros = {}) => {
  try {
    const response = await backendClient.get('/produtos', { params: filtros });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produtos do backend:', error);
    if (error.response?.status === 401) {
      // Token expirado
      await logoutUsuario();
    }
    return { success: false, data: [], error: error.message };
  }
};

export const getProdutoBackendById = async (id) => {
  try {
    const response = await backendClient.get(`/produtos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    throw error;
  }
};

export const createProdutoBackend = async (produto) => {
  try {
    const response = await backendClient.post('/produtos', produto);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

export const updateProdutoBackend = async (id, produto) => {
  try {
    const response = await backendClient.put(`/produtos/${id}`, produto);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

export const deleteProdutoBackend = async (id) => {
  try {
    const response = await backendClient.delete(`/produtos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};

// Categorias
export const getCategoriasBackend = async () => {
  try {
    const response = await backendClient.get('/categorias');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return { success: false, data: [] };
  }
};

export const createCategoriaBackend = async (categoria) => {
  try {
    const response = await backendClient.post('/categorias', categoria);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

// ========== FUNÇÕES DA MAKEUP API (EXTERNA) ==========

const CATEGORIA_MAP = {
  Boca: 'lipstick',
  Olhos: 'eyeshadow',
  Pele: 'foundation',
  Rosto: 'foundation',
};

export const fetchProdutosMakeupAPI = async (categoria, forceRefresh = false) => {
  try {
    const online = await isOnline();
    
    if (!online && !forceRefresh) {
      console.log(`📱 Offline - Retornando dados locais da categoria: ${categoria}`);
      const db = require('./database').default;
      const produtosLocais = await db.getAllAsync(
        'SELECT * FROM produtos_api WHERE categoria = ?',
        [categoria]
      );
      
      if (produtosLocais.length > 0) {
        return produtosLocais;
      }
      throw new Error('Sem dados locais disponíveis');
    }

    const productType = CATEGORIA_MAP[categoria] || 'lipstick';
    const response = await makeupClient.get(`${MAKEUP_API_URL}?product_type=${productType}`);

    if (response.status !== 200) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const produtosFormatados = response.data.slice(0, 20).map((item) => ({
      id_api: item.id,
      nome: item.name || 'Sem nome',
      categoria,
      preco: 10.0,
      descricao: item.description
        ? item.description.replace(/<[^>]*>/g, '').trim().slice(0, 200)
        : `${item.brand || 'Marca'} - ${item.product_type || categoria}`,
      marca: item.brand || null,
      imagem: item.image_link || null,
      origem: 'api',
      ultima_sincronizacao: new Date().toISOString(),
    }));

    // Salva no banco local (cache)
    await salvarProdutosNoCache(produtosFormatados, categoria);
    
    return produtosFormatados;
  } catch (error) {
    console.error('Erro ao buscar produtos da Makeup API:', error);
    throw error;
  }
};

const salvarProdutosNoCache = async (produtos, categoria) => {
  const db = require('./database').default;
  
  await db.runAsync('DELETE FROM produtos_api WHERE categoria = ?', [categoria]);
  
  for (const produto of produtos) {
    await db.runAsync(
      `INSERT INTO produtos_api (
        id_api, nome, categoria, preco, descricao, 
        marca, imagem, origem, ultima_sincronizacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        produto.id_api,
        produto.nome,
        produto.categoria,
        produto.preco,
        produto.descricao,
        produto.marca,
        produto.imagem,
        produto.origem,
        produto.ultima_sincronizacao,
      ]
    );
  }
  
  console.log(`💾 ${produtos.length} produtos da categoria "${categoria}" salvos no cache`);
};

// ========== SINCRONIZAÇÃO ENTRE BACKEND E APP ==========

// Sincronizar produtos do app com o backend
export const syncAppToBackend = async (onProgress) => {
  try {
    const db = require('./database').default;
    const produtosLocais = await db.getAllProdutos();
    
    let sincronizados = 0;
    let erros = 0;
    
    for (const produto of produtosLocais) {
      try {
        // Verifica se já existe no backend
        const existing = await backendClient.get(`/produtos?search=${encodeURIComponent(produto.nome)}`);
        
        if (existing.data?.data?.length === 0) {
          // Produto novo - criar no backend
          await backendClient.post('/produtos', {
            nome: produto.nome,
            categoria: produto.categoria,
            preco: produto.preco,
            descricao: produto.descricao
          });
          sincronizados++;
          onProgress?.(`📤 Enviado: ${produto.nome}`);
        }
      } catch (error) {
        erros++;
        console.error(`Erro ao sincronizar produto ${produto.nome}:`, error);
        onProgress?.(`❌ Erro ao enviar: ${produto.nome}`);
      }
    }
    
    return { success: true, sincronizados, erros };
  } catch (error) {
    console.error('Erro na sincronização app->backend:', error);
    return { success: false, error: error.message };
  }
};

// Buscar produtos do backend para o app
export const syncBackendToApp = async (onProgress) => {
  try {
    const db = require('./database').default;
    const response = await backendClient.get('/produtos');
    
    if (response.data?.success && response.data.data) {
      let novos = 0;
      let atualizados = 0;
      
      for (const produto of response.data.data) {
        const exists = await db.getProdutoById(produto.id);
        if (!exists) {
          await db.createProduto(
            produto.nome,
            produto.categoria,
            produto.preco,
            produto.descricao
          );
          novos++;
          onProgress?.(`📥 Novo produto: ${produto.nome}`);
        } else if (exists.preco !== produto.preco || exists.descricao !== produto.descricao) {
          await db.updateProduto(
            produto.id,
            produto.nome,
            produto.categoria,
            produto.preco,
            produto.descricao
          );
          atualizados++;
          onProgress?.(`📝 Atualizado: ${produto.nome}`);
        }
      }
      
      return { success: true, novos, atualizados, total: response.data.data.length };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Erro ao buscar produtos do backend:', error);
    return { success: false, error: error.message };
  }
};

// Sincronização completa (backend + makeup API)
export const sincronizarTodosDados = async (onProgress) => {
  try {
    const online = await isOnline();
    if (!online) {
      throw new Error('⚠️ Sem conexão com internet');
    }

    // Verificar autenticação
    const tokenValido = await validarToken();
    if (!tokenValido.success) {
      throw new Error('Usuário não autenticado. Faça login novamente.');
    }

    let resultados = {
      enviados: 0,
      recebidos: 0,
      novos: 0,
      atualizados: 0,
      makeup: 0
    };

    // 1. Sincronizar com backend próprio (enviar)
    onProgress?.({ current: 1, total: 5, status: 'enviando', message: 'Enviando produtos para o servidor...' });
    const uploadResult = await syncAppToBackend(onProgress);
    resultados.enviados = uploadResult.sincronizados || 0;
    
    // 2. Sincronizar com backend próprio (receber)
    onProgress?.({ current: 2, total: 5, status: 'recebendo', message: 'Recebendo produtos do servidor...' });
    const downloadResult = await syncBackendToApp(onProgress);
    resultados.recebidos = downloadResult.total || 0;
    resultados.novos = downloadResult.novos || 0;
    resultados.atualizados = downloadResult.atualizados || 0;
    
    // 3. Buscar dados da Makeup API
    const categorias = ['Boca', 'Olhos', 'Pele', 'Rosto'];
    let totalMakeup = 0;
    
    for (let i = 0; i < categorias.length; i++) {
      const categoria = categorias[i];
      onProgress?.({
        current: i + 3,
        total: 5,
        categoria,
        status: 'makeup',
        message: `Buscando produtos de ${categoria} na Makeup API...`
      });
      
      const produtos = await fetchProdutosMakeupAPI(categoria, true);
      totalMakeup += produtos.length;
      
      onProgress?.({
        current: i + 3,
        total: 5,
        categoria,
        status: 'concluido',
        message: `${produtos.length} produtos de ${categoria} salvos`
      });
    }
    resultados.makeup = totalMakeup;
    
    // 4. Registrar timestamp da última sincronização
    const db = require('./database').default;
    await db.runAsync(
      'INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)',
      ['ultima_sincronizacao', new Date().toISOString()]
    );
    
    onProgress?.({ current: 5, total: 5, status: 'concluido', message: 'Sincronização concluída!' });
    
    console.log('✅ Sincronização completa realizada com sucesso');
    return { 
      success: true, 
      message: 'Dados sincronizados com sucesso!',
      resultados
    };
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    throw error;
  }
};

// Sincronização rápida (apenas backend)
export const sincronizarComBackend = async (mostrarProgresso = true, onProgress) => {
  try {
    const online = await isOnline();
    if (!online) {
      throw new Error('Sem conexão com internet');
    }

    const tokenValido = await validarToken();
    if (!tokenValido.success) {
      throw new Error('Usuário não autenticado');
    }

    // Enviar dados locais
    const uploadResult = await syncAppToBackend(onProgress);
    
    // Buscar dados do backend
    const downloadResult = await syncBackendToApp(onProgress);
    
    return {
      success: true,
      enviados: uploadResult.sincronizados || 0,
      recebidos: downloadResult.total || 0,
      novos: downloadResult.novos || 0,
      atualizados: downloadResult.atualizados || 0
    };
  } catch (error) {
    console.error('Erro na sincronização com backend:', error);
    throw error;
  }
};

// ========== FUNÇÕES UTILITÁRIAS ==========

// Verificar saúde do backend
export const checkBackendHealth = async () => {
  try {
    const response = await backendClient.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
};

// Obter informações do usuário logado
export const getUsuarioLogado = async () => {
  const usuario = await getUserFromStorage();
  return usuario;
};

// Verificar se usuário está autenticado
export const isAuthenticated = async () => {
  const token = await getTokenFromStorage();
  if (!token) return false;
  
  const validacao = await validarToken();
  return validacao.success;
};

export default {
  // Autenticação
  cadastrarUsuario,
  loginUsuario,
  logoutUsuario,
  validarToken,
  recuperarSenha,
  alterarSenha,
  carregarTokenSalvo,
  getUsuarioLogado,
  isAuthenticated,
  setAuthToken,
  
  // Backend CRUD
  backendClient,
  getProdutosBackend,
  getProdutoBackendById,
  createProdutoBackend,
  updateProdutoBackend,
  deleteProdutoBackend,
  getCategoriasBackend,
  createCategoriaBackend,
  
  // Makeup API
  fetchProdutosMakeupAPI,
  
  // Sincronização
  sincronizarTodosDados,
  sincronizarComBackend,
  syncAppToBackend,
  syncBackendToApp,
  
  // Utilitários
  checkBackendHealth,
  isOnline,
};