# Findings Log

| ID | Domínio | Severidade | Prioridade | Confiança | Achado | Evidência inicial | Recomendação inicial |
|---|---|---:|---:|---|---|---|---|
| F-001 | Arquitetura / Frontend | Alto | P1 | Alta | `src/App.tsx` atua como god component e concentra UI + estado + dados + auth + IA + import/export | `src/App.tsx` (`~102 KB`) | Quebrar por domínio e responsabilidades |
| F-002 | Qualidade / Testes | Alto | P1 | Alta | Não há suíte de testes nem script `test` | `package.json` | Criar cobertura mínima para fluxos críticos |
| F-003 | Infra / CI | Médio | P2 | Alta | Não há pipeline de CI/CD versionada no repo | ausência de `.github/workflows` e scripts de quality gate | Adicionar build/lint/check automatizados |
| F-004 | Segurança / Produto | Alto | P1 | Alta | Bypass de plano PRO hardcoded para um e-mail específico | `src/App.tsx` | Remover regra hardcoded do cliente e mover autorização para fonte confiável |
| F-005 | Tipagem / Manutenibilidade | Médio | P2 | Alta | Uso de `any` em tipos de domínio e handlers | `src/types.ts`, `src/App.tsx`, `src/services/geminiService.ts` | Tipar timestamps, payloads e erros |
| F-006 | Segurança / Config | Médio | P2 | Média | README promete observabilidade e postura SOC, mas não há implementação visível correspondente | `README.md` vs código | Ajustar docs ou implementar o prometido |
| F-007 | Performance / UX | Médio | P2 | Média | Carregamento de todo o app em um componente grande tende a dificultar otimização e code-splitting | `src/App.tsx` + ausência de rotas/modularização | Separar seções, lazy load e componentes pesados |
| F-008 | Dependências | Médio | P2 | Média | `express` aparece como dependência sem uso aparente | `package.json`, ausência de servidor | Remover dependências mortas ou justificar uso |
| F-009 | Segurança / Autorização | Crítico | P0 | Alta | Usuário autenticado pode escrever a própria assinatura e as rules aceitam `plan: 'pro'` | `src/App.tsx:255`, `src/App.tsx:406`, `firestore.rules:98` | Mover entitlement para fonte confiável e endurecer rules |
| F-010 | Segurança / Segredos | Crítico | P0 | Alta | Chave Gemini é injetada no bundle client-side | `vite.config.ts:11`, `src/services/geminiService.ts:4` | Tirar a chave do cliente e usar backend/proxy serverless |
| F-011 | DevOps / DX | Alto | P1 | Alta | Script `clean` não funciona no Windows | `package.json:10`, execução local | Trocar por comando cross-platform |
| F-012 | DevOps / Qualidade | Alto | P1 | Alta | Não existe CI/CD versionado para `install`, `lint`, `build`, `audit` | ausência de `.github/workflows` | Criar pipeline mínima |
| F-013 | Qualidade / Tipagem | Médio | P2 | Alta | `lint` é só `tsc --noEmit`, sem `strict` e sem ESLint | `package.json:11`, `tsconfig.json` | Adicionar ESLint e elevar rigor de TypeScript |
| F-014 | Frontend / SEO | Baixo | P3 | Alta | HTML base usa `lang=\"en\"` e título genérico | `index.html:2`, `index.html:6` | Ajustar head para PT-BR e metadados reais |
| F-015 | Manutenibilidade | Médio | P2 | Alta | Handler de erro duplicado e shadowed | `src/App.tsx:119`, `src/App.tsx:195` | Unificar tratamento de erro |
| F-016 | Performance | Alto | P1 | Alta | Bundle principal com ~`1.7 MB` minificado e warning do Vite | execução local de `npm run build` | Code-splitting e modularização |
| F-017 | Produto / UX | Médio | P2 | Alta | Navegação só por estado local, sem rotas/deep links | `src/App.tsx:146`, ausência de router | Sincronizar navegação com URL |
| F-018 | Segurança / Privacidade | Médio | P2 | Alta | Logs de erro incluem dados de autenticação/PII no browser | `src/App.tsx:119-140` | Minimizar payload de erro no cliente |
| F-019 | Regras / Consistência | Médio | P2 | Alta | Features PRO não são protegidas nas rules (`inventory`, `revenue`, `portfolios`) | `firestore.rules:84-109` | Adicionar autorização real baseada em plano |
| F-020 | Dados / Consistência | Médio | P3 | Média | Regra aceita `performance <= 100`, UI/documentação usam `1-10` | `firestore.rules:25`, `src/App.tsx:1513`, `README.md:31` | Alinhar contrato entre UI e rules |
| F-021 | Segurança / Segredos | Crítico | P0 | Alta | Chave Firebase API key exposta no bundle client-side | `firebase-applet-config.json:4`, `src/firebase.ts:4` | Aplicar Firebase App Check, restringir API key no Google Cloud Console |
| F-022 | Segurança / Autorização | Crítico | P0 | Alta | Gemini API key via `process.env` em código client-side — não funciona com Vite | `src/services/geminiService.ts:4` | Mover chamadas Gemini para Cloud Function ou server-side endpoint |
| F-023 | Segurança / Dados | Alto | P1 | Alta | Import JSON sem validação de schema — injeção de campos arbitrários | `src/App.tsx:439-508` | Implementar allowlisting de campos e validação com Zod |
| F-024 | Segurança / Autorização | Alto | P1 | Alta | Qualquer usuário autenticado pode criar registros em todas as coleções | `firestore.rules:70-110` | Adicionar validação de domínio de email ou Firebase App Check |
| F-025 | Segurança / Subs | Alto | P1 | Alta | Subscription sem verificação de expiração — `currentPeriodEnd` nunca validado | `src/App.tsx:256,262,409`, `firestore.rules:54-58` | Validar expiração client-side e server-side |
| F-026 | Segurança / IA | Médio | P2 | Alta | Prompt injection defense fraco — systemInstruction em português, dados sem sanitização | `src/services/geminiService.ts:23,47` | Sanitizar inputs, usar structured output, safetySettings |
| F-027 | Segurança / PII | Médio | P2 | Alta | `handleFirestoreError` vaza PII completa (email, userId, providerData) | `src/App.tsx:119-141` | Remover PII dos erros, usar serviço de monitoring com redaction |
| F-028 | Segurança / API | Médio | P2 | Alta | Currency exchange API sem timeout, retry ou fallback visível | `src/App.tsx:158-172` | Adicionar timeout, retry, warning visual para rates stale |
| F-029 | Frontend / Arquitetura | Crítico | P0 | Alta | App.tsx com 1774 linhas — zero decomposição em componentes ou hooks | `src/App.tsx:1-1774` | Extrair por domínio: Sidebar, Dashboard, EmployeeTable, modais, etc. |
| F-030 | Frontend / Performance | Crítico | P0 | Alta | Zero useMemo/useCallback — dados derivados recalculados em todo render | `src/App.tsx:544-545,838-861` | Envolver cálculos em useMemo com dependências corretas |
| F-031 | Frontend / Dados | Crítico | P0 | Alta | Sem abstração de data fetching — raw Firestore calls sem retry/loading/abort | `src/App.tsx:220-273,285-400` | Criar hooks useFirestoreCollection, service layer tipado |
| F-032 | Frontend / Tipagem | Alto | P1 | Alta | `any` em todos os campos de data em types.ts | `src/types.ts:27,46,54` | Usar `Timestamp` do Firestore ou `Date`/`string` |
| F-033 | Frontend / Erros | Alto | P1 | Alta | `handleFirestoreError` shadowed — versão robusta nunca é chamada | `src/App.tsx:119` vs `src/App.tsx:195` | Remover duplicata, usar handler único |
| F-034 | Frontend / Forms | Alto | P1 | Alta | FormData raw sem validação — `Number('')` = 0, `Number('abc')` = NaN | `src/App.tsx:285-317,510-529` | Adicionar validação client-side, considerar zod + react-hook-form |
| F-035 | Frontend / UX | Alto | P1 | Alta | Sem loading states para operações CRUD — duplo clique cria duplicatas | `src/App.tsx` handlers | Adicionar isSubmitting por operação |
| F-036 | Frontend / A11y | Médio | P2 | Alta | Modais sem acessibilidade — sem Escape, focus trap, role="dialog" | `src/App.tsx:1482-1770` | Adicionar ARIA, focus-trap, onKeyDown Escape |
| F-037 | Frontend / A11y | Médio | P2 | Alta | Tabelas sem scope, caption, aria — inacessível para screen readers | `src/App.tsx:907,1054` | Adicionar scope="col" nos th, caption descritivo |
| F-038 | Frontend / Perf | Médio | P2 | Alta | Sem paginação ou virtualização — todos os dados renderizados como DOM | `src/App.tsx:918` | Implementar paginação ou virtual scrolling |
| F-039 | Frontend / Deps | Médio | P2 | Alta | `animate-in` classes usadas mas tailwindcss-animate não instalado | `src/App.tsx:573,748,888` | Instalar tailwindcss-animate ou usar Framer Motion |
| F-040 | Frontend / Deps | Médio | P2 | Alta | `sonner` em dependencies mas `react-hot-toast` é usado | `package.json:29` | Remover sonner ou migrar |
| F-041 | Frontend / TS | Médio | P2 | Alta | tsconfig sem strict mode — `any` passa sem detecção | `tsconfig.json` | Habilitar strict: true, noUncheckedIndexedAccess |
| F-042 | Frontend / Deps | Baixo | P3 | Alta | `express` em dependencies sem uso no frontend | `package.json:20` | Remover |
| F-043 | Frontend / Deps | Baixo | P3 | Alta | `dotenv` redundante — Vite já faz loadEnv | `package.json:19` | Remover |
| F-044 | Frontend / Deps | Baixo | P3 | Alta | `clsx` e `tailwind-merge` importados em nenhum lugar | `package.json:17,30` | Usar ou remover |
| F-045 | Frontend / UX | Baixo | P3 | Alta | Ícone de dark mode não muda (sempre Clock) | `src/App.tsx:723` | Usar Sun/Moon icons |
| F-046 | Frontend / UX | Baixo | P3 | Alta | "Enterprise Security Protocol v3.4.0" é ficcional | `src/App.tsx:618` | Remover ou substituir por info real |
| F-047 | Segurança / Segredos | Crítico | P0 | Confirmado | Firebase API key `AIzaSyBDccEaBqorpEoFYnSfTGDuBDxZ-rZbLLQ` exposta em `firebase-applet-config.json` commitado publicamente | `firebase-applet-config.json:4`, `.gitignore` não cobre JSON | Rotacionar key, restringir no Google Cloud Console, adicionar Firebase App Check |
| F-048 | Segurança / Config | Crítico | P0 | Confirmado | `firebase-applet-config.json` não está no `.gitignore` — arquivo sensível commitado | `.gitignore` só ignora `node_modules/`, `dist/`, `.env*` | Adicionar `*-config.json` ao `.gitignore`, remover do histórico git |
| F-049 | Frontend / Bug | Alto | P1 | Confirmado | `employees.sort()` muta state in-place na tab AI (linha 1155), inconsistente com `[...employees].sort()` correto na tab Employees (linha 918) | `src/App.tsx:1155` vs `src/App.tsx:918` | Usar spread consistentemente |
| F-050 | Frontend / Funcional | Baixo | P3 | Confirmado | Botão "Gerar Pitch de Vendas" sem `onClick` handler — funcionalidade fantasma | `src/App.tsx:1448` | Implementar ou remover |
| F-051 | Frontend / Funcional | Baixo | P3 | Confirmado | Botão "Copiar" do link de portfólio sem `onClick` handler | `src/App.tsx:1467` | Adicionar `navigator.clipboard.writeText()` |
| F-052 | Frontend / UX | Baixo | P3 | Confirmado | Ícone `Clock` usado para ambos dark/light mode — deveria ser Sun/Moon | `src/App.tsx:723` | Trocar por ícones semânticos |
| F-053 | Frontend / Tipagem | Médio | P2 | Confirmado | `Expense.date` e `RevenueRecord.date` tipados como `any` em `types.ts` | `src/types.ts:27,46` | Usar `Timestamp` do Firestore |
| F-054 | Frontend / Resiliência | Médio | P2 | Confirmado | Câmbio fetch só no mount — sem refresh periódico, sem botão de retry, sem timeout | `src/App.tsx:157-172` | Adicionar polling ou refresh manual + AbortController |
| F-055 | Frontend / UX | Médio | P2 | Confirmado | Sem loading states / disabled em botões de submit CRUD — duplo clique cria duplicatas | `src/App.tsx:286-529` | Adicionar `isSaving` state por operação |
| F-056 | Frontend / A11y | Médio | P2 | Confirmado | Modais sem `role="dialog"`, `aria-modal`, focus trap, ou Escape key handler | `src/App.tsx:1482-1770` | Adicionar ARIA + focus management |
| F-057 | Frontend / Deps | Médio | P2 | Confirmado | Classes `animate-in` usadas mas `tailwindcss-animate` não está instalado | `src/App.tsx:573,748,888` | Instalar ou remover classes |
| F-058 | Frontend / TS | Médio | P2 | Confirmado | `tsconfig.json` sem `strict: true` — permite `any` sem warning | `tsconfig.json` | Habilitar strict mode |
| F-059 | Frontend / Deps | Baixo | P3 | Confirmado | `clsx` e `tailwind-merge` em deps mas zero imports no código fonte | `package.json:17,30` | Usar ou remover |
| F-060 | Segurança / PII | Médio | P2 | Confirmado | `handleFirestoreError` (linhas 119-141) vaza PII completa no console: email, userId, providerData | `src/App.tsx:119-141` | Redact PII antes de logar |
| F-061 | Frontend / Perf | Alto | P1 | Confirmado | Zero `useMemo`/`useCallback` — `totalMonthlyExpenses`, `totalSalaries`, e filtros de charts recalculam em todo render | `src/App.tsx:544-545,838-861` | Envolver em `useMemo` |
| F-062 | Dados / Consistência | Baixo | P3 | Confirmado | Firestore rules aceitam `performance <= 100` mas UI usa escala 1-10 | `firestore.rules:25` vs `src/App.tsx:1537` | Alinhar validação |
