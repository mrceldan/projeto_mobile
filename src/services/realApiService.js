
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';

// Substitua pelo IP do seu computador na rede local
// Para descobrir: ipconfig (Windows) ou ifconfig (Mac/Linux)
const BASE_URL = 'http://SEU_IP:3000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} - ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

export const isOnline = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable !== false;
};


export const getProdutos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams(filtros).toString();
    const response = await apiClient.get(`/produtos${params ? `?${params}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

export const getProdutoById = async (id) => {
  try {
    const response = await apiClient.get(`/produtos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    throw error;
  }
};

export const createProduto = async (produto) => {
  try {
    const response = await apiClient.post('/produtos', produto);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

export const updateProduto = async (id, produto) => {
  try {
    const response = await apiClient.put(`/produtos/${id}`, produto);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

export const deleteProduto = async (id) => {
  try {
    const response = await apiClient.delete(`/produtos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};

// ========== CATEGORIAS ==========
export const getCategorias = async () => {
  try {
    const response = await apiClient.get('/categorias');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const createCategoria = async (categoria) => {
  try {
    const response = await apiClient.post('/categorias', categoria);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};


export const syncFullData = async (dados, dispositivoId) => {
  try {
    const response = await apiClient.post('/sync/full', {
      ...dados,
      dispositivo_id: dispositivoId
    });
    return response.data;
  } catch (error) {
    console.error('Erro na sincronização:', error);
    throw error;
  }
};

export const getAllDataForSync = async () => {
  try {
    const response = await apiClient.get('/sync/all-data');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados para sync:', error);
    throw error;
  }
};


export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'offline' };
  }
};

export default apiClient;