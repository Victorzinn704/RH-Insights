# HR Insight — Gestão Inteligente de Pessoas

> ERP de RH com análise estratégica via IA (Google Gemini), multi-tenant, serverless.

[![CI Status](https://github.com/Victorzinn704/New-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/Victorzinn704/New-Project/actions/workflows/ci.yml)
![React 19](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Vite 6](https://img.shields.io/badge/Vite-6.2-purple)
![Tailwind 4](https://img.shields.io/badge/Tailwind-4.1-38B2AC)
![Firebase](https://img.shields.io/badge/Firebase-12.10-FFCA28)
![Tests](https://img.shields.io/badge/Tests-27%20passing-brightgreen)
![Bundle](https://img.shields.io/badge/Bundle-580KB-lightgrey)

---

## Visão Geral

HR Insight é uma plataforma SaaS de gestão de recursos humanos e finanças, com análise estratégica alimentada por IA. Cada usuário opera em ambiente isolado (multi-tenant), com dados protegidos por regras de segurança no servidor (Firestore Security Rules) e funções cloud com rate limiting e sanitização de input.

**Problema que resolve:** PMEs precisam de visão centralizada de RH + finanças sem a complexidade de ERPs tradicionais. A IA Gemini atua como consultor estratégico, analisando performance de funcionários, saúde financeira e sugerindo decisões.

**Modelo de negócio:** Freemium. Plano gratuito com RH e despesas básicas. Plano PRO com controle de estoque, receitas, portfólio corporativo e análise estratégica avançada.

---

## Funcionalidades

| Módulo | Funcionalidade | Plano |
|--------|---------------|-------|
| **Auth** | Login via Google SSO, isolamento de dados por tenant | Free + PRO |
| **Dashboard** | KPIs em tempo real, gráficos (barras, linhas, pizza), export/import JSON | Free + PRO |
| **RH** | CRUD de funcionários, cargo/salário/status, métricas de saúde (atestados, reclamações) | Free + PRO |
| **Finanças** | Registro de despesas multi-moeda (BRL/USD/EUR), taxas de câmbio em tempo real | Free + PRO |
| **IA — Análise** | Análise SWOT individual por funcionário (Gemini) | Free + PRO |
| **IA — Estratégia** | Decisão estratégica corporativa com comparação de cenários | Free + PRO |
| **Estoque** | Gestão de inventário (produtos, quantidades, preços) | PRO |
| **Receitas** | Fluxo de caixa (entradas/saídas), lucro líquido | PRO |
| **Portfólio** | Identidade corporativa (missão, visão, valores), AI pitch | PRO |
| **Dark Mode** | Tema claro/escuro com detecção de preferência do sistema | Free + PRO |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (SPA)                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Vite                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Custom Hooks (8)                           │  │  │
│  │  │  useTheme │ useAuthSession │ useAuthActions  │  │  │
│  │  │  useExchangeRates │ useFirestoreData         │  │  │
│  │  │  useAiAnalysis │ useModalState               │  │  │
│  │  │  useFirestoreMutations                       │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Components (14, lazy-loaded)               │  │  │
│  │  │  Dashboard │ Employees │ Expenses │ AI │ PRO │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┬────────────┘
               │ HTTPS                        │ HTTPS
               ▼                              ▼
┌──────────────────────┐        ┌──────────────────────────┐
│  Firebase            │        │  Cloud Functions (Node 20)│
│  ┌────────────────┐  │        │  ┌────────────────────┐  │
│  │ Auth (Google)  │  │        │  │ aiProxy            │  │
│  │ Firestore      │  │        │  │  - Rate limiting   │  │
│  │ (6 collections)│  │        │  │  - Input sanitizing│  │
│  │                │  │        │  │  - Gemini 3 Flash  │  │
│  │ Security Rules │  │        │  │                    │  │
│  │ (tenant isol.) │  │        │  │ upgradeToPro       │  │
│  └────────────────┘  │        │  │  - Admin SDK       │  │
└──────────────────────┘        │  └────────────────────┘  │
                                └──────────────────────────┘
```

### Fluxo de Dados

1. **Auth:** `onAuthStateChanged` → hook `useAuthSession` → estado reativo
2. **Dados:** 6 listeners `onSnapshot` em tempo real → hook `useFirestoreData`
3. **Escrita:** Handlers CRUD → hook `useFirestoreMutations` → Firestore
4. **IA:** Componente → `useAiAnalysis` → Cloud Function `aiProxy` → Gemini → Markdown
5. **Câmbio:** `economia.awesomeapi.com.br` → `useExchangeRates` (retry 3x, refresh 30min)

---

## Estrutura do Projeto

```
├── .github/workflows/ci.yml       # CI: lint → build → test
├── functions/
│   ├── src/index.ts               # Cloud Functions (aiProxy, upgradeToPro)
│   ├── package.json
│   └── .env.example
├── src/
│   ├── main.tsx                   # Entry point (StrictMode + ErrorBoundary)
│   ├── App.tsx                    # Root component (208 linhas, 8 hooks)
│   ├── firebase.ts                # Firebase init (app, auth, firestore)
│   ├── types.ts                   # 7 interfaces TypeScript
│   ├── index.css                  # Tailwind + theme vars + animations
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   ├── layout/                # LoginScreen, Sidebar
│   │   ├── dashboard/             # DashboardTab
│   │   ├── employees/             # EmployeesTab, EmployeeFormModal + tests
│   │   ├── expenses/              # ExpensesTab, ExpenseFormModal
│   │   ├── ai/                    # AiTab, AiAnalysisModal
│   │   └── pro/                   # ProTab, Revenue/Inventory/Portfolio tabs + modals
│   ├── hooks/                     # 8 custom hooks (ver seção abaixo)
│   ├── services/
│   │   └── geminiService.ts       # Cloud Function client calls
│   ├── utils/
│   │   ├── currency.ts            # Pure functions (convert, format, constants)
│   │   └── importExport.ts        # JSON backup/restore com validação de schema
│   └── test/
│       └── setup.ts               # jsdom mocks (localStorage, matchMedia)
├── firestore.rules                # Regras de segurança (tenant isolation)
├── firebase.json                  # Firebase deploy config
├── vite.config.ts                 # Build config + code splitting
├── vitest.config.ts               # Test config (jsdom)
├── eslint.config.js               # ESLint + typescript-eslint
├── tsconfig.json                  # TypeScript strict mode
└── package.json
```

---

## Hooks — Arquitetura

O projeto usa 8 custom hooks que encapsulam toda a lógica de estado, side effects e mutations:

| Hook | Responsabilidade | Linhas |
|------|-----------------|--------|
| `useTheme` | Dark/light mode, localStorage, system preference | ~20 |
| `useAuthSession` | `onAuthStateChanged` subscription | ~18 |
| `useAuthActions` | Login, logout, upgradeToPro (Cloud Function) | ~35 |
| `useExchangeRates` | Taxas de câmbio com retry (3x), refresh 30min | ~60 |
| `useFirestoreData` | 6 listeners `onSnapshot` com loading state | ~112 |
| `useAiAnalysis` | AI analysis + strategic decision com error handling | ~80 |
| `useModalState` | `useReducer` com 13 ações tipadas (substitui 10 useState) | ~125 |
| `useFirestoreMutations` | 6 handlers CRUD memoizados com `useCallback` | ~171 |

**Princípio:** App.tsx é um componente de composição — zero lógica de negócio inline. Todos os handlers são memoizados com `useCallback` para evitar re-renders desnecessários.

---

## Segurança

### Firestore Security Rules
- **Tenant Isolation:** Usuários só acessam dados onde `uid == request.auth.uid`
- **Validação de Schema:** Cada coleção tem função de validação (tamanho de strings, tipos, ranges)
- **Campos Imutáveis:** `uid` não pode ser modificado pelo cliente
- **Subscription Protegida:** `plan`, `status`, `currentPeriodEnd` só podem ser alterados via Cloud Functions (Admin SDK)
- **Delete Bloqueado:** `allow delete: if false` em subscriptions

### Cloud Functions
- **Rate Limiting:** 10 requisições/minuto por usuário (in-memory, cleanup a cada 5min)
- **Input Sanitization:** Remove padrões de prompt injection (IGNORE, DISREGARD, SYSTEM PROMPT, etc.)
- **Payload Validation:** Type guards para `AnalyzePayload` e `StrategicPayload`
- **Auth Verification:** `onCall` auto-verifica Firebase ID token

### Frontend
- **Error Boundaries:** Captura erros de renderização, evita crash total
- **XSS Prevention:** React sanitiza inputs automaticamente
- **PII Redaction:** Logs não expõem dados sensíveis

Para detalhes completos, veja [SECURITY.md](SECURITY.md).

---

## Desenvolvimento

### Pré-requisitos
- Node.js 20+
- npm 10+

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/Victorzinn704/New-Project.git
cd New-Project

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Firebase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção (Vite) |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | ESLint + TypeScript type check |
| `npm test` | Executa todos os testes (Vitest) |
| `npm run test:watch` | Modo watch dos testes |

### Deploy Cloud Functions

```bash
# Instale dependências das functions
cd functions && npm install && cd ..

# Configure a chave do Gemini
firebase functions:config:set gemini.api_key="SUA_CHAVE"

# Deploy
firebase deploy --only functions
```

---

## Testes

27 testes passando em 4 arquivos de teste:

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| `utils/__tests__/currency.test.ts` | 14 | convertAmount, formatCurrency, ROLE_HIERARCHY, COLORS, OperationType |
| `utils/__tests__/importExport.test.ts` | 2 | exportData (criação de blob e download) |
| `hooks/__tests__/useTheme.test.ts` | 5 | Dark mode, localStorage, toggle, persistência, DOM |
| `components/employees/__tests__/EmployeeFormModal.test.tsx` | 6 | Render, campos do form, submit, close |

```bash
npm test          # run
npm run test:watch  # watch mode
```

---

## CI/CD

Pipeline GitHub Actions em cada push/PR para `master`/`main`:

```
checkout → setup-node → npm ci → lint → build → test
```

Se qualquer etapa falhar, o PR é bloqueado. Config em `.github/workflows/ci.yml`.

---

## Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para histórico completo de mudanças por sprint.

| Sprint | Foco | Status |
|--------|------|--------|
| 1 | Bugs críticos (AI error handling, PRO upgrade, retry, loading states) | ✅ |
| 2 | Limpeza de dependências e config | ✅ |
| 3 | Infraestrutura de testes (27 testes) | ✅ |
| 4 | CI/CD + ESLint + Quality Gates | ✅ |
| 5 | Refatoração App.tsx (369 → 208 linhas, 8 hooks) | ✅ |
| 6 | A11y + UX polish | Pendente |
| 7 | React Router + deep links | Pendente |
| 8 | Observabilidade (Sentry) | Pendente |

---

## Roadmap

- [ ] **A11y:** ARIA labels, focus traps em modais, keyboard navigation
- [ ] **Mobile Responsiveness:** Layout adaptável para tablets e smartphones
- [ ] **React Router:** Navegação por URL, deep links, bookmarkable states
- [ ] **Sentry:** Error tracking em produção, performance monitoring
- [ ] **RBAC:** Múltiplos usuários por empresa (Admin, Gerente, Funcionário)
- [ ] **System Logs:** Coleção `system_logs` para auditoria
- [ ] **PDF Reports:** Geração de relatórios para download
- [ ] **Open Finance:** Integração com APIs bancárias

---

## Licença

Projeto de portfólio — uso educacional e demonstração.
