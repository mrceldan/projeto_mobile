
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import { createProdutoBackend, updateProdutoBackend } from "../services/apiService";

const CATEGORIAS = ["Boca", "Olhos", "Pele", "Rosto"];
const PRECO_PADRAO = 10;

export default function ProdutoForm({ visible, onClose, onSave, produto }) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Boca");
  const [preco, setPreco] = useState(PRECO_PADRAO.toString());
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (produto) {
      setNome(produto.nome);
      setCategoria(produto.categoria);
      setPreco(produto.preco?.toString() || PRECO_PADRAO.toString());
      setDescricao(produto.descricao || "");
    } else {
      setNome("");
      setCategoria("Boca");
      setPreco(PRECO_PADRAO.toString());
      setDescricao("");
    }
  }, [produto, visible]);

  async function salvar() {
    if (nome.trim() === "") {
      Alert.alert("Erro", "Digite o nome do produto");
      return;
    }

    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum <= 0) {
      Alert.alert("Erro", "Digite um preço válido");
      return;
    }

    setLoading(true);

    try {
      const produtoData = {
        nome: nome.trim(),
        categoria,
        preco: precoNum,
        descricao: descricao.trim() || null,
      };

      let resultado;

      if (produto?.id) {
        
        resultado = await updateProdutoBackend(produto.id, produtoData);
        if (resultado.success) {
          Alert.alert("Sucesso", "Produto atualizado!");
        }
      } else {
        // Criar novo produto
        resultado = await createProdutoBackend(produtoData);
        if (resultado.success) {
          Alert.alert("Sucesso", "Produto criado!");
        }
      }

      if (resultado.success && onSave) {
        onSave(resultado.data);
      }
      
      onClose();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      Alert.alert("Erro", "Não foi possível salvar o produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <Text style={styles.titulo}>
          {produto ? "Editar Produto" : "Novo Produto"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do produto"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Preço"
          value={preco}
          onChangeText={setPreco}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Categoria</Text>

        <View style={styles.categorias}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.botaoCategoria,
                categoria === cat && styles.botaoCategoriaAtivo
              ]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={categoria === cat && styles.textoCategoriaAtivo}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição (opcional)"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.botaoSalvar}
          onPress={salvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {produto ? "Atualizar" : "Salvar"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.botaoCancelar}>
          <Text style={styles.textoCancelar}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E91E8C",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  categorias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  botaoCategoria: {
    borderWidth: 1,
    borderColor: "#E91E8C",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  botaoCategoriaAtivo: {
    backgroundColor: "#E91E8C",
  },
  textoCategoriaAtivo: {
    color: "#fff",
  },
  botaoSalvar: {
    backgroundColor: "#E91E8C",
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  botaoCancelar: {
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  textoCancelar: {
    color: "#999",
    fontSize: 16,
  },
});