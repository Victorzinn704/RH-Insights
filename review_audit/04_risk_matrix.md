# Matriz de Risco (Revisão Aprofundada — 2026-04-11)

| ID | Risco | Impacto | Probabilidade | Esforço | Classe | Prioridade |
|---|---|---|---|---|---|---|
| R-001 | God component central (1774 linhas) dificulta evolução segura | Alto | Alto | Médio | Estrutural | P0 |
| R-002 | Ausência total de testes — regressão silenciosa garantida | Alto | Alto | Baixo | Qualidade | P0 |
| R-003 | Bypass PRO hardcoded (email) + subscription gravável pelo usuário | Alto | Alto | Baixo | Segurança / Produto | P0 |
| R-004 | Documentação superestima segurança/monitoramento — falsa maturidade | Médio | Alto | Baixo | Governança | P2 |
| R-005 | Firebase Rules como única barreira — sem App Check | Alto | Médio | Médio | Segurança | P1 |
| R-006 | Tipagem frouxa (`any`) mascara bugs em datas, payloads e IA | Médio | Médio | Baixo | Manutenibilidade | P2 |
| R-007 | Sem CI/CD — entrega depende de validação manual | Alto | Alto | Baixo | Operacional | P1 |
| R-008 | Gemini API key via `process.env` em client-side — não funciona fora do AI Studio | Alto | Alto | Médio | Segurança | P0 |
| R-009 | Script `clean` quebrado no Windows | Médio | Alto | Baixo | DX | P2 |
| R-010 | Bundle ~1.7 MB sem code-splitting | Alto | Alto | Médio | Performance | P1 |
| R-011 | README vende maturidade acima do entregue | Médio | Alto | Baixo | Governança | P2 |
| R-012 | Regras PRO só no cliente — bypass trivial | Alto | Alto | Baixo | Produto / Segurança | P0 |
| R-013 | Firebase API key exposta no bundle — sem App Check | Alto | Médio | Baixo | Segurança | P0 |
| R-014 | Import JSON sem validação de schema — injeção de campos | Médio | Médio | Baixo | Segurança | P1 |
| R-015 | Error handler shadowed — erros silenciosos em produção | Médio | Alto | Baixo | Observabilidade | P1 |
| R-016 | Zero useMemo/useCallback — recálculo total em cada render | Médio | Alto | Baixo | Performance | P1 |
| R-017 | Sem acessibilidade em modais e tabelas — exclui usuários | Médio | Alto | Baixo | UX / A11y | P2 |
| R-018 | Sem paginação — DOM cresce sem limite com dados | Médio | Médio | Médio | Performance | P2 |
| R-019 | Currency API sem timeout/retry — rates stale sem aviso | Médio | Médio | Baixo | UX / Dados | P2 |
| R-020 | Prompt injection fraco — systemInstruction em português sem sanitização | Médio | Baixo | Médio | Segurança / IA | P2 |
| R-021 | Firebase config JSON commitado com API key real exposta publicamente | Alto | Alto | Baixo | Segurança | P0 |
| R-022 | `employees.sort()` muta state in-place — inconsistência causa renders incorretos | Médio | Médio | Baixo | Bug / Performance | P1 |
| R-023 | Botões fantasma sem handler (Pitch, Copiar) — UX quebrada | Baixo | Alto | Baixo | UX | P3 |
| R-024 | Zero useMemo/useCallback — recálculo massivo em cada render | Médio | Alto | Baixo | Performance | P1 |
| R-025 | Modais sem acessibilidade — exclui usuários de screen reader/teclado | Médio | Alto | Baixo | A11y | P2 |
| R-026 | `tsconfig` sem strict — `any` passa sem detecção, falsa segurança de TS | Médio | Médio | Baixo | DX / Tipagem | P2 |
| R-027 | Câmbio sem refresh — dados financeiros stale em uso prolongado | Médio | Médio | Baixo | UX / Dados | P2 |
| R-028 | CRUD sem loading state — duplo clique = dados duplicados | Médio | Alto | Baixo | UX / Integridade | P2 |
| R-029 | `animate-in` classes sem plugin — animações não funcionam | Baixo | Alto | Baixo | UX | P3 |
| R-030 | PII vazada em logs de erro — email, userId, providerData no console | Médio | Médio | Baixo | Privacidade | P2 |
