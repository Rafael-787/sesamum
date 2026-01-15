# Sesamum

> Plataforma de Credenciamento e Gerenciamento de Equipe para Eventos

Sesamum é um sistema abrangente de gerenciamento de eventos projetado para credenciamento e rastreamento de equipes de eventos. A plataforma permite o gerenciamento eficiente de projetos, eventos, empresas e operações de check-in/out de funcionários com controle de acesso baseado em funções.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Stack Tecnológico](#stack-tecnológico)
- [Começando](#começando)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Schema do Banco de Dados](#schema-do-banco-de-dados)
- [Documentação da API](#documentação-da-api)
- [Diretrizes de Desenvolvimento](#diretrizes-de-desenvolvimento)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Visão Geral

Sesamum fornece uma solução robusta para organizadores de eventos gerenciarem:

- Múltiplos projetos com eventos associados
- Relacionamentos entre empresas (produção vs. prestadores de serviço)
- Credenciamento e atribuição de funcionários
- Operações de check-in/check-out em tempo real
- Controle de acesso baseado em funções (Admin, Empresa, Controle)

## ✨ Funcionalidades

### Funcionalidade Principal

- **Gerenciamento de Projetos**: Crie e gerencie projetos de eventos com rastreamento de status
- **Gerenciamento de Eventos**: Agende e organize eventos com intervalos de datas e localizações
- **Gerenciamento de Empresas**: Rastreie empresas de produção e serviços
- **Gerenciamento de Funcionários**: Registre e atribua funcionários aos eventos
- **Sistema de Check-in/out**: Rastreamento de presença de funcionários em tempo real
- **Funções de Usuário**: Sistema de controle de acesso em três níveis

### Funcionalidades do Dashboard

- Métricas e análises em tempo real
- Visualização de calendário interativo com visualização de eventos
- Rastreamento de atividades recentes
- Design responsivo para mobile e desktop
- Interface moderna com Tailwind CSS e componentes Radix UI

## 🏗️ Arquitetura

Sesamum segue uma arquitetura full-stack moderna com clara separação de responsabilidades:

```
┌─────────────────┐      ┌──────────────────┐
│   React 19 +    │◄────►│   Django 6.0 +   │
│   TypeScript    │ HTTP │   Django REST    │
│   Dashboard     │      │   Framework      │
└─────────────────┘      └──────────────────┘
                                    │
                                    ▼
                         ┌──────────────────┐
                         │   MySQL 8.0      │
                         │   Database       │
                         └──────────────────┘
```

### Arquitetura Backend

- **Framework**: Django 6.0 com Django REST Framework 3.14
- **Autenticação**: Autenticação baseada em JWT usando simplejwt
- **Banco de Dados**: MySQL 8.0 (SQLite3 para desenvolvimento)
- **Versionamento de API**: Todos os endpoints sob `/api/v1/`
- **Permissões**: Permissões personalizadas baseadas em funções aplicadas no servidor

### Arquitetura Frontend

- **Framework**: React 19 com TypeScript 5.9
- **Ferramenta de Build**: Vite 7
- **Roteamento**: React Router v7
- **Gerenciamento de Estado**: Context API
- **Estilização**: Tailwind CSS v4
- **Componentes UI**: Primitivos Radix UI
- **Cliente HTTP**: Axios

## 🛠️ Stack Tecnológico

### Backend

- **Python**: 3.x
- **Django**: 6.0
- **Django REST Framework**: 3.14
- **djangorestframework-simplejwt**: Autenticação JWT
- **MySQL**: 8.0 (Produção) / SQLite3 (Desenvolvimento)

### Frontend

- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **Vite**: 7.2.4
- **React Router**: 7.11.0
- **Tailwind CSS**: 4.1.18
- **FullCalendar**: 6.1.20
- **Day.js**: 1.11.19
- **Lucide React**: 0.562.0
- **Radix UI**: 1.4.3

## 🚀 Começando

### Pré-requisitos

- Python 3.x
- Node.js 18+ e npm
- MySQL 8.0 (para produção) ou SQLite3 (para desenvolvimento)
- Git

### Configuração do Backend

1. **Clone o repositório**

   ```bash
   git clone https://github.com/yourusername/sesamum.git
   cd sesamum
   ```

2. **Navegue até o diretório backend**

   ```bash
   cd backend
   ```

3. **Crie e ative o ambiente virtual**

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Instale as dependências**

   ```bash
   pip install -r requirements.txt
   ```

5. **Configure as variáveis de ambiente**

   ```bash
   # Copie .env.example para .env e configure
   cp ../.env.example .env
   ```

6. **Execute as migrações**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Crie um superusuário**

   ```bash
   python manage.py createsuperuser
   ```

8. **Execute o servidor de desenvolvimento**

   ```bash
   python manage.py runserver
   ```

   A API backend estará disponível em `http://localhost:8000`

### Configuração do Frontend

1. **Navegue até o diretório dashboard**

   ```bash
   cd dashboard
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   # Crie o arquivo .env para configuração do frontend
   cp .env.example .env
   ```

4. **Execute o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

   O dashboard estará disponível em `http://localhost:5173`

### Testes

**Testes do Backend**

```bash
cd backend
python manage.py test
```

**Linting do Frontend**

```bash
cd dashboard
npm run lint
```

**Verificação de Tipos do Frontend**

```bash
cd dashboard
npm run type-check
```

## 📁 Estrutura do Projeto

```
Sesamum/
├── backend/                    # Backend Django
│   ├── api/                   # Configuração principal da API
│   │   ├── __init__.py
│   │   ├── settings.py        # Configurações do Django
│   │   ├── urls.py            # Roteamento de URLs
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── v1/                    # App API v1
│   │   ├── models.py          # Modelos do banco de dados
│   │   ├── views.py           # Views da API
│   │   ├── serializers.py     # Serializadores DRF
│   │   ├── admin.py           # Configuração do Django admin
│   │   └── migrations/        # Migrações do banco de dados
│   └── manage.py              # Script de gerenciamento do Django
│
├── dashboard/                  # Frontend React
│   ├── src/
│   │   ├── api/               # Camada de integração com API
│   │   ├── components/        # Componentes React
│   │   │   ├── event-details/ # Componentes de detalhes do evento
│   │   │   ├── layout/        # Componentes de layout (Sidebar, etc.)
│   │   │   ├── shared/        # Componentes compartilhados/reutilizáveis
│   │   │   └── ui/            # Componentes UI base
│   │   ├── context/           # Provedores de Context do React
│   │   ├── hooks/             # Hooks personalizados do React
│   │   ├── lib/               # Funções utilitárias
│   │   ├── pages/             # Componentes de página
│   │   ├── types/             # Definições de tipos TypeScript
│   │   ├── App.tsx            # Componente principal App
│   │   ├── main.tsx           # Ponto de entrada
│   │   ├── index.css          # Estilos globais
│   │   └── theme.css          # Tokens de tema
│   ├── public/                # Assets estáticos
│   ├── package.json           # Dependências NPM
│   ├── vite.config.ts         # Configuração do Vite
│   ├── tsconfig.json          # Configuração do TypeScript
│   └── tailwind.config.js     # Configuração do Tailwind
│
├── .env.example               # Template de variáveis de ambiente
└── README.md                  # Este arquivo
```

## 🗄️ Schema do Banco de Dados

O Schema também pode ser visualizado através desse [link.](https://app.brmodeloweb.com/#!/publicview/693f3527e3cf52c0abdf4634)

### Entidades Principais

#### `company`

- **id** (PK): Identificador único da empresa
- **name**: Nome da empresa
- **cnpj**: Número de registro da empresa brasileira (Único)

#### `users`

- **id** (PK): Identificador do usuário
- **name**: Nome completo do usuário
- **email**: Endereço de e-mail do usuário
- **role**: Função do usuário (`admin`, `company`, `control`)
- **company_id** (FK): Referência à empresa
- **created_At** : Timestamp de quando foi criado

#### `staffs`

- **id** (PK): Identificador do funcionário
- **name**: Nome completo do funcionário
- **cpf**: CPF brasileiro (Único)
- **company_id** (FK): Referência à empresa
- **created_At** : Timestamp de quando foi criado

### Gerenciamento de Projetos e Eventos

#### `projects`

- **id** (PK): Identificador do projeto
- **name**: Nome do projeto
- **status**: Status do projeto (`open`, `close`)
- **company_id** (FK): Referência à empresa

#### `events`

- **id** (PK): Identificador do evento
- **name**: Nome do evento
- **date_begin**: Data de início do evento
- **date_end**: Data de término do evento
- **status**: Status do evento (`open`, `close`)
- **project_id** (FK): Referência ao projeto

### Tabelas de Relacionamento

#### `events_company`

- **id** (PK)
- **role**: Função da empresa (`production`, `service`)
- **event_id** (FK): Referência ao evento
- **company_id** (FK): Referência à empresa

#### `events_user`

- **id** (PK)
- **user_id** (FK): Referência ao usuário
- **event_id** (FK): Referência ao evento

#### `events_staff`

- **id** (PK)
- **event_id** (FK): Referência ao evento
- **staff_cpf** (FK): Referência ao CPF do funcionário

### Operações

#### `checks`

- **id** (PK): Identificador do check
- **action**: Tipo de ação (`check-in`, `check-out`)
- **timestamp**: Timestamp do check
- **events_staff_id** (FK): Referência à atribuição do funcionário ao evento
- **user_control_id** (FK): Referência ao usuário de controle

## 📡 Documentação da API

### Autenticação

Todos os endpoints da API (exceto login/registro) requerem autenticação JWT.

**Cabeçalhos:**

```
Authorization: Bearer <access_token>
```

**Expiração do Token:**

- Token de Acesso: 15 minutos
- Token de Atualização: 7 dias

### Versionamento da API

Todos os endpoints são versionados sob `/api/v1/`

### Permissões

| Função      | Permissões                                                |
| ----------- | --------------------------------------------------------- |
| **Admin**   | Acesso CRUD completo a todos os recursos                  |
| **Company** | CRUD próprios funcionários, visualizar eventos atribuídos |
| **Control** | Operações de check-in/out apenas                          |

### Convenções de Serializadores

- **Full Serializers**: Dados completos do recurso para usuários autorizados
- **Minimal Serializers**: Dados limitados para exposição entre empresas
- Use `StaffMinimalSerializer` ao expor funcionários para empresas de produção

### Exemplos de Endpoints (A serem implementados)

```
POST   /api/v1/auth/login/
POST   /api/v1/auth/refresh/
GET    /api/v1/companies/
POST   /api/v1/companies/
GET    /api/v1/projects/
POST   /api/v1/projects/
GET    /api/v1/events/
POST   /api/v1/events/
GET    /api/v1/staff/
POST   /api/v1/staff/
POST   /api/v1/checks/
```

## 💻 Diretrizes de Desenvolvimento

### Desenvolvimento Backend

**Executando o Servidor:**

```bash
cd backend
python manage.py runserver
```

**Criando Migrações:**

```bash
python manage.py makemigrations
python manage.py migrate
```

**Executando Testes:**

```bash
python manage.py test
```

**Variáveis de Ambiente:**
Configure no `.env`:

- Credenciais do banco de dados
- Chave secreta
- Origens CORS
- Configurações JWT

### Desenvolvimento Frontend

**Iniciando o Servidor de Desenvolvimento:**

```bash
cd dashboard
npm run dev
```

**Build para Produção:**

```bash
npm run build
```

**Linting:**

```bash
npm run lint
```

**Verificação de Tipos:**

```bash
npm run type-check
```

### Convenções de Código

#### Backend

- Siga as melhores práticas do Django
- Todos os endpoints da API devem ser versionados (`/api/v1/`)
- Use serializadores `Minimal` para dados entre empresas
- Aplique permissões nas views
- Escreva testes para todas as novas funcionalidades

#### Frontend

- Use TypeScript para todos os novos componentes
- Defina tipos em `src/types/index.ts`
- Mantenha os tipos sincronizados com os modelos do backend
- Use Context API para estado global
- Abstraia chamadas de API em `src/api/`
- Use Radix UI para componentes interativos
- Siga os padrões de componentes existentes

### Estrutura de Componentes

```tsx
// UI compartilhada em components/shared/
// Componentes de layout em components/layout/
// Componentes de página em pages/
// Primitivos UI base em components/ui/
```

### Gerenciamento de Estado

- Use Context API para autenticação e estado global
- Evite Redux a menos que seja absolutamente necessário
- Aproveite os hooks do React para estado local

### Integração com API

- Todas as chamadas de API abstratas em `src/api/`
- Use Axios para requisições HTTP
- Tokens JWT gerenciados no AuthContext
- Tratamento de erros na camada de API

---

**Nota para Agentes de IA:**

- Sempre respeite o controle de acesso baseado em funções e convenções de serializadores
- Em caso de dúvida, verifique os arquivos referenciados para padrões
- Mantenha os tipos do backend e frontend sincronizados
- Use scripts do projeto para builds/testes; não assuma padrões
