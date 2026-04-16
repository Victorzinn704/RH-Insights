# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Unreleased] — 2026-04-12

### Sprint 6 — Hardening de Segurança

#### Adicionado
- `src/utils/sanitize.ts` — 3 funções: `sanitizeMarkdown` (DOMPurify), `sanitizeInput` (anti-XSS), `isValidImageUrl`
- `dompurify` + `@types/dompurify` — sanitização de HTML/AI output
- Firebase App Check com reCAPTCHA v3 em `src/firebase.ts`
- SRI hashes (SHA-384) em todos os scripts/styles via plugin Vite custom (`sriHashPlugin`)
- CSP + security headers em `firebase.json` (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)

#### Corrigido
- `AiAnalysisModal.tsx` e `AiTab.tsx` — output da IA agora sanitizado com DOMPurify
- `ErrorBoundary.tsx` — não expõe detalhes do erro ao usuário (mensagem genérica)
- `Sidebar.tsx` — `user.photoURL` validado antes de usar como `<img src>`
- `vite.config.ts` — removido `GEMINI_API_KEY` do bundle client (não era mais usado)
- `useFirestoreMutations.ts` — todos os campos string sanitizados com `sanitizeInput` antes de enviar ao Firestore
- `.env.example` — adicionado `VITE_RECAPTCHA_SITE_KEY`

#### Verificação
- `tsc --noEmit` — zero erros
- `npm run build` — build limpo com SRI hashes no index.html
- `npm test` — 27 testes passando
- `npm run lint` — zero warnings

---

## [Unreleased] — 2026-04-12

### Sprint 5b — Documentação Enterprise

#### Adicionado
- `README.md` — reescrito com visão geral, tabela de funcionalidades, diagrama de arquitetura, estrutura do projeto, hooks, segurança, desenvolvimento, testes, CI/CD, changelog, roadmap
- `SECURITY.md` — autenticação, multi-tenant isolation, input validation (3 camadas), prompt injection prevention, XSS, error handling, secrets management, security checklist, incident response
- `CONTRIBUTING.md` — getting started, workflow, quality gates, code style, naming conventions, testing guide, architecture decisions, commit messages
- `ARCHITECTURE.md` — 7 ADRs (Custom Hooks, useReducer modals, Cloud Functions AI proxy, Firestore security rules, Code splitting, Single Firestore hook, Vitest)
- `API.md` — spec completa das Cloud Functions (aiProxy, upgradeToPro) com request/response schemas, errors, security, deployment
- `DEPLOYMENT.md` — setup inicial, deploy (front + functions + rules), CI/CD com GitHub Actions, rollback, monitoring, cost estimation
- `DATA_MODEL.md` — 6 coleções Firestore com validação, ERD, data flow, import/export format

#### Atualizado
- `review_audit/00_master_index.md` — índice atualizado com todos os documentos novos e progresso de Sprints 1-5
- `review_audit/05_maturity_scorecard.md` — notas atualizadas pós-Sprint 5 (3.2/5, era 2.7/5). Documentação subiu de 3.0 para 4.5, Governança de 1.0 para 2.5

---

## [Unreleased] — 2026-04-12

### Sprint 5 — App.tsx Refatoração (369 → 208 linhas)

#### Adicionado
- `src/hooks/useModalState.ts` — 10 `useState` consolidados em um único `useReducer` com 13 ações tipadas
- `src/hooks/useAuthActions.ts` — `handleLogin`, `handleLogout`, `upgradeToPro` extraídos com `useCallback`
- `src/hooks/useFirestoreMutations.ts` — 6 handlers CRUD extraídos (`addEmployee`, `deleteEmployee`, `addExpense`, `addInventoryItem`, `addRevenueRecord`, `savePortfolio`)

#### Refatorado
- `src/App.tsx` — de 369 para 208 linhas. Agora usa 8 hooks compostos, zero lógica inline
- Todos os handlers agora são memoizados com `useCallback` — evita re-renders desnecessários

#### Verificação
- `tsc --noEmit` — zero erros
- `npm run build` — vite build limpo (580KB total)
- `npm test` — 27 testes passando em 4 arquivos
- `npm run lint` — zero warnings, zero errors

---

## [Unreleased] — 2026-04-12

### Sprint 4 — CI/CD + ESLint + Quality Gates

#### Adicionado
- `.github/workflows/ci.yml` — pipeline CI com `install → lint → build → test` em cada push/PR
- `eslint.config.js` — configuração ESLint com `typescript-eslint`, regras para React
- `npm run lint` agora executa `eslint . && tsc --noEmit`
- `npm run test:watch` — modo watch do Vitest

#### Corrigido
- Dead imports removidos (`Package` em InventoryFormModal, `setDoc` em importExport)
- Unused destructured vars prefixadas com `_` em importExport.ts
- Teste de importExport limpo (spies não usados removidos, `any` substituído por tipagem correta)

---

## [Unreleased] — 2026-04-12

### Sprint 3 — Testes

#### Adicionado
- `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom`
- `vitest.config.ts` — configuração com jsdom e setup file
- `src/test/setup.ts` — mocks de localStorage e matchMedia para jsdom
- `npm run test` e `npm run test:watch` scripts
- `src/utils/__tests__/currency.test.ts` — 14 testes (convertAmount, formatCurrency, ROLE_HIERARCHY, COLORS, OperationType)
- `src/utils/__tests__/importExport.test.ts` — 2 testes (exportData)
- `src/hooks/__tests__/useTheme.test.ts` — 5 testes (dark mode, localStorage, DOM)
- `src/components/employees/__tests__/EmployeeFormModal.test.tsx` — 6 testes (render, submit, close)

**Total: 27 testes passando em 4 arquivos**

---

## [Unreleased] — 2026-04-12

### Sprint 2 — Limpeza de Dependências e Config

#### Corrigido
- `@google/genai` removido de dependencies (não usado no frontend)
- `vite`, `@tailwindcss/vite`, `@vitejs/plugin-react` movidos para devDependencies
- `autoprefixer` removido (Tailwind v4 não usa)
- `@types/react` adicionado a devDependencies
- `index.html`: `lang="pt-BR"`, título real, meta description, theme-color, favicon SVG

---

## [Unreleased] — 2026-04-12

### Sprint 1 — Bugs Críticos

#### Corrigido
- **`useAiAnalysis`**: try/catch/finally adicionado — `isAnalyzing` não trava mais em `true` em caso de erro
- **`useAiAnalysis`**: novo state `aiError` exposto ao consumidor
- **`useAiAnalysis`**: `AiAnalysisModal` agora renderiza estado de erro com ícone e mensagem
- **`useAiAnalysis`**: `useRef` para estabilizar `runStrategicDecision` (evita re-renders desnecessários)
- **`upgradeToPro`**: Cloud Function `upgradeToPro` criada em `functions/src/index.ts` (Admin SDK, trusted)
- **`upgradeToPro`**: Cliente agora chama via `httpsCallable` em vez de escrever direto no Firestore
- **`firestore.rules`**: `allow update` bloqueia mudanças em `plan`/`status`/`currentPeriodEnd` pelo cliente
- **`useExchangeRates`**: retry automático (3 tentativas, 2s delay)
- **`useExchangeRates`**: novos states `isLoading`, `error`, `lastFetched`, `refetch`
- **`useExchangeRates`**: `mountedRef` previne setState após unmount
- **`useFirestoreData`**: novos states `isLoading` e `hasLoadedOnce` com contador de listeners resolvidos
- **`useFirestoreData`**: error callbacks agora marcam como resolvido (evita loading eterno)
