import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIA_CORES = {
  'Boca': '#E91E8C',
  'Olhos': '#9C27B0',
  'Pele': '#FF7043',
  'Sobrancelha': '#795548',
  'Outros': '#607D8B',
};

const CATEGORIA_ICONES = {
  'Boca': 'color-palette-outline',
  'Olhos': 'eye-outline',
  'Pele': 'sparkles-outline',
  'Sobrancelha': 'brush-outline',
  'Outros': 'bag-handle-outline',
};

export default function ProdutoDetailScreen({ route, navigation }) {
  const { produto } = route.params;

  const corCategoria = CATEGORIA_CORES[produto.categoria] || CATEGORIA_CORES['Outros'];
  const iconeCategoria = CATEGORIA_ICONES[produto.categoria] || CATEGORIA_ICONES['Outros'];

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconContainer, { backgroundColor: corCategoria + '15' }]}>
        <Ionicons name={icon} size={22} color={corCategoria} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Não informado'}</Text>
      </View>
    </View>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={corCategoria} />

      <View style={[styles.header, { backgroundColor: corCategoria }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Produto</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <View style={[styles.avatarSection, { backgroundColor: corCategoria }]}>
          <View style={styles.avatarCircle}>
            <Ionicons name={iconeCategoria} size={52} color={corCategoria} />
          </View>
          <Text style={styles.productName}>{produto.nome}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ID: {produto.id}</Text>
          </View>
          <Text style={styles.precoDestaque}>
            R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações do Produto</Text>

          <InfoRow
            icon="bag-handle-outline"
            label="Nome do Produto"
            value={produto.nome}
          />

          <InfoRow
            icon={iconeCategoria}
            label="Categoria"
            value={produto.categoria}
          />

          <InfoRow
            icon="pricetag-outline"
            label="Preço"
            value={`R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}`}
          />

          {produto.descricao ? (
            <InfoRow
              icon="document-text-outline"
              label="Descrição"
              value={produto.descricao}
            />
          ) : null}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações do Sistema</Text>

          <InfoRow
            icon="calendar-outline"
            label="Data de Cadastro"
            value={formatDate(produto.criado_em)}
          />
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: corCategoria }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.buttonText}>Voltar à Lista</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 40,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  precoDestaque: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#E91E8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#aaa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FCE4EC',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF5F9',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#bbb',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#2D1B2E',
    fontWeight: '500',
  },
  actionsSection: {
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#E91E8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
