# Architecture Reviewer — `New-Project`

## Resumo Executivo
- O repositório é uma SPA única em `React + Vite + Firebase + Gemini`, não um sistema distribuído ou monorepo; a base é pequena em arquivos, mas estruturalmente concentrada.
- O maior risco arquitetural é a **quebra de fronteiras**: `src/App.tsx` acumula autenticação, listeners Firestore, CRUD, export/import, tema, IA e composição visual.
- A aplicação compila e faz lint, mas o bundle principal ficou muito grande (`~1.7 MB` minificado), o que reforça a leitura de acoplamento de módulo e baixa segmentação.
- A documentação descreve uma maturidade maior do que o código entrega em observabilidade, segurança operacional e governança.

## Riscos Principais
| Risco | Severidade | Confiança | Por que importa |
|---|---:|---|---|
| God component em `App.tsx` | Alto | Alta | Une camadas e domínios que deveriam evoluir separadamente |
| Bypass PRO hardcoded no cliente | Crítico | Alta | Autoriza funcionalidade sensível por e-mail no front |
| Boundary de segredo/IA fraco | Alto | Alta | A chave do Gemini é injetada no cliente |
| Arquitetura documentada maior que a implementada | Médio | Alta | Gera falsa sensação de maturidade |
| Dependências e versões pouco higiênicas | Médio | Alta | Aumenta ruído, custo de manutenção e superfície de risco |
| Bundle grande e sem code-splitting real | Alto | Alta | Piora FCP/TTI e dificulta evolução modular |

## Achados Detalhados

| ID | Severidade | Confiança | Evidência | Impacto | Recomendação |
|---|---|---|---|---|---|
| A-001 | Alto | Alta | `src/App.tsx:143`, `src/App.tsx:224-255`, `src/App.tsx:286`, `src/App.tsx:418`, `src/App.tsx:439`, `src/App.tsx:547`, `src/App.tsx:555`; arquivo com `1691` linhas | O root component concentra domínio, dados, auth, IA, import/export e UI; qualquer mudança toca muitas frentes e aumenta regressão | Extrair por domínio: auth/session, data layer, billing/PRO, charts, modais, IA e theme hooks |
| A-002 | Crítico | Alta | `src/App.tsx:255` (`if (user.email === 'jvictodacruz13@gmail.com')`) | O plano PRO é liberado por regra hardcoded no cliente; isso é uma fronteira de autorização frágil e fácil de corromper por edição de bundle | Mover autorização para claim/role confiável, regra server-side ou documento assinado; remover bypass local |
| A-003 | Alto | Alta | `vite.config.ts:6-12`, `src/services/geminiService.ts:1-4`, `src/services/geminiService.ts:19-24`, `src/services/geminiService.ts:43-47` | A API key do Gemini é injetada no bundle do cliente e a chamada ocorre no browser; isso reduz a proteção do segredo e expõe custo/quota ao usuário final | Encaminhar chamadas de IA por backend/function/edge ou restringir severamente a chave e documentar a decisão |
| A-004 | Médio | Alta | `README.md:16-18`, `README.md:69-85` versus `src/` e `package.json:6-31` | A documentação promete arquitetura serverless madura, SOC, logs estruturados e postura de produção, mas o código entregue é uma SPA simples com Firebase e sem camada operacional própria | Alinhar README ao estado real ou implementar os componentes prometidos; evitar overclaim arquitetural |
| A-005 | Médio | Alta | `package.json:13-31`, ausência de imports de `express`, `dotenv` e `sonner` em `src/`; `npm audit` reportou 4 vulnerabilidades | Dependências e mensagens de manutenção aumentam custo de instalação e superfície de risco sem valor aparente; isso confunde a fronteira entre runtime e tooling | Remover dependências sem uso, separar dependências de runtime/dev e manter atualização de segurança contínua |
| A-006 | Alto | Alta | `npm run build` gerou `dist/assets/index-pc-1_kEl.js` com `1,706.31 kB`; `src/App.tsx` tem `1691` linhas | O bundle principal é grande demais para uma SPA desse porte; isso indica baixa segmentação e reduz a flexibilidade de evolução por domínio | Introduzir split por rota/domínio, lazy loading de áreas pesadas e redução da massa de `App.tsx` |
| A-007 | Médio | Alta | `src/types.ts:27`, `src/types.ts:46`, `src/types.ts:54`, `src/App.tsx:195`, `src/services/geminiService.ts:33` | Há contratos frouxos (`any`) em pontos centrais de dados e erros; isso fragiliza as fronteiras do domínio e dificulta mudanças seguras | Substituir `any` por tipos explícitos (`Timestamp`, payloads de IA, erros normalizados) |
| A-008 | Médio | Alta | `package.json:6-11` não tem `test`; não há arquivos de teste no repositório visível | Sem suíte de testes, a arquitetura não tem rede de proteção para mudanças estruturais e as fronteiras podem degradar sem aviso | Criar testes mínimos para auth/tenant rules, import/export e fluxo PRO/IA |
| A-009 | Médio | Alta | `firestore.rules:71-109` versus `src/App.tsx:224-255` | A política de tenant isolation existe nas rules, mas a camada de cliente ainda duplica e mistura regras de negócio com autorização, criando deriva entre front e segurança | Concentrar políticas críticas em uma fonte de verdade e reduzir decisões sensíveis no cliente |

## Validação Técnica
- `npm run build` passou depois de normalizar a instalação local; o build expõe um chunk principal grande demais.
- `npm run lint` passou.
- `npm audit --audit-level=high` reportou `4` vulnerabilidades: `brace-expansion`, `path-to-regexp`, `picomatch` e `vite`.

## Leitura Arquitetural
- O produto tem um bom recorte funcional, mas a implementação ainda está em um estágio de **SPA concentrada** em vez de **arquitetura por domínios**.
- O desenho atual favorece velocidade de entrega inicial, porém penaliza manutenção, segurança de mudanças e evolução de produto.
- A separação entre domínio, infraestrutura e UI precisa melhorar antes que novas features aumentem o custo estrutural.

## Recomendações Prioritárias
1. Extrair a lógica central de `App.tsx` para módulos por domínio.
2. Remover o bypass PRO hardcoded e qualquer decisão sensível no cliente.
3. Reavaliar o boundary da integração Gemini e mover segredos fora do bundle, se possível.
4. Limpar dependências e alinhar a documentação com o estado real.
5. Adicionar testes mínimos para os fluxos mais sensíveis.

