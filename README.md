# Alvarenga & Bittencourt — Sistema de Gestão para Escritório de Advocacia

Projeto de portfólio construído em Angular para demonstrar domínio da linguagem/framework: um sistema de gestão completo para um escritório de advocacia fictício, cobrindo clientes, processos, prazos, agenda, documentos, financeiro, um dashboard executivo e um portal do cliente.

Todo o "backend" é simulado no próprio navegador — não há servidor para configurar. Clone, instale as dependências e rode.

## Como rodar

Requer Node.js 20+ (recomendado 22+).

```bash
npm install
ng serve
```

Acesse `http://localhost:4200`. Na tela de login, use um dos botões de **acesso rápido** (Advogado / Estagiário / Cliente) para entrar sem precisar digitar credenciais. Se preferir logar manualmente, a senha de todos os usuários demo é `123456` — os e-mails estão em `src/app/core/mock-data/db/usuarios.seed.ts`.

Os dados ficam persistidos no `localStorage` do navegador entre recarregamentos. Para voltar ao estado inicial, use **"Resetar dados demo"** no menu do usuário (canto superior direito).

## Por que este domínio

Um escritório de advocacia exige, de forma natural, exatamente o tipo de lógica que mostra domínio real de Angular e não apenas um CRUD genérico: prazos processuais com regras de urgência, permissões diferentes por papel (advogado, estagiário, cliente), formulários com validação cruzada e assíncrona, e uma boa quantidade de dados relacionados entre si (cliente → processo → prazos/documentos/audiências/faturas).

## Papéis e permissões

| Papel | Acesso |
|---|---|
| **Advogado** | Acesso completo, incluindo Financeiro e criação/edição de processos |
| **Estagiário** | Mesmo acesso que o advogado, exceto Financeiro e criação/edição de processos (somente visualização) |
| **Cliente** | Portal próprio, somente leitura, restrito aos seus próprios processos e documentos |

As restrições são aplicadas em duas camadas: guards funcionais na rota (`roleGuard`) e uma diretiva estrutural na UI (`*appHasRole`) que esconde ações que o papel atual não pode executar.

## Stack e decisões técnicas

- **Angular 22**, standalone components, Signals como mecanismo principal de estado local e reativo, novo control flow (`@if`/`@for`/`@switch`).
- **Sem backend real.** Um `MockDbService` simula uma API REST em memória (latência de rede aleatória incluída) com persistência em `localStorage`, para o projeto funcionar sozinho em qualquer lugar — inclusive hospedagem estática. Uma alternativa avaliada e descartada foi usar `angular-in-memory-web-api` interceptando `HttpClient`; optei pela abordagem mais simples e direta.
- **Angular Material** como base de UI, combinado com componentes próprios feitos à mão onde fazia sentido mostrar mais autoria (calendário mensal, timeline de andamentos, badges de status/urgência).
- **Reactive Forms** é o showcase central do projeto — ver `processo-form` (formulário com dois `FormArray`, validação cross-field e assíncrona) e `cliente-form` (formulário dinâmico Pessoa Física/Jurídica).
- **ng2-charts / Chart.js** no dashboard, carregado sob demanda (o provider dos gráficos vive nas rotas do dashboard, não no bootstrap da aplicação) para não pesar o bundle inicial.
- **Sem NgRx.** Estado global (usuário logado, coleções de dados) vive em services singleton com Signals — suficiente para o tamanho do projeto e mais idiomático no Angular atual.

## Destaques de Reactive Forms

- **`processo-form`**: um `FormGroup` com dois `FormArray` (partes do processo e prazos iniciais). O número do processo tem validação assíncrona de unicidade (debounce + verificação simulada no "banco"); o array de partes exige ao menos um autor e um réu (validador de array); e cada prazo inicial precisa vencer depois da data de abertura do processo — uma validação cross-field entre um `FormArray` filho e um campo do grupo pai.
- **`cliente-form`**: alterna entre Pessoa Física e Pessoa Jurídica sem recriar o formulário — todos os campos de ambos os tipos existem desde o início, e a troca de tipo apenas liga/desliga validadores (`setValidators`/`clearValidators`). O CEP tem validação assíncrona que também preenche o endereço automaticamente.

## Estrutura de pastas

```
src/app/
  core/           auth, modelos de domínio, camada de mock-db
  shared/         validadores, componentes e diretivas reaproveitados entre features
  layout/         shell (sidenav responsivo), sidebar, topbar
  features/       um diretório por módulo de negócio (clientes, processos, prazos,
                  agenda, documentos, financeiro, dashboard, portal-cliente),
                  cada um com seus próprios data-access services e telas
```

Cada feature consome o `MockDbService` através do seu próprio `data-access/*.service.ts` — trocar por uma API real no futuro significa reescrever esses serviços, sem tocar nos componentes.

## Testes

```bash
ng test
```

Cobrem os validadores customizados (CPF/CNPJ com dígito verificador, cross-field, array-level) e o `MockCollection` (CRUD e persistência), que são as partes com lógica não trivial o suficiente para justificar teste automatizado.

## Build de produção

```bash
ng build
```

Gera os artefatos em `dist/`, prontos para qualquer hospedagem estática (Netlify, Vercel, GitHub Pages) — não há dependência de servidor.
