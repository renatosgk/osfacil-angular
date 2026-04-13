# OSFácil - Sistema de Gestão de Ordem de Serviços

Sistema web moderno desenvolvido em **Angular 21** para gestão completa de ordens de serviço, clientes, funcionários, produtos, veículos e pagamentos.

---

## Funcionalidades Principais

**Autenticação Segura** - Sistema de login com JWT e controle de acesso por função
**Gestão de Ordens de Serviço** - Criar, editar, visualizar e acompanhar ordens
**Gerenciamento de Clientes** - CRUD completo com histórico de serviços
**Administração de Funcionários** - Controle de equipe e atribuições
**Catálogo de Produtos/Itens** - Gestão de inventário e preços
**Registro de Veículos** - Vinculação de veículos aos clientes
**Gestão de Pagamentos** - Rastreamento e processamento de pagamentos
**Dashboard** - Visão geral com métricas principais
**Design Responsivo** - Funciona em desktop, tablet e mobile

---

## 🛠️ Requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** v18.0.0 ou superior
- **npm** v9.0.0 ou superior (incluído com Node.js)
- **Git** para controle de versão

Verificar versão instalada:
```bash
node --version
npm --version
```

---

## Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <seu-repositorio>
cd osfacil
```

### 2. Instale as Dependências

```bash
npm install
```

Isso instalará todas as dependências do projeto listadas em `package.json`.

### 3. Configure o Ambiente

O projeto usa arquivos de ambiente para configurações:

- **Development**: `src/environments/environment.development.ts`
- **Production**: `src/environments/environment.production.ts`

Exemplo de configuração:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4200/api'
};
```

### 4. Configure o Proxy (Desenvolvimento)

O arquivo `proxy.conf.json` redireciona requisições da API:

```json
{
  "/api": {
    "target": "https://osfacil.onrender.com",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```
## Executando a Aplicação

### Modo Desenvolvimento

```bash
ng serve --open
# ou
npm start
```

A aplicação abrirá automaticamente em `http://localhost:4200`

**Observação**: O servidor de desenvolvimento ativa automaticamente hot-reload, recarregando a página quando você faz alterações no código.


##  Estrutura do Projeto

```
src/
├── app/
│   ├── core/
│   │   ├── services/          # Serviços reutilizáveis
│   │   │   ├── auth.service.ts
│   │   │   ├── cliente.service.ts
│   │   │   ├── ordem-servico.service.ts
│   │   │   ├── produto.service.ts
│   │   │   ├── funcionario.service.ts
│   │   │   ├── veiculo.service.ts
│   │   │   ├── pagamento.service.ts
│   │   │   └── loading.service.ts
│   │   ├── guards/            # Guards de acesso
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/      # HTTP interceptors
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── api-fallback.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   └── constants/         # Constantes da aplicação
│   │       └── api.constants.ts
│   │
│   ├── features/              # Módulos de funcionalidades
│   │   ├── auth/              # Autenticação
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── clientes/          # Gestão de clientes
│   │   ├── funcionarios/      # Gestão de funcionários
│   │   ├── ordem-servicos/    # Gestão de ordens
│   │   ├── produtos/          # Catálogo de produtos
│   │   ├── item-produtos/     # Itens de ordem
│   │   ├── veiculos/          # Gestão de veículos
│   │   ├── pagamentos/        # Gestão de pagamentos
│   │   └── layout/            # Layout principal
│   │
│   ├── shared/                # Componentes compartilhados
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── interfaces/        # Interfaces TypeScript
│   │   └── utils/             # Funções utilitárias
│   │
│   ├── app.config.ts          # Configuração global da app
│   ├── app.routes.ts          # Definição de rotas
│   └── app.ts                 # Componente raiz
│
├── styles.scss                # Estilos globais
├── main.ts                    # Arquivo de entrada
└── environments/              # Configurações por ambiente
    ├── environment.ts
    ├── environment.development.ts
    └── environment.production.ts
```

---

## Autenticação e Segurança

### Sistema de Login

A aplicação utiliza autenticação baseada em **JWT (JSON Web Token)**:

1. Usuário faz login com email/CPF e senha
2. Servidor valida credenciais e retorna um token JWT
3. Token é armazenado em localStorage
4. Token é enviado a cada requisição via header `Authorization`
5. Servidor valida token e retorna dados solicitados

### Tipos de Usuários

- **Admin** - Acesso total ao sistema
- **Funcionário** - Acesso restrito aos registros da equipe
- **Cliente** - Acesso apenas a seus próprios pedidos (se aplicável)


### Armazenamento Seguro

- **Token**: Armazenado em localStorage com prefix `osfacil_token`
- **Usuário**: Dados do usuário armazenados em localStorage
- **Logout**: Limpa todos os dados ao fazer logout

---

## Integração com API

### URL Base da API

- **Desenvolvimento**: `http://localhost:4200/api` (via proxy)
- **Produção**: `https://osfacil.onrender.com`

### Endpoints Principais

```typescript
// Autenticação
POST   /login                      # Fazer login
POST   /register                   # Registrar novo cliente
POST   /register-funcionario       # Registrar novo funcionário

// Clientes
GET    /clientes                   # Listar clientes
POST   /clientes                   # Criar cliente
GET    /clientes/:id               # Obter detalhes
PUT    /clientes/:id               # Atualizar cliente
DELETE /clientes/:id               # Deletar cliente

// Funcionários
GET    /funcionarios               # Listar funcionários
POST   /funcionarios               # Criar funcionário
GET    /funcionarios/:id           # Obter detalhes
PUT    /funcionarios/:id           # Atualizar
DELETE /funcionarios/:id           # Deletar

// Ordens de Serviço
GET    /ordem-servicos             # Listar ordens
POST   /ordem-servicos             # Criar ordem
GET    /ordem-servicos/:id         # Obter detalhes
PUT    /ordem-servicos/:id         # Atualizar ordem
DELETE /ordem-servicos/:id         # Deletar ordem

// Produtos
GET    /produtos                   # Listar produtos
POST   /produtos                   # Criar produto
PUT    /produtos/:id               # Atualizar
DELETE /produtos/:id               # Deletar

// Itens de Produtos
GET    /item-produtos              # Listar itens
POST   /item-produtos              # Adicionar item

// Veículos
GET    /veiculos                   # Listar veículos
POST   /veiculos                   # Registrar veículo
PUT    /veiculos/:id               # Atualizar
DELETE /veiculos/:id               # Deletar

// Pagamentos
GET    /pagamentos                 # Listar pagamentos
POST   /pagamentos                 # Registrar pagamento
PUT    /pagamentos/:id             # Atualizar pagamento
DELETE /pagamentos/:id             # Deletar
```

---

## 📱 Uso da Aplicação

### Primeiro Acesso

1. Acesse a página de login
2. Entre com suas credenciais (email/CPF e senha)
3. Será redirecionado para o Dashboard

### Fluxo Típico de Ordem de Serviço

1. **Criar Ordem** - Novo → Ordem de Serviço
2. **Adicionar Cliente** - Selecione um cliente ou crie novo
3. **Adicionar Itens** - Selecione produtos/serviços
4. **Definir Valor** - Preço é calculado automaticamente
5. **Atribuir Funcionário** - Quem executará o serviço
6. **Registrar Pagamento** - Após conclusão
7. **Finalizar** - Marcar como concluído

### Autores do projeto:

Fabio H S Eduardo - RM560416

Gabriel WU Castro - RM560210

Renato Kenji Sugaki - RM559810

--- 

## Vídeo do projeto

Assista à demonstração do projeto no YouTube:  
https://youtu.be/bFmv3Q1tFgw

### desenvolvido para disciplina Java Advanced
