# QA/Test Review — `New-Project`

## Resumo
O projeto compila e passa no typecheck, mas a estratégia de qualidade está fraca para um app com Firestore, IA, importação de dados e um `App.tsx` muito concentrado.  
O maior risco não é a build falhar hoje; é regressão silenciosa em fluxos críticos sem cobertura automatizada.

## Validações executadas
- `npm run build` ✅
- `npm run lint` (`tsc --noEmit`) ✅
- `npm audit --audit-level=high` ⚠️ retornou `4` vulnerabilidades

## Principais riscos
- Não existe suíte de testes no repositório.
- Não existe script `test` em `package.json`.
- O app depende de uma classe de regressões que hoje só a build/typecheck detectam.
- O bundle gerado já passa de `500 kB` e o build emite warning de chunks grandes.
- Há dependências com vulnerabilidades de severidade alta no grafo atual.

## Achados detalhados

### QA-01 — Ausência total de testes automatizados
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:**
  - `package.json:6-11` tem `dev`, `build`, `preview`, `clean`, `lint`, mas não tem `test`
  - não há arquivos encontrados por `rg --files ... | rg "test|spec|vitest|jest|playwright|cypress|mock|__tests__"`
- **Impacto:**
  - nenhum fluxo crítico tem regressão protegida por testes
  - mudanças em CRUD, regras de plano PRO, importação/exportação e IA podem quebrar sem aviso
- **Recomendação:**
  - adicionar uma suíte mínima com foco em `App`/helpers puros e flows de Firestore/IA mockados
  - começar por testes de regra de plano, importação de JSON, cálculo de câmbio e formatação

### QA-02 — `App.tsx` concentra demais a lógica e dificulta testabilidade
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:**
  - `src/App.tsx:144-210` concentra vários `useState`
  - `src/App.tsx:227-264` concentra listeners Firestore
  - `src/App.tsx:278-528` concentra login, CRUD, import/export, IA e regras de negócio
  - arquivo tem ~`102 KB`
- **Impacto:**
  - a maior parte do comportamento fica acoplada à UI
  - qualquer teste exige mocks pesados de Firebase, `FileReader`, `localStorage`, `confirm`, `fetch` e Gemini
  - a chance de regressão aumenta porque uma mudança em uma área afeta várias outras
- **Recomendação:**
  - extrair lógica para hooks/serviços puros e reduzir `App.tsx` para composição
  - isolar funções puras para testes unitários antes de atacar integração

### QA-03 — Cobertura fraca dos fluxos críticos de produto
- **Severidade:** Alto
- **Confiança:** Média-Alta
- **Evidência:**
  - fluxos críticos existem no código, mas sem nenhum teste visível
  - exemplos: login (`src/App.tsx:278`), leitura em tempo real (`src/App.tsx:227-264`), importação em lote (`src/App.tsx:443-500`), upgrade PRO (`src/App.tsx:406-414`)
- **Impacto:**
  - bugs nesses fluxos derrubam o produto inteiro, não apenas uma tela
  - importação em lote e regras de acesso são áreas com alto custo de regressão
- **Recomendação:**
  - testar primeiro os fluxos que mexem com dados e autorização
  - incluir testes de falha, não só caminho feliz

### QA-04 — Build passa, mas bundle final está grande demais
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:**
  - `npm run build` concluiu com sucesso
  - warning do Vite: chunk principal de `1,697.68 kB` e sugestão de code-splitting
- **Impacto:**
  - regressões de performance e hidratação podem passar despercebidas
  - sem testes de performance/size, a aplicação pode crescer e degradar sem alarme
- **Recomendação:**
  - adicionar guardrail de tamanho de bundle
  - separar partes pesadas do `App.tsx` em módulos carregáveis sob demanda

### QA-05 — Tipagem ainda deixa lacunas que reduzem confiança
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:**
  - `src/App.tsx:195` usa `any` em `handleFirestoreError`
  - `src/types.ts:27`, `46`, `54` usam `any` para datas
  - `src/services/geminiService.ts:33` usa `any[]` para `expenses`
- **Impacto:**
  - dados, timestamps e erros podem mudar de forma silenciosa
  - testes ficam menos confiáveis porque o compilador não protege os contratos
- **Recomendação:**
  - substituir `any` por tipos específicos de Firestore e timestamps
  - criar tipos de erro/retorno para a integração com Gemini

### QA-06 — Dependências com vulnerabilidades de alta severidade
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:**
  - `npm audit --audit-level=high` retornou `4` vulnerabilidades
  - `vite` aparece com advisory de alta severidade
  - `path-to-regexp` e `picomatch` também aparecem no relatório
- **Impacto:**
  - o ambiente de desenvolvimento e build fica mais exposto a problemas de supply chain
  - a qualidade do release fica dependente de uma árvore de dependências com risco conhecido
- **Recomendação:**
  - rodar `npm audit fix` com validação de build
  - revisar impacto real das versões transitivas antes de promover release

### QA-07 — Estratégia de validação manual está forte demais
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:**
  - o projeto usa `confirm(...)` para exclusões e importações (`src/App.tsx:321`, `443`)
  - não há automação para garantir que esses fluxos continuem corretos
- **Impacto:**
  - muita confiança vai para clique manual e leitura visual
  - isso é frágil para regressões em tela, permissões e importação
- **Recomendação:**
  - cobrir esses fluxos com teste de unidade/integração e, se possível, um smoke E2E

## Confiabilidade geral
- **Build:** boa no estado atual
- **Typecheck:** boa no estado atual
- **Testabilidade:** fraca
- **Risco de regressão:** alto
- **Maturidade de qualidade:** baixa para um produto que mexe com dados, auth e IA

## Recomendação objetiva
1. Criar `test` script e uma suíte mínima.
2. Extrair lógica de `App.tsx` para módulos testáveis.
3. Cobrir os fluxos críticos: login, leitura Firestore, CRUD, import/export, plano PRO, IA.
4. Adicionar guardrails de bundle e dependências.
5. Corrigir os `any` mais críticos para aumentar confiança de teste.

