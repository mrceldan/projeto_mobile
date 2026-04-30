
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { checkBackendHealth, sincronizarTodosDados } from '../services/apiService';

export default function ConfigScreen() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);

  useEffect(() => {
    verificarBackend();
  }, []);

  const verificarBackend = async () => {
    try {
      const result = await checkBackendHealth();
      setBackendStatus(result.status === 'online' ? 'online' : 'offline');
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncProgress(null);
    
    try {
      const result = await sincronizarTodosDados((progress) => {
        setSyncProgress(progress);
      });
      
      Alert.alert('Sucesso', result.message);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncProgress(null), 3000);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Configurações</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Status do Backend</Text>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusIndicator,
            backendStatus === 'online' ? styles.statusOnline : styles.statusOffline
          ]} />
          <Text style={styles.statusText}>
            {backendStatus === 'online' ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
        <TouchableOpacity onPress={verificarBackend} style={styles.botaoSecundario}>
          <Text>Verificar novamente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Sincronização</Text>
        <Text style={styles.cardDescricao}>
          Sincroniza produtos com o backend e busca novidades da Makeup API
        </Text>
        
        {syncProgress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {syncProgress.message || `Sincronizando... ${syncProgress.current}/${syncProgress.total}`}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.botaoPrincipal, syncing && styles.botaoDisabled]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.botaoTexto}>Sincronizar Agora</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Informações</Text>
        <Text style={styles.infoText}>URL do Backend: http://SEU_IP:3000/api</Text>
        <Text style={styles.infoText}>Certifique-se que o backend está rodando</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E91E8C',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#f44336',
  },
  statusText: {
    fontSize: 16,
  },
  botaoPrincipal: {
    backgroundColor: '#E91E8C',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  botaoSecundario: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoDisabled: {
    opacity: 0.6,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  progressText: {
    color: '#1976d2',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});