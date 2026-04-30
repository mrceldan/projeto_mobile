
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import ProdutoCard from '../components/ProdutoCard';
import ProdutoForm from '../components/ProdutoForm';
import { useCarrinho } from '../context/CarrinhoContext';

// Import do database local
import {
  getAllProdutos,
  createProduto,
  updateProduto,
  deleteProduto,
  initDatabase,
} from '../services/database';

// Import do serviço de sincronização (que já existe)
import { 
  sincronizarTodosDados,
  isOnline,
  checkBackendHealth
} from '../services/apiService';

export default function HomeScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  // Estados de sincronização
  const [sincronizando, setSincronizando] = useState(false);
  const [modalSyncVisible, setModalSyncVisible] = useState(false);
  const [logSync, setLogSync] = useState([]);
  const [backendStatus, setBackendStatus] = useState('verificando');

  const { totalItens } = useCarrinho();

  useEffect(() => {
    inicializarApp();
    verificarBackend();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [])
  );

  async function inicializarApp() {
    try {
      await initDatabase();
      await carregarProdutos();
    } catch (error) {
      console.error('Erro ao inicializar:', error);
      Alert.alert('Erro', 'Erro ao inicializar aplicativo');
    }
  }

  async function verificarBackend() {
    try {
      const status = await checkBackendHealth();
      setBackendStatus(status?.status === 'online' ? 'online' : 'offline');
    } catch (error) {
      setBackendStatus('offline');
    }
  }

  async function carregarProdutos() {
    try {
      setLoading(true);
      const dados = await getAllProdutos();
      setProdutos(dados);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    carregarProdutos();
  }

  function handleNovoProduto() {
    setProdutoSelecionado(null);
    setModalVisible(true);
  }

  function handleEditarProduto(produto) {
    setProdutoSelecionado(produto);
    setModalVisible(true);
  }

  async function handleSalvarProduto(dados) {
    try {
      if (dados.id) {
        await updateProduto(dados.id, dados.nome, dados.categoria, dados.preco, dados.descricao);
        Alert.alert('Sucesso', 'Produto atualizado');
      } else {
        await createProduto(dados.nome, dados.categoria, dados.preco, dados.descricao);
        Alert.alert('Sucesso', 'Produto cadastrado');
      }
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Erro ao salvar produto');
    }
  }

  async function handleDeletarProduto(id) {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduto(id);
              Alert.alert('Sucesso', 'Produto excluído');
              carregarProdutos();
            } catch (error) {
              console.error('Erro ao excluir produto:', error);
              Alert.alert('Erro', 'Erro ao excluir produto');
            }
          }
        }
      ]
    );
  }

  function handleVisualizarProduto(produto) {
    navigation.navigate('ProdutoDetail', { produto });
  }

  // SINCRONIZAÇÃO COM MAKEUP API
  async function handleSincronizar() {
    const online = await isOnline();
    if (!online) {
      Alert.alert(
        'Sem conexão',
        'Você está offline. Conecte-se à internet para sincronizar.'
      );
      return;
    }

    setLogSync([]);
    setModalSyncVisible(true);
    setSincronizando(true);

    try {
      const resultado = await sincronizarTodosDados((progress) => {
        setLogSync((prev) => [
          ...prev,
          `${progress.categoria || ''} - ${progress.status || progress.message || 'processando...'}`
        ]);
      });

      await carregarProdutos();

      setLogSync((prev) => [
        ...prev,
        `✅ Sincronização concluída com sucesso!`,
      ]);
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setLogSync((prev) => [...prev, `❌ Erro na sincronização: ${error.message}`]);
    } finally {
      setSincronizando(false);
    }
  }

  function renderProduto({ item }) {
    return (
      <ProdutoCard
        produto={item}
        onPress={() => handleVisualizarProduto(item)}
        onEdit={() => handleEditarProduto(item)}
        onDelete={() => handleDeletarProduto(item.id)}
      />
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bag-handle-outline" size={80} color="#F8BBD9" />
        <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
        <Text style={styles.emptySubtext}>
          Toque em "Sincronizar" para importar da API ou em "+" para adicionar manualmente
        </Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E8C" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E91E8C" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerBrand}>✨ DEZLUMBRANTE</Text>
          <Text style={styles.headerSubtitle}>
            {produtos.length} produtos cadastrados
          </Text>
        </View>

        {/* INDICADOR DE STATUS DO BACKEND */}
        <TouchableOpacity 
          style={styles.statusButton} 
          onPress={verificarBackend}
        >
          <View style={[
            styles.statusDot,
            backendStatus === 'online' ? styles.statusOnline : 
            backendStatus === 'offline' ? styles.statusOffline : 
            styles.statusChecking
          ]} />
        </TouchableOpacity>

        {/* BOTÃO SINCRONIZAR */}
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSincronizar}
          disabled={sincronizando}
        >
          <Ionicons
            name={sincronizando ? 'sync' : 'cloud-download-outline'}
            size={20}
            color="#E91E8C"
          />
        </TouchableOpacity>

        {/* ÍCONE DO CARRINHO */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Carrinho')}
        >
          <Ionicons name="cart-outline" size={24} color="#E91E8C" />
          {totalItens > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {totalItens > 99 ? '99+' : totalItens}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleNovoProduto}>
          <Ionicons name="add" size={28} color="#E91E8C" />
        </TouchableOpacity>
      </View>

      {/* CATEGORIAS */}
      <View style={styles.categoriasBar}>
        {['Todos', 'Boca', 'Olhos', 'Pele', 'Rosto'].map((cat) => (
          <TouchableOpacity key={cat} style={styles.catChip}>
            <Text style={styles.catChipText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA DE PRODUTOS */}
      <FlatList
        data={produtos}
        renderItem={renderProduto}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          produtos.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* MODAL DE SINCRONIZAÇÃO */}
      <Modal
        visible={modalSyncVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !sincronizando && setModalSyncVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSync}>
            <View style={styles.modalSyncHeader}>
              <Text style={styles.modalSyncTitle}>
                {sincronizando ? '🔄 Sincronizando com API...' : '✅ Sincronização concluída'}
              </Text>
            </View>

            <ScrollView style={styles.logContainer}>
              {logSync.map((msg, i) => (
                <Text key={i} style={styles.logText}>
                  {msg}
                </Text>
              ))}
              {sincronizando && (
                <ActivityIndicator color="#E91E8C" style={{ marginTop: 10 }} />
              )}
            </ScrollView>

            {!sincronizando && (
              <TouchableOpacity
                style={styles.modalSyncClose}
                onPress={() => setModalSyncVisible(false)}
              >
                <Text style={styles.modalSyncCloseText}>Fechar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <ProdutoForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSalvarProduto}
        produto={produtoSelecionado}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#E91E8C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E91E8C',
  },
  headerBrand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 12,
  },
  statusButton: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#f44336',
  },
  statusChecking: {
    backgroundColor: '#FFC107',
  },
  syncButton: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cartButton: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4081',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriasBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  catChip: {
    borderWidth: 1,
    borderColor: '#E91E8C',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  catChipText: {
    color: '#E91E8C',
    fontSize: 12,
  },
  list: {
    padding: 12,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSync: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '65%',
  },
  modalSyncHeader: {
    marginBottom: 12,
  },
  modalSyncTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1B2E',
  },
  logContainer: {
    backgroundColor: '#FFF5F9',
    borderRadius: 10,
    padding: 12,
    maxHeight: 250,
  },
  logText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    lineHeight: 18,
  },
  modalSyncClose: {
    marginTop: 16,
    backgroundColor: '#E91E8C',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSyncCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});