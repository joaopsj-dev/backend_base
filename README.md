# Backend Base - NestJS

Estrutura inicial para um backend em NestJS. Use este repositório como ponto de partida para novos projetos.

---

## ⚠️ Configuração Inicial Obrigatória

**Antes de começar**, substitua `project_name` / `projectname` pelo nome do seu projeto nos seguintes arquivos:

| Arquivo | O que alterar |
|---------|---------------|
| `package.json` | `"name": "project_name"` → `"name": "seu-projeto"` |
| `package-lock.json` | `"name": "project_name"` (em duas ocorrências) → `"name": "seu-projeto"` |
| `src/main.ts` | `.setTitle('project_name')` e `.addTag('project_name')` na configuração do Swagger |
| `docker-compose.yml` | `projectname_db`, `projectname_redis`, `POSTGRES_DB: projectname` |

> 💡 Dica: use a busca global do seu editor por `project_name` e `projectname` para localizar e alterar todos os valores.

---

## O que este projeto possui

### 🔐 Autenticação
- **JWT** com access token e refresh token
- Tokens armazenados em cookies **httpOnly** (mais seguros contra XSS)
- Endpoints: login, register, refresh, logout e me (usuário autenticado)
- Estratégia Passport JWT configurada

### 🛡️ Proteção por Roles
- `RolesGuard` para controle de acesso baseado em papéis
- Decorator `@Roles('admin', 'agent', 'client')` para proteger rotas
- Papéis definidos na entidade User: `admin`, `agent`, `client`

### 🚦 Rate Limiting (Throttler)
- Proteção contra abuso com limites configuráveis
- Múltiplos limites: curto (3 req/s), médio (20 req/10s), longo (100 req/min)

### 📬 Filas e Jobs (Redis + BullMQ)
- Filas assíncronas com BullMQ
- Worker dedicado para processar jobs de email
- Configuração de conexão Redis separada
- Script: `npm run start:worker-email` para iniciar o worker

### 📧 Módulo de Email
- Integração com **Mailtrap** (desenvolvimento) e **Nodemailer**
- Queue de envio de emails
- Interface de provedor para fácil troca de serviço

### 🗄️ Banco de Dados (TypeORM + PostgreSQL)
- TypeORM configurado
- Migrations para versionamento do schema
- Scripts: `migration:create`, `migration:run`, `migration:revert`
- Seed configurado (`npm run seed`)

### 🐳 Docker
- `docker-compose.yml` com PostgreSQL 15 e Redis 7
- Pronto para subir o ambiente local com um comando

### 📝 Validação
- **Zod** para validação de DTOs
- `ZodValidationPipe` para integração com NestJS
- Mensagens de erro padronizadas

### 📖 Documentação (Swagger)
- OpenAPI/Swagger em `/api/v1/doc`
- Decorators para documentar endpoints

### 🧪 Testes
- **Jest** configurado
- Testes unitários (`.spec.ts`)
- Testes e2e com Supertest
- Scripts: `npm run test`, `npm run test:watch`, `npm run test:cov`, `npm run test:e2e`

### ⚙️ Outros
- Prefixo global da API: `/api/v1`
- CORS configurável
- Configuração por ambiente (`.env.development`, `.env.production`, etc.)
- Estrutura modular (modules, entities, guards, pipes, decorators)

---

## Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Subir PostgreSQL e Redis (Docker)
```bash
docker-compose up -d
```

### 3. Configurar variáveis de ambiente
Copie o `.env.development` e ajuste conforme necessário (DATABASE_URL, JWT secrets, etc.).

### 4. Rodar migrations
```bash
npm run migration:run
```

### 5. Iniciar o servidor
```bash
npm run start:dev
```

### 6. (Opcional) Iniciar o worker de emails
Em outro terminal:
```bash
npm run start:worker-email
```

---

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run start:dev` | Servidor em modo watch |
| `npm run start:prod` | Servidor em produção |
| `npm run start:worker-email` | Worker para processar fila de emails |
| `npm run build` | Build para produção |
| `npm run test` | Rodar testes unitários |
| `npm run test:e2e` | Rodar testes e2e |
| `npm run test:cov` | Testes com cobertura |
| `npm run migration:run` | Executar migrations |
| `npm run migration:revert` | Reverter última migration |
| `npm run migration:create` | Criar nova migration |
| `npm run seed` | Popular banco com dados iniciais |
| `npm run lint` | Linter |

---

## Estrutura do projeto

```
src/
├── app/
│   ├── common/           # Guards, pipes, decorators, validações
│   └── modules/          # Módulos da aplicação (auth, email, etc.)
├── config/               # Configurações (Redis, etc.)
├── database/migrations/  # Migrations do TypeORM
├── entities/             # Entidades TypeORM
├── workers/              # Workers para processar filas
└── main.ts
```

---

## Licença

UNLICENSED
