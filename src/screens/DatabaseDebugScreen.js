import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  getAllProdutos,
  clearAllProdutos,
  initDatabase
} from '../services/database';

export default function DatabaseDebugScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const listarProdutos = async () => {
    setLoading(true);
    try {
      const dados = await getAllProdutos();
      setProdutos(dados);
      setMensagem(`✅ ${dados.length} produto(s) encontrado(s)`);
    } catch (error) {
      setMensagem(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const reiniciarBanco = async () => {
    Alert.alert(
      'Reiniciar Banco',
      'Isso vai recriar a tabela. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              await initDatabase();
              setMensagem('✅ Banco reiniciado com sucesso');
            } catch (error) {
              setMensagem(`❌ Erro: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const limparTodos = async () => {
    Alert.alert(
      'Limpar Tudo',
      'Isso vai deletar TODOS os produtos. Confirmar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar Tudo',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await clearAllProdutos();
              setProdutos([]);
              setMensagem('✅ Todos os produtos foram removidos');
            } catch (error) {
              setMensagem(`❌ Erro: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug do Banco</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Banco: dezlumbrante.db</Text>
        <Text style={styles.sectionTitle}>Tabela: produtos</Text>

        {mensagem ? (
          <View style={styles.mensagemBox}>
            <Text style={styles.mensagem}>{mensagem}</Text>
          </View>
        ) : null}

        <View style={styles.botoesContainer}>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={listarProdutos}>
            <Ionicons name="list-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Listar Produtos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.btnWarning]} onPress={reiniciarBanco}>
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Reiniciar Banco</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={limparTodos}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Limpar Tudo</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator color="#E91E8C" style={{ marginTop: 20 }} />}

        {produtos.length > 0 && (
          <View style={styles.tabelaContainer}>
            <Text style={styles.tabelaTitulo}>Registros ({produtos.length})</Text>
            {produtos.map((p) => (
              <View key={p.id} style={styles.linha}>
                <Text style={styles.linhaTexto}>
                  [{p.id}] {p.nome} | {p.categoria} | R$ {parseFloat(p.preco).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
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
    backgroundColor: '#E91E8C',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  mensagemBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E91E8C',
  },
  mensagem: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  botoesContainer: {
    marginTop: 20,
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 10,
  },
  btnPrimary: { backgroundColor: '#E91E8C' },
  btnWarning: { backgroundColor: '#FF9800' },
  btnDanger: { backgroundColor: '#f44336' },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  tabelaContainer: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  tabelaTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E91E8C',
    marginBottom: 10,
  },
  linha: {
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#FCE4EC',
  },
  linhaTexto: {
    fontSize: 13,
    color: '#444',
    fontFamily: 'monospace',
  },
});
