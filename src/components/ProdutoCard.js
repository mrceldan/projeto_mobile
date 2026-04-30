
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCarrinho } from "../context/CarrinhoContext";
import { useFavoritos } from "../context/FavoritosContext";

export default function ProdutoCard({ 
  produto, 
  onPress, 
  onEdit, 
  onDelete, 
  showAdminActions = false,
  showFavorite = false 
}) {
  const { adicionarItem, itens } = useCarrinho();
  const { isFavorito, toggleFavorito } = useFavoritos();

  const noCarrinho = itens.find((i) => i.id === produto.id);

  function handleAdicionar() {
    adicionarItem(produto);
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.info}>
        <Text style={styles.nome}>{produto.nome}</Text>
        <Text style={styles.categoria}>Categoria: {produto.categoria}</Text>
        <Text style={styles.preco}>R$ {parseFloat(produto.preco).toFixed(2)}</Text>
      </View>

      <View style={styles.acoes}>
        {/* Botão Favorito (para clientes) */}
        {showFavorite && (
          <TouchableOpacity
            style={styles.botaoFavorito}
            onPress={() => toggleFavorito(produto)}
          >
            <Ionicons
              name={isFavorito(produto.id) ? "heart" : "heart-outline"}
              size={22}
              color={isFavorito(produto.id) ? "#E91E8C" : "#999"}
            />
          </TouchableOpacity>
        )}

        {/* Botão Carrinho (para clientes) */}
        {!showAdminActions && !showFavorite && (
          <TouchableOpacity
            style={[styles.addBtn, noCarrinho && styles.addBtnAtivo]}
            onPress={handleAdicionar}
          >
            <Ionicons
              name={noCarrinho ? "cart" : "cart-outline"}
              size={20}
              color={noCarrinho ? "#fff" : "#E91E8C"}
            />
            {noCarrinho && (
              <Text style={styles.addBtnQty}>{noCarrinho.quantidade}</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Botões Admin (editar/deletar) */}
        {showAdminActions && (
          <View style={styles.adminActions}>
            {onEdit && (
              <TouchableOpacity style={styles.botaoEditar} onPress={onEdit}>
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={styles.botaoDeletar} onPress={onDelete}>
                <Ionicons name="trash-bin" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Botão Carrinho para admin também (opcional) */}
        {showAdminActions && (
          <TouchableOpacity
            style={[styles.addBtn, noCarrinho && styles.addBtnAtivo]}
            onPress={handleAdicionar}
          >
            <Ionicons
              name={noCarrinho ? "cart" : "cart-outline"}
              size={20}
              color={noCarrinho ? "#fff" : "#E91E8C"}
            />
            {noCarrinho && (
              <Text style={styles.addBtnQty}>{noCarrinho.quantidade}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 8,
    borderRadius: 12,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#E91E8C",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoria: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
  },
  preco: {
    color: "#E91E8C",
    fontWeight: "bold",
    marginTop: 6,
    fontSize: 15,
  },
  acoes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  botaoFavorito: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#E91E8C",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  addBtnAtivo: {
    backgroundColor: "#E91E8C",
    borderColor: "#E91E8C",
  },
  addBtnQty: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    color: "#E91E8C",
    fontWeight: "bold",
    fontSize: 10,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#E91E8C",
  },
  adminActions: {
    flexDirection: "row",
    gap: 6,
  },
  botaoEditar: {
    backgroundColor: "#2196F3",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoDeletar: {
    backgroundColor: "#f44336",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});