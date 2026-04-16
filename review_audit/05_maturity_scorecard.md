# Scorecard de Maturidade (Revisão Aprofundada — 2026-04-12, Pós-Sprint 6)

> Escala de `0` a `5`. Refinada após auditoria profunda com subagentes especializados.
> **Atualizado após Sprints 1-6:** Bugs críticos, limpeza de deps, 27 testes, CI/CD, ESLint, refatoração App.tsx (369→208 linhas), documentação enterprise, hardening de segurança (DOMPurify, CSP, SRI, App Check, sanitização de inputs).

| Dimensão | Nota | Justificativa |
|---|---:|---|
| Arquitetura | 4.0 | App.tsx 208 linhas. 8 hooks customizados, composição limpa, zero lógica inline. useReducer para modais. Mutations separadas. |
| Backend / BaaS | 4.0 | Gemini proxy + upgradeToPro via Cloud Functions com rate limiting, sanitização, validação. Firestore rules hardened. App Check adicionado. |
| Frontend | 3.5 | Componentização completa, forms puras, hooks de dados/tema/auth. Falta a11y, responsividade mobile, React Router. |
| Segurança | 4.5 | 7 camadas anti-XSS (React escape → sanitizeInput → DOMPurify → Firestore rules → CSP → SRI → Cloud Functions). App Check reCAPTCHA v3. CSP headers. SRI SHA-384. Photo URL validation. GEMINI_KEY removida do bundle. |
| DevOps | 2.0 | CI/CD com GitHub Actions (lint→build→test). Falta deploy automático, Docker, IaC. |
| Observabilidade | 2.5 | Error handler unificado com PII redaction, retry em exchange rates, error state em AI, ErrorBoundary (sem info leak). Falta Sentry/monitoramento prod. |
| Testes | 2.5 | 27 testes em 4 arquivos. Cobertura funcional boa, falta cobertura de hooks complexos (useFirestoreData, useAiAnalysis, useModalState) e utils de sanitize. |
| Documentação | 4.5 | README, SECURITY (atualizado), CONTRIBUTING, ARCHITECTURE (7 ADRs), API, DEPLOYMENT, DATA_MODEL, CHANGELOG. |
| DX | 4.0 | Setup simples, TypeScript strict, estrutura modular, testes com Vitest, CI automático, ESLint. |
| UX/UI | 3.0 | Design visual consistente. Sem a11y (ARIA, focus traps), responsividade mobile, ou UX states para loading/error em CRUD. |
| Performance | 4.0 | Code-splitting com React.lazy + manualChunks. Bundle inicial ~580 KB (era 1.7 MB). Tabs carregam sob demanda. |
| Governança técnica | 2.5 | CI/CD, ESLint, ADRs documentados, CONTRIBUTING.md. Falta code review process, branch protection, versionamento semântico. |
| Produto | 3.5 | Proposta clara — ERP simplificado com IA, módulos bem definidos, modelo freemium coerente. |

### Comparativo com auditoria anterior (2026-04-12, pós-Sprint 5 → pós-Sprint 6)
| Dimensão | Antes (pós-Sprint 5) | Agora (pós-Sprint 6) | Delta |
|---|---:|---:|---:|
| Arquitetura | 4.0 | 4.0 | 0.0 |
| Backend / BaaS | 3.5 | 4.0 | +0.5 |
| Frontend | 3.5 | 3.5 | 0.0 |
| Segurança | 3.5 | 4.5 | +1.0 |
| DevOps | 2.0 | 2.0 | 0.0 |
| Observabilidade | 2.5 | 2.5 | 0.0 |
| Testes | 2.5 | 2.5 | 0.0 |
| Documentação | 4.5 | 4.5 | 0.0 |
| DX | 4.0 | 4.0 | 0.0 |
| UX/UI | 3.0 | 3.0 | 0.0 |
| Performance | 4.0 | 4.0 | 0.0 |
| Governança técnica | 2.5 | 2.5 | 0.0 |
| Produto | 3.5 | 3.5 | 0.0 |

**Nota geral ponderada:** 3.4/5 (era 3.2/5 pós-Sprint 5, era 1.5/5 pré-refatoração) — Segurança subiu de 3.5 para 4.5 (+1.0), Backend de 3.5 para 4.0 (+0.5).

### Dimensões que ainda precisam de trabalho
| Dimensão | Nota | Gap Principal | Próximo Sprint |
|---|---:|---|---|
| UX/UI | 3.0 | Sem a11y, sem responsividade mobile | Sprint 7 |
| Testes | 2.5 | Hooks complexos e sanitize sem cobertura | Sprint 7 |
| DevOps | 2.0 | Sem deploy automático, sem Docker | Sprint 8 |
| Observabilidade | 2.5 | Sem Sentry/monitoramento prod | Sprint 8 |
