
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritosContext = createContext({});

export const useFavoritos = () => useContext(FavoritosContext);

export const FavoritosProvider = ({ children }) => {
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    carregarFavoritos();
  }, []);

  const carregarFavoritos = async () => {
    try {
      const saved = await AsyncStorage.getItem('@dezlumbrante_favoritos');
      if (saved) {
        setFavoritos(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const salvarFavoritos = async (novosFavoritos) => {
    try {
      await AsyncStorage.setItem('@dezlumbrante_favoritos', JSON.stringify(novosFavoritos));
      setFavoritos(novosFavoritos);
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  const adicionarFavorito = async (produto) => {
    const existe = favoritos.some(f => f.id === produto.id);
    if (!existe) {
      const novos = [...favoritos, produto];
      await salvarFavoritos(novos);
    }
  };

  const removerFavorito = async (produtoId) => {
    const novos = favoritos.filter(f => f.id !== produtoId);
    await salvarFavoritos(novos);
  };

  const isFavorito = (produtoId) => {
    return favoritos.some(f => f.id === produtoId);
  };

  const toggleFavorito = async (produto) => {
    if (isFavorito(produto.id)) {
      await removerFavorito(produto.id);
    } else {
      await adicionarFavorito(produto);
    }
  };

  return (
    <FavoritosContext.Provider value={{
      favoritos,
      adicionarFavorito,
      removerFavorito,
      isFavorito,
      toggleFavorito,
      totalFavoritos: favoritos.length
    }}>
      {children}
    </FavoritosContext.Provider>
  );
};