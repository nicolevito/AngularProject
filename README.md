# Alvarenga & Bittencourt — Sistema de Gestão para Escritório de Advocacia

Projeto de portfólio full-stack: um sistema de gestão completo para um escritório de advocacia fictício, cobrindo clientes, processos, prazos, agenda, documentos, financeiro, um dashboard executivo e um portal do cliente. Frontend em Angular consumindo uma API própria em FastAPI, com PostgreSQL.

## Como rodar

Requer Docker (para o backend + banco) e Node.js 20+ (recomendado 22+) para o frontend.

### 1. Backend + banco de dados

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Isso sobe o PostgreSQL e a API em `http://localhost:8000`. Na primeira subida, o banco é semeado automaticamente com dados de demonstração (clientes, processos, prazos, usuários etc.) — veja `backend/app/seed.py` e `backend/app/seed_data.json`. As migrações (`alembic upgrade head`) rodam sozinhas no start do container.

### 2. Frontend

```bash
npm install
ng serve
```

Acesse `http://localhost:4200`. Na tela de login, use um dos botões de **acesso rápido** (Advogado / Estagiário / Cliente) para entrar sem precisar digitar credenciais. Se preferir logar manualmente, a senha de todos os usuários demo é `123456` — os e-mails estão em `backend/app/seed_data.json`.

Para voltar ao estado inicial dos dados, use **"Resetar dados demo"** no menu do usuário (canto superior direito) — chama `POST /admin/resetar-demo`, que trunca e re-semeia as tabelas.

## Por que este domínio

Um escritório de advocacia exige, de forma natural, exatamente o tipo de lógica que mostra domínio real de Angular e não apenas um CRUD genérico: prazos processuais com regras de urgência, permissões diferentes por papel (advogado, estagiário, cliente), formulários com validação cruzada e assíncrona, e uma boa quantidade de dados relacionados entre si (cliente → processo → prazos/documentos/audiências/faturas).

## Papéis e permissões

| Papel | Acesso |
|---|---|
| **Advogado** | Acesso completo, incluindo Financeiro e criação/edição de processos |
| **Estagiário** | Mesmo acesso que o advogado, exceto Financeiro e criação/edição de processos (somente visualização) |
| **Cliente** | Portal próprio, somente leitura, restrito aos seus próprios processos e documentos |

As restrições são aplicadas em três camadas: autorização por papel na API (`require_roles` nos routers), guards funcionais na rota do frontend (`roleGuard`) e uma diretiva estrutural na UI (`*appHasRole`) que esconde ações que o papel atual não pode executar.

## Stack e decisões técnicas

### Frontend
- **Angular 22**, standalone components, Signals como mecanismo principal de estado local e reativo, novo control flow (`@if`/`@for`/`@switch`).
- **Angular Material** como base de UI, combinado com componentes próprios feitos à mão onde fazia sentido mostrar mais autoria (calendário mensal, timeline de andamentos, badges de status/urgência).
- **Reactive Forms** é o showcase central do projeto — ver `processo-form` (formulário com dois `FormArray`, validação cross-field e assíncrona) e `cliente-form` (formulário dinâmico Pessoa Física/Jurídica).
- **ng2-charts / Chart.js** no dashboard, carregado sob demanda (o provider dos gráficos vive nas rotas do dashboard, não no bootstrap da aplicação) para não pesar o bundle inicial.
- **Sem NgRx.** Estado global (usuário logado, coleções de dados) vive em services singleton com Signals — suficiente para o tamanho do projeto e mais idiomático no Angular atual. Cada data-access service estende `HttpCollection<T>`, uma base comum que mantém um `Signal<T[]>` sincronizado com a API (recarrega a lista após cada mutação).
- Autenticação via **JWT**: o token fica em `localStorage`, é injetado nas requisições por um `HttpInterceptor` (`authInterceptor`), que também padroniza mensagens de erro vindas da API e desloga o usuário automaticamente em respostas `401`.

### Backend
- **FastAPI** (async) + **SQLAlchemy 2.0** (async) + **PostgreSQL**, migrações com **Alembic**.
- Autenticação **JWT** (`python-jose`) com senhas hasheadas via **bcrypt**; endpoints de login normal (`/auth/login`) e de acesso rápido para demo (`/auth/login-rapido`, desligável via `ALLOW_DEMO_LOGIN=false`).
- Autorização por papel feita via dependency injection (`require_roles`) em cada router.
- Regras de integridade referencial (ex.: não deixar excluir um cliente com processos vinculados) são aplicadas no banco e traduzidas para respostas HTTP amigáveis por um exception handler global (`IntegrityError` → 409).
- Seed idempotente: popula o banco automaticamente se estiver vazio no startup da aplicação, e pode ser re-executado sob demanda pelo endpoint de reset usado no botão "Resetar dados demo".

## Destaques de Reactive Forms

- **`processo-form`**: um `FormGroup` com dois `FormArray` (partes do processo e prazos iniciais). O número do processo tem validação assíncrona de unicidade (debounce + verificação contra a API); o array de partes exige ao menos um autor e um réu (validador de array); e cada prazo inicial precisa vencer depois da data de abertura do processo — uma validação cross-field entre um `FormArray` filho e um campo do grupo pai.
- **`cliente-form`**: alterna entre Pessoa Física e Pessoa Jurídica sem recriar o formulário — todos os campos de ambos os tipos existem desde o início, e a troca de tipo apenas liga/desliga validadores (`setValidators`/`clearValidators`). O CEP tem validação assíncrona que também preenche o endereço automaticamente.

## Estrutura de pastas

```
src/app/
  core/           auth (JWT), modelos de domínio, configuração da API
  shared/         validadores, HttpCollection, componentes e diretivas reaproveitados entre features
  layout/         shell (sidenav responsivo), sidebar, topbar
  features/       um diretório por módulo de negócio (clientes, processos, prazos,
                  agenda, documentos, financeiro, dashboard, portal-cliente),
                  cada um com seus próprios data-access services e telas

backend/
  app/
    routers/      um router por recurso (auth, usuarios, clientes, processos, prazos,
                  audiencias, documentos, faturas, cep, admin)
    models.py     modelos SQLAlchemy
    schemas.py    schemas Pydantic (request/response)
    security.py   hashing de senha e emissão/validação de JWT
    seed.py        seed inicial e reset de dados demo
  alembic/        migrações do banco
```

Cada feature do frontend consome a API através do seu próprio `data-access/*.service.ts` — trocar de backend no futuro significa reescrever esses serviços, sem tocar nos componentes.

## Testes

```bash
ng test
```

Cobrem os validadores customizados (CPF/CNPJ com dígito verificador, cross-field, array-level), que são a parte do frontend com lógica não trivial o suficiente para justificar teste automatizado.

## Build de produção

```bash
ng build
```

Gera os artefatos em `dist/`. Como o frontend agora depende de uma API real, é preciso apontar `API_BASE_URL` (`src/app/core/config/api.config.ts`) para o backend implantado antes do build de produção.
