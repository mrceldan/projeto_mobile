
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
import { useCarrinho } from '../context/CarrinhoContext';
import { useFavoritos } from '../context/FavoritosContext';

import ProdutoCard from '../components/ProdutoCard';
import { getAllProdutos, initDatabase } from '../services/database';

export default function ClienteHomeScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout, user } = useAuth();
  const { totalItens } = useCarrinho();
  const { totalFavoritos } = useFavoritos();

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
        showFavorite={true}
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
      <StatusBar barStyle="light-content" backgroundColor="#E91E8C" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>✨ DEZLUMBRANTE</Text>
          <Text style={styles.headerSubtitle}>Olá, {user?.nome?.split(' ')[0] || 'Cliente'}!</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('Favoritos')} style={styles.headerButton}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
            {totalFavoritos > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalFavoritos}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Carrinho')} style={styles.headerButton}>
            <Ionicons name="cart-outline" size={24} color="#fff" />
            {totalItens > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItens}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
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
            <Text style={styles.emptyText}>Nenhum produto disponível</Text>
            <Text style={styles.emptySubtext}>Volte mais tarde</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#E91E8C' },
  headerBrand: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { color: '#fff', fontSize: 12, marginTop: 4 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerButton: { position: 'relative', padding: 4 },
  badge: { position: 'absolute', top: -8, right: -12, backgroundColor: '#ff4081', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  list: { padding: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, marginTop: 10, color: '#666' },
  emptySubtext: { fontSize: 13, color: '#888', marginTop: 8 },
});