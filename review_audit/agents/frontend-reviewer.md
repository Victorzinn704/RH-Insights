# Frontend Reviewer — `New-Project`

## Resumo do Domínio
- O frontend é uma SPA única em `React + Vite + TypeScript + Tailwind`, com `Firebase` e `Gemini` rodando quase toda a lógica de produto no cliente.
- A aplicação tem boa ambição funcional, mas a implementação está fortemente concentrada em `src/App.tsx`, que atua como controller, store, camada de dados, navegação e UI.
- A base tem sinais de maturidade em segurança de dados no Firestore, porém a estrutura de frontend ainda é frágil para manutenção, acessibilidade e evolução.

## Verificação Executada
- `npm install` — concluído.
- `npm run lint` — passou.
- `npm run build` — falhou.
- `npm audit --audit-level=high` — reportou `4` vulnerabilidades (`1` moderada, `3` altas).

## Principais Riscos
1. **Build quebrado em produção**
   - O build Vite falha por resolução de módulo transitivo ligado a `recharts`/`victory-vendor`.
2. **Monólito de frontend**
   - `src/App.tsx` concentra quase toda a lógica e cria um blast radius alto para qualquer mudança.
3. **Segredos e lógica sensível no cliente**
   - A chave Gemini é injetada no bundle frontend; a regra PRO também é decidida por e-mail hardcoded no cliente.
4. **Acessibilidade e SEO básicos incompletos**
   - `index.html` está em inglês enquanto a UI é PT-BR, com título genérico e sem metadados úteis.
5. **Design tokens subutilizados**
   - `src/index.css` define variáveis semânticas, mas a UI usa muitos valores hardcoded, dificultando consistência.

## Achados Detalhados

| ID | Severidade | Achado | Evidência | Impacto | Confiança | Recomendação |
|---|---|---|---|---|---|---|
| F-001 | **Crítico** | O build de produção está quebrado | `npm run build` falha com `Rollup failed to resolve import "d3-shape" from "victory-vendor/es/d3-shape.js"`; o app importa `recharts` em `src/App.tsx:73` | O frontend não está shippável até o problema ser resolvido | Alta | Fixar a cadeia de dependências do gráfico e validar `build` em CI; hoje o app não fecha produção |
| F-002 | **Alto** | `src/App.tsx` é um god component | `src/App.tsx:143` inicia o componente principal; `src/App.tsx:220` adiciona 6 listeners Firestore; `src/App.tsx:626` em diante concentra layout, dashboards e modais; o arquivo tem ~`1773` linhas | Acoplamento alto, difícil de testar, difícil de evoluir e com grande blast radius de renderização | Alta | Quebrar por domínio (`auth`, `dashboard`, `employees`, `finance`, `ai`, `modals`, `hooks`) e mover lógica para hooks/serviços/componenentes menores |
| F-003 | **Alto** | Chave Gemini exposta no bundle cliente | `vite.config.ts:11` injeta `process.env.GEMINI_API_KEY`; `src/services/geminiService.ts:4` instancia `GoogleGenAI` no browser | Qualquer segredo sem restrições fortes fica exposto no cliente e pode ser abusado | Alta | Mover a chamada para backend/proxy serverless ou restringir agressivamente a chave (origens, quotas, escopo) |
| F-004 | **Alto** | Regra de plano PRO hardcoded por e-mail | `src/App.tsx:255` força `plan: 'pro'` para `jvictodacruz13@gmail.com` | Regra de negócio sensível depende do cliente; difícil de manter e fácil de quebrar | Alta | Remover bypass do cliente e centralizar entitlement em fonte confiável (Firestore/claims/funcão serverless) |
| F-005 | **Alto** | Tratamento de erro duplicado e inconsistente | Handler forte fora do componente em `src/App.tsx:119`, mas o componente redefine um stub em `src/App.tsx:195` | A experiência de erro perde padronização; parte dos erros só faz log e não gera feedback rico | Alta | Unificar o tratamento em um único util/hook e remover o handler shadowing |
| F-006 | **Médio** | Acessibilidade e SEO básicos estão desalinhados com o produto | `index.html:2` usa `lang="en"`; `index.html:6` usa `My Google AI Studio App`; botões de ação/fechamento icon-only em `src/App.tsx:1487`, `src/App.tsx:1563`, `src/App.tsx:1612`, `src/App.tsx:1649`, `src/App.tsx:1687`, `src/App.tsx:1746`; avatar com `alt="User"` em `src/App.tsx:729` | Screen readers, preview social e indexação ficam prejudicados; UX de teclado/assistiva fica mais fraca | Alta | Ajustar `lang="pt-BR"`, título e meta description; adicionar `aria-label` nos botões icon-only e descrever melhor imagens |
| F-007 | **Médio** | O sistema de tema existe, mas a UI usa muitos hardcodes | Variáveis semânticas em `src/index.css:12`, porém a UI usa cores literais em `src/App.tsx:627` e em vários modais | Trocas de tema e manutenção visual ficam mais caras; drift entre componentes é provável | Alta | Migrar para tokens semânticos, reduzir literais e centralizar estilos do sistema visual |
| F-008 | **Médio** | Dependências e supply chain estão inchados | `package.json:20` (`express`), `package.json:19` (`dotenv`) e `package.json:29` (`sonner`) não aparecem usados em `src/`; `npm audit` reportou `4` vulnerabilidades | Aumenta superfície de manutenção/instalação e introduz ruído de segurança | Média | Remover dependências mortas e tratar vulnerabilidades no pipeline de atualização |

## Observações de UX/Render
- A tela principal mistura dashboard, estado, formulário, modais e IA no mesmo componente, o que tende a ampliar re-renders.
- A navegação lateral tem estrutura razoável, mas muitos botões dependem de estados locais do `App.tsx`, reforçando o acoplamento.
- O uso de `confirm()` em ações destrutivas/importação é funcional, mas é um padrão pobre para UX e acessibilidade.

## Scorecard Inicial
| Dimensão | Nota | Leitura curta |
|---|---:|---|
| Arquitetura frontend | 2.0/5 | Muito concentrada em um único arquivo |
| Manutenibilidade | 2.0/5 | Lógica misturada e difícil de evoluir |
| Performance de render | 2.5/5 | Funcional, mas com blast radius alto |
| Acessibilidade | 2.0/5 | Básicos existem, mas faltam labels e head correto |
| SEO técnico | 1.5/5 | `lang` e `title` genéricos/incompatíveis |
| Segurança frontend | 2.0/5 | Regras existem, mas segredos/entitlements no cliente preocupam |
| Qualidade de build | 1.0/5 | Build quebrado na instalação atual |

## Conclusão
- O frontend tem boa base de produto, mas o estado atual não é o de uma app modular e sustentável.
- O primeiro bloqueio real é o build quebrado.
- Em seguida, o maior risco é estrutural: `src/App.tsx` centraliza demais e o cliente carrega regras sensíveis que deveriam ser mais protegidas.
- Se o objetivo é escalar com segurança, a próxima fase precisa separar domínio, endurecer a estratégia de segredos e corrigir a camada mínima de a11y/SEO.
