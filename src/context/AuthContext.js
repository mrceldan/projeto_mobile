
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUsuario, cadastrarUsuario, logoutUsuario, validarToken } from '../services/apiService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const userStr = await AsyncStorage.getItem('@dezlumbrante_usuario');
      const token = await AsyncStorage.getItem('@dezlumbrante_token');
      
      if (userStr && token) {
        const usuario = JSON.parse(userStr);
        setUser(usuario);
        setIsAdmin(usuario.tipo === 'admin');
        
        // Validar token
        const valid = await validarToken();
        if (!valid.success) {
          await logout();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await loginUsuario(email, senha);
      if (response.success) {
        setUser(response.data.usuario);
        setIsAdmin(response.data.usuario.tipo === 'admin');
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const cadastrar = async (dados) => {
    try {
      const response = await cadastrarUsuario(dados);
      if (response.success) {
        setUser(response.data.usuario);
        setIsAdmin(response.data.usuario.tipo === 'admin');
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await logoutUsuario();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      loading,
      login,
      cadastrar,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};