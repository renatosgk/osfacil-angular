# OS Fácil — Frontend (Angular)

Interface web para gestão de ordens de serviço em oficinas automotivas.  
Desenvolvida com **Angular 21**, componentes standalone, **Angular Signals** e **TailwindCSS 4**.

---

## Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Angular | 21.2.0 | Framework principal |
| TypeScript | 5.9 | Linguagem tipada |
| RxJS | 7.8 | Programação reativa |
| TailwindCSS | 4.x | Estilização utilitária |
| Angular Signals | — | Reatividade granular de estado |
| Angular Router | — | Navegação e guards de rota |
| Angular Forms | — | Formulários reativos |

---

## Pré-requisitos

- **Node.js** v18+ (`node --version`)
- **npm** v9+ (`npm --version`)
- **Angular CLI** v21+ (`npm i -g @angular/cli`)
- Backend **OS Fácil API** rodando em `http://localhost:8081`

---

## Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd ordem-servico-angular

# 2. Instale as dependências
npm install
```

---

## Executando em desenvolvimento

```bash
npm start
# ou
ng serve
```

A aplicação abrirá em `http://localhost:4200`  
O hot-reload recarrega automaticamente ao salvar arquivos.

---

## Configuração do proxy

O arquivo `proxy.conf.json` redireciona todas as chamadas `/api/*` para o backend,  
evitando problemas de CORS em desenvolvimento:

```json
{
  "/api": {
    "target": "http://localhost:8081",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": { "^/api": "" }
  }
}
```

> Se mudar a porta do backend, atualize o `target` aqui.

---

## Primeiro acesso

1. Suba o backend — ele criará automaticamente o admin padrão
2. Acesse `http://localhost:4200`
3. Faça login com:
   - **E-mail:** `admin@osfacil.com`
   - **Senha:** `Admin@123`
4. Para criar funcionários e admins, clique nas abas **"Funcionário"** ou **"Admin"** na tela de login enquanto estiver logado como administrador

---

## Funcionalidades por perfil

### Cliente (`ROLE_CLIENTE`)
- Ver suas próprias Ordens de Serviço
- Consultar veículos
- Registrar pagamentos
- Usar o Assistente de Mecânica (IA)

### Funcionário (`ROLE_FUNCIONARIO`)
- Dashboard com métricas gerais
- Gestão completa de OS (criar, editar, alterar status, exportar PDF)
- Gerenciar clientes, veículos, produtos, itens e pagamentos
- Assistente de mecânica com IA

### Administrador (`ROLE_ADMIN`)
- Tudo do funcionário
- Cadastrar novos funcionários
- Cadastrar novos administradores

---

## Rotas da aplicação

| Rota | Acesso | Descrição |
|---|---|---|
| `/login` | Público | Login, cadastro de cliente, funcionário e admin |
| `/dashboard` | Staff | Métricas e visão geral |
| `/ordem-servicos` | Todos | Lista de OS |
| `/ordem-servicos/:id` | Todos | Detalhes, itens e pagamentos de uma OS |
| `/clientes` | Staff | CRUD de clientes |
| `/funcionarios` | Staff | CRUD de funcionários |
| `/veiculos` | Todos | CRUD de veículos |
| `/produtos` | Staff | CRUD de produtos |
| `/item-produtos` | Staff | Itens vinculados às OS |
| `/pagamentos` | Todos | Listagem e registro de pagamentos |
| `/assistente` | Todos | Chat com assistente de mecânica |
| `/registro-funcionario` | Admin | Formulário de cadastro de funcionário |
| `/registro-admin` | Admin | Formulário de cadastro de administrador |

---

## Estrutura do projeto

```
src/
├── app/
│   ├── core/
│   │   ├── constants/
│   │   │   └── api.constants.ts        # URL base da API
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Redireciona não autenticados
│   │   │   └── role.guard.ts           # staffGuard e adminGuard
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts     # Injeta Bearer token em todas as requisições
│   │   └── services/
│   │       ├── auth.service.ts         # Login, logout, signals de role
│   │       ├── storage.service.ts      # localStorage com prefixo osfacil_
│   │       ├── notification.service.ts # Toast de sucesso/erro
│   │       ├── ordem-servico.service.ts
│   │       ├── cliente.service.ts
│   │       ├── funcionario.service.ts
│   │       ├── veiculo.service.ts
│   │       ├── produto.service.ts
│   │       ├── item-produto.service.ts
│   │       └── pagamento.service.ts
│   │
│   ├── features/
│   │   ├── auth/                       # Login + cadastros (4 abas)
│   │   ├── layout/                     # Shell com sidebar reativa
│   │   ├── dashboard/                  # Cards de métricas (staff)
│   │   ├── ordem-servicos/             # Lista e detalhes de OS
│   │   ├── clientes/                   # CRUD de clientes
│   │   ├── funcionarios/               # CRUD de funcionários
│   │   ├── veiculos/                   # CRUD de veículos
│   │   ├── produtos/                   # CRUD de produtos
│   │   ├── item-produtos/              # Itens de OS
│   │   ├── pagamentos/                 # Pagamentos
│   │   ├── assistente/                 # Chat com IA
│   │   ├── registro-funcionario/       # Formulário de novo funcionário
│   │   └── registro-admin/             # Formulário de novo admin
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   └── status-badge/           # Badge colorido de status da OS
│   │   ├── interfaces/
│   │   │   └── entities.ts             # Interfaces TypeScript de todas as entidades
│   │   └── utils/
│   │       └── http-error.util.ts      # Extrai mensagem de erro da API
│   │
│   ├── app.routes.ts                   # Definição de rotas com guards
│   └── app.config.ts                   # Configuração global (HTTP, Router)
│
├── public/
│   ├── logo.png                        # Logo da oficina
│   ├── mascote.png                     # Mascote — tela de login
│   └── mascote-logo.png                # Mascote — cadastro de cliente
│
└── proxy.conf.json                     # Proxy de desenvolvimento para o backend
```

---

## Arquitetura e padrões

### Angular Signals
O estado de autenticação usa sinais reativos (`signal`, `computed`):
```typescript
private readonly _role = signal<string | null>(null);
readonly isCliente  = computed(() => this._role() === 'ROLE_CLIENTE');
readonly isStaff    = computed(() => this.isFuncionario() || this.isAdmin());
```
Isso garante que menus, guards e chamadas de API reajam instantaneamente à mudança de role após o login.

### Guards de rota
- `authGuard` — redireciona para `/login` se não autenticado
- `staffGuard` — redireciona para `/ordem-servicos` se não for staff
- `adminGuard` — redireciona para `/ordem-servicos` se não for admin

### Proteção em componentes
Chamadas a endpoints restritos são protegidas no nível do componente:
```typescript
if (this.auth.isStaff()) {
  this.clienteService.list().subscribe(...);
}
```

### HATEOAS
Respostas do backend retornam `CollectionModel` com `_embedded`.  
Os serviços extraem o array automaticamente:
```typescript
map(r => r?._embedded ? r._embedded[Object.keys(r._embedded)[0]] : [])
```

---

## Build para produção

```bash
ng build --configuration production
```

Os arquivos gerados ficam em `dist/osfacil/`.

---

## Autores

| Nome | RM |
|---|---|
| Fabio H S Eduardo | 560416 |
| Gabriel WU Castro | 560210 |
| Renato Kenji Sugaki | 559810 |

Projeto desenvolvido para a disciplina **Java Advanced — FIAP**

**Aplicação em produção:** https://osfacil-angular.vercel.app

**Vídeo de demonstração:** https://youtu.be/bFmv3Q1tFgw
