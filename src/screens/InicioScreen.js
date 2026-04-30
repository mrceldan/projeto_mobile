import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCarrinho } from '../context/CarrinhoContext';

const { width } = Dimensions.get('window');

const CATEGORIAS = [
  { nome: 'Boca', icone: 'color-palette-outline', cor: '#E91E8C', tela: 'Categoria' },
  { nome: 'Olhos', icone: 'eye-outline', cor: '#9C27B0', tela: 'Categoria' },
  { nome: 'Pele', icone: 'sparkles-outline', cor: '#FF7043', tela: 'Categoria' },
];

export default function InicioScreen({ navigation }) {
  const { totalItens } = useCarrinho();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.topBar}>
        {/* Menu removido pois não há drawer navigator */}
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="menu" size={26} color="#E91E8C" />
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

        <View style={styles.banner}>
          <View style={styles.bannerImagePlaceholder}>
            <Ionicons name="sparkles" size={60} color="rgba(255,255,255,0.5)" />
          </View>
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerBrand}>DEZLUMBRANTE</Text>
            <Text style={styles.bannerText}>
              Realize seus sonhos com elegância, sofisticação e praticidade!
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRONTA PARA SE PRODUZIR</Text>
          <View style={styles.categoriasRow}>
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity
                key={cat.nome}
                style={styles.categoriaItem}
                onPress={() => navigation.navigate('Categoria', { categoria: cat.nome })}
              >
                <View style={[styles.categoriaBox, { backgroundColor: cat.cor + '18' }]}>
                  <Ionicons name={cat.icone} size={32} color={cat.cor} />
                </View>
                <Text style={[styles.categoriaNome, { color: cat.cor }]}>{cat.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.bannerSecundario, { marginBottom: 16 }]}>
          <View style={styles.bannerSecOverlay}>
            <Text style={styles.bannerSecBrand}>DEZLUMBRANTE</Text>
            <Text style={styles.bannerSecText}>
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
  container: {
    flex: 1,
    backgroundColor: '#FFF5F9',
  },
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
  cartBtn: {
    position: 'relative',
  },
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
  cartBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  banner: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E91E8C',
  },
  bannerImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#C2185B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#bbb',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
    textAlign: 'center',
  },
  categoriasRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  categoriaItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoriaBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriaNome: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerSecundario: {
    height: 130,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E91E8C',
  },
  bannerSecOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  bannerSecBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 6,
  },
  bannerSecText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#FCE4EC',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  footerText: {
    fontSize: 11,
    color: '#ccc',
  },
});