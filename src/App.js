
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CarrinhoProvider } from './context/CarrinhoContext';
import { FavoritosProvider } from './context/FavoritosContext';
import { initDatabase } from './services/database';
import { iniciarServicoSincronizacao, pararServicoSincronizacao } from './services/syncService';

// Telas
import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import AdminHomeScreen from './screens/AdminHomeScreen';
import ClienteHomeScreen from './screens/ClienteHomeScreen';
import CarrinhoScreen from './screens/CarrinhoScreen';
import ProdutoDetailScreen from './screens/ProdutoDetailScreen';
import FavoritosScreen from './screens/FavoritosScreen';

const Stack = createStackNavigator();

// Componente que decide qual tela mostrar baseado no tipo de usuário
import { useAuth, AuthProvider } from './context/AuthContext';

function AppNavigator() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return null; // Ou um splash screen
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
      </Stack.Navigator>
    );
  }

  if (isAdmin) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="ProdutoDetail" component={ProdutoDetailScreen} />
        <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClienteHome" component={ClienteHomeScreen} />
      <Stack.Screen name="ProdutoDetail" component={ProdutoDetailScreen} />
      <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
      <Stack.Screen name="Favoritos" component={FavoritosScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    const setupApp = async () => {
      await initDatabase();
      iniciarServicoSincronizacao();
    };
    
    setupApp();
    
    return () => {
      pararServicoSincronizacao();
    };
  }, []);
  
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <FavoritosProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </FavoritosProvider>
      </CarrinhoProvider>
    </AuthProvider>
  );
}