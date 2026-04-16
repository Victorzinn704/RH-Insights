# Security Review — `New-Project`

**Escopo:** AppSec, auth, authz, Firestore Rules, segredos, exposição de dados, supply chain e riscos de IA  
**Data:** `2026-04-09`  
**Método:** leitura profunda do código + validações locais (`npm install`, `npm run lint`, `npm audit`, `npm run build`)

## Resumo executivo

O projeto tem uma base de segurança **melhor do que a média para um app Firebase pequeno**, principalmente porque há regras Firestore com ownership por `uid` e validação de campos. Isso reduz bastante o risco de acesso cruzado acidental.

O problema é que a segurança do produto está **centralizada demais no cliente**. O app mistura controle de autorização, lógica de plano PRO, IA, importação de dados e logs de erro em um único componente grande (`src/App.tsx`), e parte da governança de acesso é decidida pelo próprio browser. Isso cria um risco alto de bypass lógico, vazamento de dados sensíveis e inconsistência entre “segurança pretendida” e “segurança efetiva”.

Validações locais:
- `npm run lint` ✅
- `npm install` ✅
- `npm audit` ⚠️ `4` vulnerabilidades conhecidas
- `npm run build` ❌ falha por dependência ausente (`idb`) na árvore do Firebase

## Principais riscos

| Risco | Severidade | Confiança | Impacto |
|---|---|---:|---|
| Plano PRO controlado no cliente e “admin” hardcoded por e-mail | Crítico | Alta | Qualquer usuário autenticado pode tentar elevar privilégios/contornar gating |
| Chave do Gemini exposta no bundle do cliente | Alto | Alta | Segredo operacional vira configurável por qualquer usuário com acesso ao bundle |
| Build não reproduzível por dependência faltando (`idb`) | Alto | Alta | A aplicação não fecha produção com `npm run build` no estado atual |
| Dependências com vulnerabilidades conhecidas | Alto | Alta | Vite e transitive deps com advisories ativos no `npm audit` |
| Logs de erro incluem metadados de autenticação | Médio | Alta | Exposição de PII e contexto de sessão no console |

## Achados detalhados

### S-001 — Bypass de plano PRO no cliente
- **Severidade:** Crítico
- **Confiança:** Alta
- **Evidência:**
  - `src/App.tsx:255-256` define `pro` automático para `user.email === 'jvictodacruz13@gmail.com'`
  - `src/App.tsx:403-410` grava `plan: 'pro'` diretamente em `subscriptions`
  - `src/App.tsx:333,354,376,674,1219,1229` usa `subscription?.plan !== 'pro'` para bloquear recursos
  - `firestore.rules:98-102` permite `create/update` de `/subscriptions/{subId}` para o próprio dono, desde que o payload seja válido
- **Por que importa:**
  - O PRO não é controlado por um servidor confiável nem por claims verificados; ele depende de uma coleção que o próprio cliente consegue escrever.
  - O e-mail hardcoded cria uma porta privilegiada embutida no frontend.
- **Impacto:**
  - Bypass de feature gating.
  - Risco de abuso do modo PRO e de inconsistência de faturamento/controle.
  - Fragilidade de governança: qualquer pessoa com acesso ao browser/devtools pode tentar reproduzir a mesma escrita que o UI faz.
- **Recomendação:**
  - Remover qualquer regra de privilégio por e-mail no frontend.
  - Mover decisão de plano para uma fonte confiável: custom claims, backend callable/function, ou coleção com escrita restrita por servidor.
  - Se o modelo for demo/portfólio, documentar isso explicitamente no README para não vender a regra como segurança real.

### S-002 — Gemini API key exposta no bundle do cliente
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:**
  - `vite.config.ts:10-11` injeta `process.env.GEMINI_API_KEY` no build do frontend
  - `src/services/geminiService.ts:1-4` instancia `GoogleGenAI` diretamente no browser
  - `.env.example:1-4` descreve a chave como configuração de runtime do applet
- **Por que importa:**
  - Chave usada no cliente não é segredo operacional de verdade; qualquer usuário consegue extrair do bundle ou do runtime.
  - Isso facilita abuso de quota, uso indevido e custo inesperado.
- **Impacto:**
  - Exposição de credencial.
  - Possível consumo indevido de quota do Gemini.
  - Dificulta rotação e governança.
- **Recomendação:**
  - Migrar chamadas do Gemini para uma camada server-side ou função serverless com chave guardada no servidor.
  - Se a arquitetura precisar continuar client-side, restringir a chave ao máximo e tratar como credencial pública/limitada, não como segredo.

### S-003 — Build quebrado por dependência ausente e árvore inconsistente
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:**
  - `npm run build` falha com: `Rollup failed to resolve import "idb" from ... @firebase/app ...`
  - `npm ls idb` retorna árvore vazia
  - `package.json:21` traz `firebase`
  - `package.json:31` e `package.json:40` duplicam `vite` em dependências e devDependencies
- **Por que importa:**
  - O projeto não fecha produção de forma reproduzível.
  - A árvore duplicada de `vite` e a dependência ausente indicam governança fraca de supply chain e instalação.
- **Impacto:**
  - Bloqueio de release.
  - Risco de breakage em CI e ambiente novo.
  - Ambiente local pode divergir do esperado.
- **Recomendação:**
  - Adicionar a dependência faltante ou ajustar a versão/entrada do Firebase para resolver a árvore.
  - Remover a duplicação de `vite` do `package.json`.
  - Revalidar `npm install && npm run build` como gate obrigatório.

### S-004 — Vulnerabilidades conhecidas na cadeia de dependências
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:**
  - `npm audit --omit=dev --json` aponta 4 vulnerabilidades: `vite` (2 highs), `path-to-regexp` (high), `picomatch` (high/moderate), `brace-expansion` (moderate)
  - `package.json:31` expõe `vite` como dependência de runtime do projeto
- **Por que importa:**
  - A base já está com advisories conhecidos e fixáveis.
  - Algumas delas afetam diretamente a cadeia de build/dev server.
- **Impacto:**
  - Risco operacional e de tooling.
  - Possível superfície de ataque em dev/build.
- **Recomendação:**
  - Atualizar `vite` para versão corrigida.
  - Rodar `npm audit fix` com validação posterior.
  - Idealmente separar dependências de runtime vs. dev para reduzir superfície.

### S-005 — Logs de erro incluem dados de autenticação e contexto sensível
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:**
  - `src/App.tsx:119-129` monta `FirestoreErrorInfo` com `userId`, `email`, `emailVerified`, `tenantId` e `providerData`
  - `src/App.tsx:119-129` faz `console.error('Firestore Error: ', JSON.stringify(errInfo))`
- **Por que importa:**
  - O console do browser pode expor metadados sensíveis de sessão e conta.
  - Em ambientes compartilhados, suporte, extensões ou screenshots, isso vira vazamento de privacidade desnecessário.
- **Impacto:**
  - Exposição de PII e contexto de autenticação.
  - Dificulta aderência ao princípio de minimização de dados.
- **Recomendação:**
  - Reduzir o payload logado no browser.
  - Separar log técnico local de payload de diagnóstico mais detalhado, se houver pipeline seguro para isso.

### S-006 — Segurança de dados depende quase totalmente do cliente + rules
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:**
  - `src/App.tsx:224-264` cria listeners e filtra por `where('uid', '==', user.uid)`
  - `firestore.rules:71-109` aplica ownership/validação por coleção
- **Por que importa:**
  - O app não possui backend próprio para arbitrar decisões de negócio.
  - O cliente assume muita responsabilidade de gating, enquanto as rules protegem apenas o que foi modelado corretamente.
- **Impacto:**
  - Risco de lógica de negócio duplicada.
  - Maior chance de inconsistência entre UI e autorização efetiva.
- **Recomendação:**
  - Consolidar as regras críticas em um serviço confiável ou claims.
  - Manter as rules como defesa, mas não como única origem da decisão de produto.

## O que está bom

- `firestore.rules:71-109` têm ownership por `uid` e validação estrutural por coleção.
- `src/App.tsx:443-496` limita importação em lote a `500` itens, reduzindo abuso/quota exhaustion.
- `src/App.tsx:321-326` e fluxos de write usam confirmações explícitas para ações destrutivas no cliente.
- `src/components/ErrorBoundary.tsx` existe e evita crash total da UI.

## Verificações executadas

- `npm install` → concluiu com sucesso, mas o `npm audit` reportou 4 vulnerabilidades conhecidas.
- `npm run lint` → passou.
- `npm run build` → falhou por resolução ausente de `idb` na cadeia do Firebase.
- `npm audit --omit=dev --json` → encontrou vulnerabilidades em `vite`, `path-to-regexp`, `picomatch` e `brace-expansion`.

## Recomendação final

O projeto está **razoavelmente protegido em regras Firestore**, mas ainda **frágil em governança de privilégios, segredo do Gemini e reprodução de build**. Antes de escalar features, eu priorizaria:

1. Remover o bypass PRO hardcoded e mover autorização para uma fonte confiável.
2. Tirar a chave do Gemini do cliente.
3. Corrigir a dependência faltante e a duplicidade de `vite`.
4. Atualizar dependências vulneráveis.
5. Reduzir logs com PII no browser.

