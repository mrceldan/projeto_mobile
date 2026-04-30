import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isOnline, sincronizarTodosDados } from '../services/apiService';
import { getUltimaSincronizacao } from '../services/database';

export default function SyncStatus() {
  const [online, setOnline] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaSync, setUltimaSync] = useState(null);
  const [progresso, setProgresso] = useState(null);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    const status = await isOnline();
    setOnline(status);
    
    const ultima = await getUltimaSincronizacao();
    setUltimaSync(ultima);
  };

  const handleSincronizar = async () => {
    if (!online) {
      alert('Sem conexão com internet');
      return;
    }

    setSincronizando(true);
    try {
      await sincronizarTodosDados((progress) => {
        setProgresso(progress);
      });
      await checkStatus();
      alert('Dados sincronizados com sucesso!');
    } catch (error) {
      alert('Erro na sincronização: ' + error.message);
    } finally {
      setSincronizando(false);
      setProgresso(null);
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return 'Nunca';
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusIcon}>
          <Ionicons 
            name={online ? 'wifi' : 'wifi-outline'} 
            size={20} 
            color={online ? '#4CAF50' : '#F44336'} 
          />
          <Text style={[styles.statusText, online ? styles.online : styles.offline]}>
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.syncButton, (!online || sincronizando) && styles.syncDisabled]}
          onPress={handleSincronizar}
          disabled={!online || sincronizando}
        >
          {sincronizando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="sync-outline" size={18} color="#fff" />
              <Text style={styles.syncText}>Sincronizar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {progresso && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Sincronizando: {progresso.categoria} ({progresso.current}/{progresso.total})
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(progresso.current / progresso.total) * 100}%` }]} />
          </View>
        </View>
      )}
      
      <Text style={styles.lastSyncText}>
        Última sincronização: {formatarData(ultimaSync)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  online: {
    color: '#4CAF50',
  },
  offline: {
    color: '#F44336',
  },
  syncButton: {
    backgroundColor: '#E91E8C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  syncDisabled: {
    opacity: 0.6,
  },
  syncText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E91E8C',
    borderRadius: 2,
  },
  lastSyncText: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
});