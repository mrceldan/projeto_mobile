
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritos } from '../context/FavoritosContext';
import ProdutoCard from '../components/ProdutoCard';

export default function FavoritosScreen({ navigation }) {
  const { favoritos, totalFavoritos } = useFavoritos();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#E91E8C" />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Favoritos</Text>
        <View style={{ width: 40 }} />
      </View>

      {favoritos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#F8BBD9" />
          <Text style={styles.emptyText}>Nenhum favorito</Text>
          <Text style={styles.emptySubtext}>Toque no ❤️ para favoritar produtos</Text>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          renderItem={({ item }) => (
            <ProdutoCard
              produto={item}
              onPress={() => navigation.navigate('ProdutoDetail', { produto: item })}
              showFavorite={true}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#E91E8C' },
  list: { padding: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  emptyText: { fontSize: 18, marginTop: 16, color: '#666' },
  emptySubtext: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
});