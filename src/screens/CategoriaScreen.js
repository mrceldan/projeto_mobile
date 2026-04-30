
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAllProdutos } from '../services/database';
import { useCarrinho } from '../context/CarrinhoContext';

const CATEGORIA_CONFIG = {
  Boca:       { cor: '#E91E8C', icone: 'color-palette-outline' },
  Olhos:      { cor: '#9C27B0', icone: 'eye-outline' },
  Pele:       { cor: '#FF7043', icone: 'sparkles-outline' },
  Sobrancelha:{ cor: '#795548', icone: 'brush-outline' },
  Outros:     { cor: '#607D8B', icone: 'bag-handle-outline' },
};

const OUTRAS_CATEGORIAS = ['Boca', 'Olhos', 'Pele'];

export default function CategoriaScreen({ route, navigation }) {
  const { categoria } = route.params;
  const config = CATEGORIA_CONFIG[categoria] || CATEGORIA_CONFIG['Outros'];

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const { adicionarItem, itens, totalItens } = useCarrinho();

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [categoria])
  );

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const todos = await getAllProdutos();
      const filtrados = todos.filter((p) => p.categoria === categoria);
      setProdutos(filtrados);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  function handleAdicionar(item) {
    adicionarItem(item);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${item.nome} adicionado! 🛒`, ToastAndroid.SHORT);
    } else {
      Alert.alert('', `${item.nome} adicionado ao carrinho! 🛒`, [
        { text: 'OK', style: 'cancel' },
        { text: 'Ver Carrinho', onPress: () => navigation.navigate('Carrinho') },
      ]);
    }
  }

  // ─── CARD DE PRODUTO ──────────────────────────────────────────────────────
  function ProdutoItem({ item }) {
    const noCarrinho = itens.find((i) => i.id === item.id);
    const temImagem = item.imagem && item.imagem.startsWith('http');

    return (
      <TouchableOpacity
        style={styles.produtoCard}
        onPress={() => navigation.navigate('ProdutoDetail', { produto: item })}
        activeOpacity={0.8}
      >
        {/* Badge "API" se for produto sincronizado */}
        {item.origem === 'api' && (
          <View style={[styles.badge, { backgroundColor: config.cor }]}>
            <Text style={styles.badgeText}>API</Text>
          </View>
        )}

        {/* Imagem ou ícone padrão */}
        {temImagem ? (
          <Image
            source={{ uri: item.imagem }}
            style={styles.produtoImagem}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.produtoIconBox, { backgroundColor: config.cor + '18' }]}>
            <Ionicons name={config.icone} size={36} color={config.cor} />
          </View>
        )}

        <Text style={styles.produtoNome} numberOfLines={2}>
          {item.nome}
        </Text>

        {/* Marca (só para produtos da API) */}
        {item.marca ? (
          <Text style={styles.produtoMarca} numberOfLines={1}>
            {item.marca}
          </Text>
        ) : null}

        <Text style={[styles.produtoPreco, { color: config.cor }]}>
          R$ {parseFloat(item.preco).toFixed(2).replace('.', ',')}
        </Text>

        <TouchableOpacity
          style={[
            styles.btnAdicionar,
            { backgroundColor: noCarrinho ? '#aaa' : config.cor },
          ]}
          onPress={() => handleAdicionar(item)}
        >
          <Text style={styles.btnAdicionarText}>
            {noCarrinho
              ? `No carrinho (${noCarrinho.quantidade})`
              : 'Adicionar ao Carrinho'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* TOPBAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Inicio')}>
          <Ionicons name="arrow-back" size={24} color="#E91E8C" />
        </TouchableOpacity>

        <Text style={styles.topBarBrand}>DEZLUMBRANTE</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Carrinho')}
          style={styles.cartBtn}
        >
          <Ionicons name="bag-handle-outline" size={24} color="#E91E8C" />
          {totalItens > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItens}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* BANNER */}
        <View style={[styles.banner, { backgroundColor: config.cor }]}>
          <View style={styles.bannerOverlay}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back-circle" size={36} color="#fff" />
            </TouchableOpacity>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerCategoria}>{categoria}</Text>
              <Text style={styles.bannerSub}>
                {produtos.length} produto{produtos.length !== 1 ? 's' : ''} disponíve{produtos.length !== 1 ? 'is' : 'l'}
              </Text>
            </View>
          </View>
        </View>

        {/* ABAS DE CATEGORIA */}
        <View style={styles.tabsContainer}>
          {OUTRAS_CATEGORIAS.map((cat) => {
            const c = CATEGORIA_CONFIG[cat];
            const ativa = cat === categoria;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.tab,
                  ativa && { borderBottomColor: c.cor, borderBottomWidth: 2.5 },
                ]}
                onPress={() => navigation.replace('Categoria', { categoria: cat })}
              >
                <Text style={[styles.tabText, { color: ativa ? c.cor : '#bbb' }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CONTEÚDO */}
        {loading ? (
          <ActivityIndicator color={config.cor} style={{ marginTop: 40 }} />
        ) : produtos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name={config.icone} size={60} color={config.cor + '50'} />
            <Text style={styles.emptyText}>Nenhum produto em {categoria}</Text>
            <Text style={styles.emptySubtext}>
              Sincronize a API na tela principal para importar produtos automaticamente
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {produtos.map((item) => (
              <ProdutoItem key={item.id} item={item} />
            ))}
          </View>
        )}

        {/* BANNER FINAL */}
        <View style={[styles.bannerFinal, { backgroundColor: config.cor }]}>
          <View style={styles.bannerFinalOverlay}>
            <Text style={styles.bannerFinalBrand}>DEZLUMBRANTE</Text>
            <Text style={styles.bannerFinalText}>
              Realize seus sonhos com elegância, sofisticação e praticidade
            </Text>
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 DEZLUMBRANTE - Beleza que encanta! 💄</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F9' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#FCE4EC',
  },
  topBarBrand: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E91E8C',
    letterSpacing: 1.5,
  },
  cartBtn: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#E91E8C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  banner: { height: 160, margin: 16, borderRadius: 16, overflow: 'hidden' },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  backBtn: { alignSelf: 'flex-start', marginTop: 4 },
  bannerInfo: { flex: 1 },
  bannerCategoria: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 13, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  produtoCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#E91E8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  produtoImagem: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  produtoIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  produtoNome: { fontSize: 13, fontWeight: '600', color: '#2D1B2E', textAlign: 'center' },
  produtoMarca: { fontSize: 11, color: '#999', textAlign: 'center' },
  produtoPreco: { fontSize: 14, fontWeight: 'bold' },
  btnAdicionar: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  btnAdicionarText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#ccc', textAlign: 'center' },
  emptySubtext: { fontSize: 13, color: '#ddd', textAlign: 'center' },
  bannerFinal: {
    height: 120,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerFinalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    padding: 20,
  },
  bannerFinalBrand: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 4,
  },
  bannerFinalText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 18 },
  footer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#FCE4EC',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  footerText: { fontSize: 11, color: '#ccc' },
});