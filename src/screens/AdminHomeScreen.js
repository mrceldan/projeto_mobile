
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

import ProdutoCard from '../components/ProdutoCard';
import ProdutoForm from '../components/ProdutoForm';
import {
  getAllProdutos,
  createProduto,
  updateProduto,
  deleteProduto,
  initDatabase,
} from '../services/database';

export default function AdminHomeScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const { logout, user } = useAuth();

  useEffect(() => {
    inicializarApp();
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
    }
  }

  async function carregarProdutos() {
    try {
      setLoading(true);
      const dados = await getAllProdutos();
      setProdutos(dados);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
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
        Alert.alert('Sucesso', 'Produto criado');
      }
      carregarProdutos();
      setModalVisible(false);
    } catch (error) {
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
              Alert.alert('Erro', 'Erro ao excluir produto');
            }
          }
        }
      ]
    );
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: async () => { await logout(); } }
    ]);
  }

  function renderProduto({ item }) {
    return (
      <ProdutoCard
        produto={item}
        onPress={() => navigation.navigate('ProdutoDetail', { produto: item })}
        onEdit={() => handleEditarProduto(item)}
        onDelete={() => handleDeletarProduto(item.id)}
        showAdminActions={true}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E8C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>👑 ADMIN</Text>
          <Text style={styles.headerSubtitle}>Olá, {user?.nome || 'Admin'} | {produtos.length} produtos</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNovoProduto} style={styles.addButton}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={produtos}
        renderItem={renderProduto}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-handle-outline" size={80} color="#F8BBD9" />
            <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
            <Text style={styles.emptySubtext}>Toque em "+" para adicionar</Text>
          </View>
        }
      />

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
  container: { flex: 1, backgroundColor: '#FFF5F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#2c3e50' },
  headerBrand: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { color: '#ecf0f1', fontSize: 12, marginTop: 4 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerButton: { padding: 8 },
  addButton: { backgroundColor: '#E91E8C', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, marginTop: 10, color: '#666' },
  emptySubtext: { fontSize: 13, color: '#888', marginTop: 8 },
});