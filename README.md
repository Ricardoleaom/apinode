# 📚 API Node.js - Gerenciamento de Cursos

Uma API REST moderna construída com **Fastify**, **TypeScript**, **Drizzle ORM** e **PostgreSQL** para gerenciamento de cursos online.

## 🚀 Tecnologias Utilizadas

- **[Fastify](https://fastify.dev/)** - Framework web rápido e eficiente
- **[TypeScript](https://www.typescriptlang.org/)** - Superset do JavaScript com tipagem estática
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM TypeScript-first para PostgreSQL
- **[PostgreSQL 17](https://www.postgresql.org/)** - Banco de dados relacional
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript-first
- **[Docker](https://www.docker.com/)** - Containerização do banco de dados
- **[Scalar](https://scalar.com/)** - Documentação interativa da API

## 📋 Funcionalidades

- ✅ **Criar curso** - Endpoint para criação de novos cursos
- ✅ **Listar cursos** - Endpoint para listagem de todos os cursos
- ✅ **Buscar curso por ID** - Endpoint para busca específica de curso
- ✅ **Validação de dados** - Validação robusta usando Zod
- ✅ **Documentação interativa** - Interface Scalar para testes da API
- ✅ **Banco PostgreSQL** - Persistência de dados com PostgreSQL 17

## 🏗️ Arquitetura

```mermaid
graph TD
    A[Cliente HTTP] --> B[Fastify Server]
    B --> C{Validação Zod}
    C -->|Válido| D[Route Handler]
    C -->|Inválido| E[Erro 400]
    D --> F[Drizzle ORM]
    F --> G[(PostgreSQL 17)]
    G --> F
    F --> D
    D --> H[Resposta JSON]
    H --> A
    
    I[Scalar Docs] --> B
    J[Docker Compose] --> G
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style G fill:#e8f5e8
    style I fill:#fff3e0
```

## 🔄 Fluxo Principal da Aplicação

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant API as Fastify API
    participant Validator as Zod Validator
    participant ORM as Drizzle ORM
    participant DB as PostgreSQL

    Note over Client,DB: Criação de Curso
    Client->>API: POST /courses { title: "Curso X" }
    API->>Validator: Validar dados
    Validator-->>API: Dados válidos
    API->>ORM: Insert course
    ORM->>DB: INSERT INTO courses
    DB-->>ORM: Course created
    ORM-->>API: Course object
    API-->>Client: 201 { courseId: "uuid" }

    Note over Client,DB: Listagem de Cursos
    Client->>API: GET /courses
    API->>ORM: Select all courses
    ORM->>DB: SELECT * FROM courses
    DB-->>ORM: Courses array
    ORM-->>API: Courses data
    API-->>Client: 200 { courses: [...] }

    Note over Client,DB: Busca por ID
    Client->>API: GET /courses/:id
    API->>Validator: Validar UUID
    Validator-->>API: UUID válido
    API->>ORM: Select course by ID
    ORM->>DB: SELECT WHERE id = ?
    DB-->>ORM: Course or null
    alt Course found
        ORM-->>API: Course object
        API-->>Client: 200 { course: {...} }
    else Course not found
        ORM-->>API: null
        API-->>Client: 404 { message: "Curso não encontrado" }
    end
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ 
- **Docker** e **Docker Compose**
- **Git**

### 1. Clone o repositório

```bash
git clone https://github.com/Ricardoleaom/apinode.git
cd apinode
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/desafio"
```

### 4. Inicie o banco de dados

```bash
docker compose up -d
```

### 5. Execute as migrações

```bash
npm run db:generate
npm run db:migrate
```

### 6. Inicie o servidor

```bash
npm run dev
```

## 📡 Endpoints da API

### Base URL
```
http://localhost:3333
```

### Documentação Interativa
```
http://localhost:3333/docs
```

### Endpoints Disponíveis

| Método | Endpoint | Descrição | Body |
|--------|----------|-----------|------|
| `GET` | `/courses` | Lista todos os cursos | - |
| `POST` | `/courses` | Cria um novo curso | `{ "title": "string" }` |
| `GET` | `/courses/:id` | Busca curso por ID | - |

### Exemplos de Uso

#### Criar Curso
```bash
curl -X POST http://localhost:3333/courses \
  -H "Content-Type: application/json" \
  -d '{"title": "Curso de Docker"}'
```

#### Listar Cursos
```bash
curl http://localhost:3333/courses
```

#### Buscar Curso por ID
```bash
curl http://localhost:3333/courses/123e4567-e89b-12d3-a456-426614174000
```

## 📁 Estrutura do Projeto

```
apinode/
├── src/
│   ├── database/
│   │   ├── client.ts          # Cliente Drizzle ORM
│   │   └── schema.ts          # Schemas das tabelas
│   └── routes/
│       ├── create-courses.ts  # Rota POST /courses
│       ├── get-courses.ts     # Rota GET /courses
│       └── get-courses-by-id.ts # Rota GET /courses/:id
├── .drizzle/                  # Migrações geradas
├── docker-compose.yml         # Configuração PostgreSQL
├── drizzle.config.ts         # Configuração Drizzle
├── server.ts                 # Servidor principal
└── package.json              # Dependências e scripts
```

## 🗄️ Banco de Dados

### Schema da Tabela `courses`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária (auto-gerada) |
| `title` | TEXT | Título do curso (obrigatório) |

### Gerenciamento do Banco

```bash
# Visualizar dados no Drizzle Studio
npm run studio

# Gerar nova migração
npm run db:generate

# Aplicar migrações
npm run db:migrate
```

## 🧪 Testes da API

Use o arquivo `requisicoes.http` para testar os endpoints:

```http
### Criar curso
POST http://localhost:3333/courses
Content-Type: application/json

{
    "title": "Curso de Docker"
}

### Listar cursos
GET http://localhost:3333/courses

### Buscar curso por ID
GET http://localhost:3333/courses/80669304-a950-4c75-a58b-3e147455030c
```

## 📦 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor em modo desenvolvimento
npm run db:generate  # Gera migrações do banco
npm run db:migrate   # Aplica migrações no banco
npm run studio       # Abre Drizzle Studio
```

## 🐳 Docker

O projeto usa Docker Compose para o PostgreSQL:

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: desafio
    ports:
      - "5432:5432"
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Ricardo Leão**
- GitHub: [@Ricardoleaom](https://github.com/Ricardoleaom)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!