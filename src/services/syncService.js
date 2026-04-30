
import NetInfo from '@react-native-community/netinfo';
import { 
  isOnline, 
  processPendingRequests, 
  sincronizarTodosDados,
  verificarSincronizacaoAutomatica 
} from './apiService';
import { Alert } from 'react-native';

let syncListener = null;
let syncInterval = null;


export const iniciarServicoSincronizacao = () => {
  // Listener de mudança de conexão
  syncListener = NetInfo.addEventListener(async (state) => {
    const estavaOffline = !state.isConnected;
    const agoraOnline = state.isConnected && state.isInternetReachable !== false;
    
    if (estavaOffline && agoraOnline) {
      console.log('📶 Conexão restaurada! Processando requisições pendentes...');
      
      try {
        await processPendingRequests();
        
        // Tenta sincronizar dados automaticamente
        const sincronizado = await verificarSincronizacaoAutomatica();
        
        if (!sincronizado) {
          // Se não sincronizou automaticamente, oferece opção ao usuário
          Alert.alert(
            'Conexão Restaurada',
            'Deseja sincronizar os dados da loja agora?',
            [
              { text: 'Agora não', style: 'cancel' },
              { 
                text: 'Sincronizar', 
                onPress: async () => {
                  await sincronizarTodosDados((progress) => {
                    console.log(`Sincronização: ${progress.categoria} - ${progress.status}`);
                  });
                  Alert.alert('Sucesso', 'Dados sincronizados com sucesso!');
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Erro ao processar sincronização pós-conexão:', error);
      }
    }
  });
  
  // Sincronização periódica (a cada 30 minutos)
  syncInterval = setInterval(async () => {
    const online = await isOnline();
    if (online) {
      console.log('🔄 Executando sincronização periódica...');
      try {
        await verificarSincronizacaoAutomatica();
      } catch (error) {
        console.error('Erro na sincronização periódica:', error);
      }
    }
  }, 30 * 60 * 1000); // 30 minutos
  
  console.log('✅ Serviço de sincronização iniciado');
};

/**
 * Para o serviço de sincronização
 */
export const pararServicoSincronizacao = () => {
  if (syncListener) {
    syncListener();
    syncListener = null;
  }
  
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  
  console.log('⏹️ Serviço de sincronização parado');
};

export default {
  iniciarServicoSincronizacao,
  pararServicoSincronizacao,
};