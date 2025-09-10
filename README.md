# 📚 API Node.js - Gerenciamento de Cursos (Projeto Final)

Uma API REST moderna construída com **Fastify**, **TypeScript**, **Drizzle ORM** e **PostgreSQL** para gerenciamento de cursos online, com autenticação via **JWT** e controle de acesso por papéis (student/instructor).

## 🚀 Tecnologias Utilizadas

- **[Fastify](https://fastify.dev/)** - Framework web rápido e eficiente
- **[TypeScript](https://www.typescriptlang.org/)** - Superset do JavaScript com tipagem estática
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM TypeScript-first para PostgreSQL
- **[PostgreSQL 17](https://www.postgresql.org/)** - Banco de dados relacional
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript-first
- **[Docker](https://www.docker.com/)** - Containerização do banco de dados
- **[Scalar](https://scalar.com/)** - Documentação interativa da API
- **[JWT](https://jwt.io/)** - Autenticação stateless
- **[argon2](https://github.com/ranisalt/node-argon2)** - Hash de senhas
- **[Vitest](https://vitest.dev/)** - Testes automatizados

## 📋 Funcionalidades

- ✅ **Autenticação** - Login (`/sessions`) com emissão de token JWT
- ✅ **Controle de acesso** - Autorização por perfil (`student`/`instructor`)
- ✅ **Criar curso** - Endpoint protegido para criação de cursos (apenas `instructor`)
- ✅ **Listar cursos** - Endpoint protegido com busca e paginação (apenas `instructor`)
- ✅ **Buscar curso por ID** - Endpoint protegido para qualquer usuário autenticado
- ✅ **Validação de dados** - Validação robusta usando Zod
- ✅ **Documentação interativa** - Interface Scalar para testes da API
- ✅ **Banco PostgreSQL** - Persistência de dados com PostgreSQL 17
- ✅ **Contagem de matrículas** - Total de matrículas por curso em listagem

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

    Note over Client,DB: Autenticação
    Client->>API: POST /sessions { email, password }
    API->>DB: Verifica usuário e senha (argon2)
    API-->>Client: 200 { token }

    Note over Client,DB: Criação de Curso (protegido - instructor)
    Client->>API: POST /courses { title: "Curso X" }
    API->>API: Verifica Authorization (JWT)
    API->>Validator: Validar dados
    Validator-->>API: Dados válidos
    API->>ORM: Insert course
    ORM->>DB: INSERT INTO courses
    DB-->>ORM: Course created
    ORM-->>API: Course object
    API-->>Client: 201 { courseId: "uuid" }

    Note over Client,DB: Listagem de Cursos (protegido - instructor)
    Client->>API: GET /courses
    API->>API: Verifica Authorization (JWT)
    API->>ORM: Select all courses (busca/paginação)
    ORM->>DB: SELECT * FROM courses
    DB-->>ORM: Courses array
    ORM-->>API: Courses data
    API-->>Client: 200 { courses: [...] }

    Note over Client,DB: Busca por ID (protegido - autenticado)
    Client->>API: GET /courses/:id
    API->>API: Verifica Authorization (JWT)
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
JWT_SECRET="uma_chave_segura_bem_grande"
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

### 6. (Opcional) Popule o banco com dados de exemplo

```bash
npm run db:seed
```

### 7. Inicie o servidor

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

| Método | Endpoint       | Descrição                                              | Body                                                 | Auth                   |
| ------ | -------------- | ------------------------------------------------------ | ---------------------------------------------------- | ---------------------- | ---------------------- |
| `POST` | `/sessions`    | Autenticação e emissão de token                        | `{ "email": "string", "password": "string(min 6)" }` | -                      |
| `GET`  | `/courses`     | Lista cursos com busca/paginação e total de matrículas | `search?`, `orderBy? (id                             | title)`, `page?`       | JWT (role: instructor) |
| `POST` | `/courses`     | Cria um novo curso                                     | `{ "title": "string(min 5)" }`                       | JWT (role: instructor) |
| `GET`  | `/courses/:id` | Busca curso por ID                                     | -                                                    | JWT                    |

### Exemplos de Uso

#### Login (obtenção do token)

```bash
curl -X POST http://localhost:3333/sessions \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "123456"}'
```

Resposta esperada:

```json
{ "token": "<JWT>" }
```

Importante: envie o token no header `Authorization` como texto puro (sem "Bearer "), conforme implementação atual.

#### Criar Curso

```bash
curl -X POST http://localhost:3333/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: <JWT>" \
  -d '{"title": "Curso de Docker"}'
```

#### Listar Cursos (com busca e paginação)

```bash
curl "http://localhost:3333/courses?search=docker&orderBy=title&page=1" \
  -H "Authorization: <JWT>"
```

#### Buscar Curso por ID

```bash
curl http://localhost:3333/courses/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: <JWT>"
```

## 📁 Estrutura do Projeto

```
apinode/
├── src/
│   ├── @types/fastify.d.ts        # Tipagem para request.user
│   ├── app.ts                     # Setup do servidor, Swagger e docs
│   ├── server.ts                  # Bootstrap
│   ├── database/
│   │   ├── client.ts              # Cliente Drizzle ORM
│   │   ├── schema.ts              # Schemas: users, courses, enrollments
│   │   └── seed.ts                # Seed de usuários/cursos/matrículas
│   ├── routes/
│   │   ├── hooks/
│   │   │   ├── check-request-jwt.ts  # Valida e injeta JWT em request.user
│   │   │   └── check-user-role.ts    # Verifica papel do usuário
│   │   ├── create-courses.ts      # POST /courses (instructor)
│   │   ├── get-courses.ts         # GET /courses (instructor)
│   │   ├── get-courses-by-id.ts   # GET /courses/:id (autenticado)
│   │   └── login.ts               # POST /sessions
│   └── utils/
│       └── get-authenticated-user-from-request.ts
├── docker-compose.yml             # Configuração PostgreSQL
├── drizzle/                       # Migrações geradas
├── drizzle.config.ts              # Configuração Drizzle
└── package.json                   # Dependências e scripts
```

## 🗄️ Banco de Dados

### Schemas

#### Tabela `users`

| Campo      | Tipo | Descrição                           |
| ---------- | ---- | ----------------------------------- |
| `id`       | UUID | Chave primária (auto-gerada)        |
| `name`     | TEXT | Nome do usuário                     |
| `email`    | TEXT | E-mail único                        |
| `password` | TEXT | Hash Argon2                         |
| `role`     | ENUM | `student` (default) ou `instructor` |

#### Tabela `courses`

| Campo         | Tipo | Descrição                            |
| ------------- | ---- | ------------------------------------ |
| `id`          | UUID | Chave primária (auto-gerada)         |
| `title`       | TEXT | Título do curso (obrigatório, único) |
| `description` | TEXT | Descrição opcional                   |

#### Tabela `enrollments`

| Campo       | Tipo        | Descrição            |
| ----------- | ----------- | -------------------- |
| `id`        | UUID        | Chave primária       |
| `userId`    | UUID        | FK para `users.id`   |
| `courseId`  | UUID        | FK para `courses.id` |
| `createdAt` | TIMESTAMPTZ | Data de criação      |

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

Você pode usar o arquivo `requisicoes.http` ou rodar a suíte de testes automatizados.

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

### Rodar testes

```bash
npm test
```

## 📦 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor em modo desenvolvimento
npm run db:generate  # Gera migrações do banco
npm run db:migrate   # Aplica migrações no banco
npm run db:seed      # Popula o banco com dados fictícios
npm test             # Roda os testes com Vitest
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

Após subir o banco com Docker, garanta que o `.env` possui `DATABASE_URL` e `JWT_SECRET` configurados.

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
