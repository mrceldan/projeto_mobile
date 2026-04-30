import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCarrinho } from '../context/CarrinhoContext';

export default function CarrinhoScreen({ navigation }) {
  const { itens, removerItem, alterarQuantidade, limparCarrinho, totalItens, totalPreco } = useCarrinho();

  function handleFinalizar() {
    Alert.alert(
      'Pedido Finalizado!',
      `Total: R$ ${totalPreco.toFixed(2)}`,
      [{ text: 'OK', onPress: () => { limparCarrinho(); navigation.navigate('Inicio'); } }]
    );
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome}>{item.nome}</Text>
          <Text style={styles.cardPreco}>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
          <Text style={styles.cardMarca}>{item.marca || item.categoria}</Text>
        </View>
        <View style={styles.cardAcoes}>
          <TouchableOpacity style={styles.btnQtd} onPress={() => alterarQuantidade(item.id, -1)}>
            <Text style={styles.btnQtdText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantidade}>{item.quantidade}</Text>
          <TouchableOpacity style={styles.btnQtd} onPress={() => alterarQuantidade(item.id, 1)}>
            <Text style={styles.btnQtdText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removerItem(item.id)}>
            <Text style={styles.btnRemover}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.voltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Meu Carrinho</Text>
        <Text style={styles.headerTotal}>{totalItens} itens</Text>
      </View>

      {itens.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioEmoji}>🛍️</Text>
          <Text style={styles.vazioTexto}>Seu carrinho está vazio</Text>
          <TouchableOpacity style={styles.btnContinuar} onPress={() => navigation.navigate('Inicio')}>
            <Text style={styles.btnContinuarText}>Continuar comprando</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={itens}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15 }}
          />
          <View style={styles.resumo}>
            <View style={styles.resumoLinha}>
              <Text style={styles.resumoLabel}>Subtotal ({totalItens} itens)</Text>
              <Text style={styles.resumoValor}>R$ {totalPreco.toFixed(2)}</Text>
            </View>
            <View style={styles.resumoLinha}>
              <Text style={styles.resumoLabel}>Frete</Text>
              <Text style={{ color: 'green' }}>Grátis</Text>
            </View>
            <View style={[styles.resumoLinha, { marginTop: 8 }]}>
              <Text style={styles.resumoTotal}>Total</Text>
              <Text style={styles.resumoTotalValor}>R$ {totalPreco.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.btnFinalizar} onPress={handleFinalizar}>
              <Text style={styles.btnFinalizarText}>Finalizar Pedido</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={limparCarrinho}>
              <Text style={styles.btnLimpar}>Limpar carrinho</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDECF3' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#E91E8C' },
  voltar: { color: '#fff' },
  headerTitulo: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerTotal: { color: '#fff', fontSize: 12 },
  vazio: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vazioEmoji: { fontSize: 60, marginBottom: 10 },
  vazioTexto: { fontSize: 16, color: '#999', marginBottom: 20 },
  btnContinuar: { backgroundColor: '#E91E8C', padding: 12, borderRadius: 25, paddingHorizontal: 25 },
  btnContinuarText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  cardPreco: { fontSize: 15, color: '#E91E8C', fontWeight: 'bold', marginTop: 3 },
  cardMarca: { fontSize: 11, color: '#999', marginTop: 2 },
  cardAcoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnQtd: { backgroundColor: '#E91E8C', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  btnQtdText: { color: '#fff', fontSize: 18, lineHeight: 22 },
  quantidade: { fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },
  btnRemover: { fontSize: 18, marginLeft: 5 },
  resumo: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  resumoLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resumoLabel: { color: '#666' },
  resumoValor: { fontWeight: 'bold' },
  resumoTotal: { fontSize: 16, fontWeight: 'bold' },
  resumoTotalValor: { fontSize: 16, fontWeight: 'bold', color: '#E91E8C' },
  btnFinalizar: { backgroundColor: '#E91E8C', padding: 14, borderRadius: 25, alignItems: 'center', marginTop: 12 },
  btnFinalizarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnLimpar: { textAlign: 'center', color: '#999', marginTop: 10, fontSize: 12 },
});