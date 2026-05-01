# 💄 Dezlumbrante - App de Maquiagem

**React Native | Expo | Node.js | SQLite**

---

## 📱 Sobre o Projeto

Dezlumbrante é um aplicativo mobile completo de e-commerce de maquiagem, desenvolvido com React Native e Expo. O app possui dois perfis de usuário (Admin e Cliente), com funcionalidades específicas para cada um, além de sincronização de dados com um backend RESTful.

---

## 🎯 Funcionalidades

### 👑 Admin

* ✅ CRUD completo de produtos (Criar, Ler, Atualizar, Deletar)
* ✅ Gerenciamento de categorias
* ✅ Visualização de todos os produtos cadastrados
* ✅ Interface exclusiva para administrador

### 👤 Cliente

* ✅ Visualização de catálogo de produtos
* ✅ Adicionar/remover produtos do carrinho
* ✅ Favoritar produtos ❤️
* ✅ Finalizar pedido

### 🔧 Gerais

* ✅ Autenticação com JWT
* ✅ Sincronização com backend RESTful
* ✅ Integração com Makeup API (produtos externos)
* ✅ Banco de dados local SQLite (offline-first)
* ✅ Cache de dados para modo offline

---

## 🏗️ Arquitetura do Projeto

```bash id="estrutura"
dezlumbrante/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── database.js
│   └── server.js
│
├── src/
│   ├── components/
│   ├── context/
│   ├── screens/
│   └── services/
│
└── package.json
```

---

## 🚀 Tecnologias Utilizadas

### Frontend

* React Native (Expo)
* React Navigation
* Expo SQLite
* Axios
* AsyncStorage

### Backend

* Node.js
* Express
* SQLite3
* Crypto

### APIs Integradas

* Makeup API

---

## 📦 Instalação e Execução

### Pré-requisitos

* Node.js (v18 ou superior)
* npm ou yarn
* Expo Go (celular ou emulador)
* Git

### 🔹 Clone o repositório

```bash id="clone"
git clone https://github.com/rangelisa/projeto_mobile.git
cd projeto_mobile
```

### 🔹 Instale dependências

```bash id="instalar"
npm install
cd backend
npm install
cd ..
```

### 🔹 Configure o backend

```js id="config"
const SEU_BACKEND_URL = 'http://SEU_IP:3000/api';
```

### 🔹 Execute o backend

```bash id="backend"
cd backend
npm run dev
```

### 🔹 Execute o app

```bash id="app"
npx expo start -c
```

---

## 🔐 Credenciais de Acesso

| Perfil  | Email                                                   | Senha         |
| ------- | ------------------------------------------------------- | ------------- |
| Admin   | [admin@dezlumbrante.com](mailto:admin@dezlumbrante.com) | admin123      |
| Cliente | Cadastre-se no app                                      | A sua escolha |

---

## 📱 Telas do Aplicativo

### Admin

| Tela         | Descrição                |
| ------------ | ------------------------ |
| Login        | Autenticação de usuários |
| Admin Home   | Lista de produtos        |
| Produto Form | Criar/editar produtos    |

### Cliente

| Tela           | Descrição       |
| -------------- | --------------- |
| Login          | Autenticação    |
| Cadastro       | Criar conta     |
| Cliente Home   | Catálogo        |
| Produto Detail | Detalhes        |
| Carrinho       | Itens           |
| Favoritos      | Produtos salvos |

---

## 🗄️ Endpoints da API

| Método | Endpoint            | Descrição         |
| ------ | ------------------- | ----------------- |
| POST   | /api/auth/cadastrar | Cadastro          |
| POST   | /api/auth/login     | Login             |
| GET    | /api/auth/validar   | Validar token     |
| POST   | /api/auth/logout    | Logout            |
| GET    | /api/produtos       | Listar produtos   |
| POST   | /api/produtos       | Criar produto     |
| PUT    | /api/produtos/:id   | Atualizar         |
| DELETE | /api/produtos/:id   | Deletar           |
| GET    | /api/categorias     | Listar categorias |
| POST   | /api/sync/full      | Sincronizar       |
| GET    | /api/sync/all-data  | Todos dados       |

---

## 🔄 Sincronização de Dados

* App → Backend: envio de dados
* Backend → App: recebimento
* API externa → App: importação

---

## 📊 Geração de Dados em JSON

### 📦 Produtos

```json id="prod_json"
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Base Líquida Matte",
      "categoria": "Pele",
      "preco": 59.9,
      "descricao": "Alta cobertura e longa duração",
      "imagem": null,
      "quantidade": 20,
      "created_at": "2026-04-30 10:00:00",
      "updated_at": "2026-04-30 10:00:00"
    }
  ],
  "total": 1
}
```

### 🗂️ Categorias

```json id="cat_json"
[
  {
    "id": 1,
    "nome": "Boca",
    "descricao": "Produtos para os lábios",
    "cor": "#E91E8C",
    "icone": "💄",
    "created_at": "2026-04-30 10:00:00"
  }
]
```

### 🧾 Vendas / Pedidos

```json id="vendas_json"
[
  {
    "id": 1,
    "usuario_id": 2,
    "total": 89.8,
    "data": "2026-04-30",
    "itens": [
      {
        "produto_id": 1,
        "nome": "Base Líquida Matte",
        "quantidade": 1,
        "preco_unitario": 59.9
      },
      {
        "produto_id": 2,
        "nome": "Batom Vermelho",
        "quantidade": 1,
        "preco_unitario": 29.9
      }
    ]
  }
]
```

### 👤 Autenticação

```json id="auth_json"
{
  "usuario": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@dezlumbrante.com",
    "tipo": "admin"
  },
  "token": "token_gerado",
  "expira_em": "2026-05-07T10:00:00.000Z"
}
```

### 🔄 Validação de Token (GET /api/auth/validar)

```json
{
  "usuario": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@dezlumbrante.com",
    "tipo": "admin"
  }
}
```

### 🔄 Sincronização (GET /api/sync/all-data)

```json
{
  "produtos": [
    {
      "id": 1,
      "nome": "Base Líquida Matte",
      "categoria": "Pele",
      "preco": 59.9,
      "descricao": "Alta cobertura",
      "imagem": null,
      "quantidade": 20,
      "created_at": "2026-04-30 10:00:00",
      "updated_at": "2026-04-30 10:00:00"
    }
  ],
  "categorias": [
    {
      "id": 1,
      "nome": "Boca",
      "descricao": "Produtos para os lábios",
      "cor": "#E91E8C",
      "icone": "💄",
      "created_at": "2026-04-30 10:00:00"
    }
  ]
}
```


---

## 📈 Uso para Dashboard

* 💰 Faturamento
* 📦 Estoque
* 🏆 Produtos mais vendidos
* 📊 Análise por categoria

---

## 📊 Banco de Dados

### Local

* produtos
* produtos_api
* config

### Backend

* usuarios
* sessoes
* produtos
* categorias
* sync_logs

---

## 🛠️ Scripts

### Frontend

```bash id="scripts_front"
npm start
npm run android
npm run ios
npm run web
```

### Backend

```bash id="scripts_back"
cd backend
npm run dev
npm start
```
