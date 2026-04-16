# Infra / DevOps Review — New-Project

## Resumo do domínio
O repositório tem maturidade operacional baixa para um produto que se apresenta como ERP corporativo com IA. Ele é pequeno, simples e fácil de executar localmente, mas isso vem com pouca governança: não há pipeline versionado, não há suíte de testes, não há artefatos de deploy/rollback, e a configuração de runtime mistura segredos, build e ambiente de desenvolvimento em poucos arquivos.

## Verificações executadas
- `npm run lint` ✅
- `npm run build` ❌ falhou por resolução de dependência (`d3-shape` via `victory-vendor`)
- `npm audit --omit=dev` ❌ reportou `4` vulnerabilidades em dependências transitivas

## Principais riscos
1. Falta de pipeline de CI/CD e gates automatizados.
2. Build atualmente quebrado no working tree por dependência não resolvida.
3. Segredo de Gemini é injetado no bundle client-side.
4. Não existe estratégia operacional explícita de backup, restore, rollback ou observabilidade real.
5. A documentação afirma uma maturidade de segurança/monitoramento maior do que o código demonstra.

## Achados detalhados

### F-01 — Build falha por dependência não resolvida
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** `npm run build` falhou com `Rollup failed to resolve import "d3-shape" from "node_modules/victory-vendor/es/d3-shape.js"`.
- **Impacto:** O projeto não tem release confiável no estado atual; qualquer deploy automatizado vai quebrar até a cadeia de dependências ser corrigida.
- **Diagnóstico:** `npm ls d3-shape victory-vendor --all` mostrou ambos como `extraneous`, o que aponta para instalação desalinhada/inconsistente no ambiente atual.
- **Recomendação:** reinstalar dependências de forma limpa e travar o estado de build em CI; revisar a origem de `victory-vendor`/`d3-shape` antes de liberar release.

### F-02 — Ausência total de CI/CD versionado
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** não existe pasta `.github/` no repositório; `git ls-files` não lista workflows.
- **Impacto:** Sem build/lint/test automatizados no repositório, regressões e falhas de pacote só aparecem manualmente.
- **Recomendação:** adicionar pipeline mínima com `install`, `lint`, `build` e checagem de segurança das dependências.

### F-03 — Não há suíte de testes nem script `test`
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** `package.json` tem apenas `dev`, `build`, `preview`, `clean`, `lint`; não existe `test`.
- **Impacto:** Fluxos críticos de auth, Firestore, importação e IA dependem de validação manual.
- **Recomendação:** criar testes básicos para login, CRUD principal, importação/exportação e regras de negócio do PRO.

### F-04 — Segredo da Gemini vai para o bundle do cliente
- **Severidade:** Crítico
- **Confiança:** Alta
- **Evidência:** `vite.config.ts:11` injeta `process.env.GEMINI_API_KEY` no frontend; `src/services/geminiService.ts:4` consome essa variável diretamente no navegador.
- **Impacto:** qualquer usuário com acesso ao bundle pode extrair a chave; isso é risco de abuso de quota, custo e uso indevido da API.
- **Recomendação:** mover a chamada Gemini para backend/serverless ou usar um proxy seguro; nunca tratar a chave como segredo client-side.

### F-05 — Bypass de plano PRO hardcoded no cliente
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** `src/App.tsx:254-257` força `plan: 'pro'` para um e-mail específico.
- **Impacto:** regra de negócio e permissão de monetização ficam no cliente e podem ser adulteradas; isso também dificulta ambientes diferentes de produção.
- **Recomendação:** mover autorização de plano para fonte confiável e remover exceções hardcoded do frontend.

### F-06 — Observabilidade é mais declarada do que implementada
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:** o README fala em Google Cloud Logging/SOC e `system_logs` (`README.md:71-85`, `README.md:145`), mas não há implementação de logging, métricas, tracing ou alertas no código.
- **Impacto:** falhas de produção serão difíceis de rastrear; hoje o diagnóstico depende de `console.error` e `toast`.
- **Recomendação:** alinhar documentação com a realidade ou implementar logging estruturado e coleta de eventos de erro.

### F-07 — Configuração e ambiente estão pouco governados
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:** `.env.example` contém `GEMINI_API_KEY` e `APP_URL`; `vite.config.ts` usa `loadEnv` e `process.env.DISABLE_HMR`, mas não há validação formal de variáveis nem docs de deploy.
- **Impacto:** setup é frágil e dependente do conhecimento tácito de quem executa.
- **Recomendação:** documentar variáveis obrigatórias, validar envs no startup e separar ambiente de desenvolvimento de ambiente de produção.

### F-08 — Dependência de produção sem uso aparente
- **Severidade:** Baixo
- **Confiança:** Média
- **Evidência:** `package.json` inclui `express`, mas não há servidor Node/Express no código do repo.
- **Impacto:** ruído de manutenção, imagem de complexidade e possível peso desnecessário do lockfile.
- **Recomendação:** remover dependência morta ou justificar explicitamente seu uso.

### F-09 — Dependências transitivas com vulnerabilidades conhecidas
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** `npm audit --omit=dev` reportou `4` vulnerabilidades: `brace-expansion` (moderada), `path-to-regexp` (alta), `picomatch` (alta) e `vite` (alta).
- **Impacto:** a cadeia de supply chain atual não está limpa; o risco afeta segurança, estabilidade do dev server e confiança no build/release.
- **Recomendação:** atualizar dependências e revalidar a árvore após a correção, preferencialmente com lockfile regenerado em ambiente limpo.

## Maturidade DevOps
- **Build:** 1/5 — hoje falha no working tree atual.
- **CI/CD:** 0.5/5 — inexistente no repositório.
- **Release/rollback:** 0/5 — sem evidência de estratégia formal.
- **Observabilidade:** 1/5 — há intenção no README, mas pouca implementação.
- **Operação local:** 2/5 — scripts básicos existem, mas são mínimos.
- **Supply chain:** 1.5/5 — há vulnerabilidades transitivas ativas no estado atual.

## Recomendações concretas
1. Corrigir a cadeia de dependências que quebra o build.
2. Remover segredo de API do bundle cliente.
3. Adicionar workflow mínimo de CI.
4. Criar teste automatizado para import/export + auth + regras Firestore.
5. Formalizar variáveis de ambiente e separar dev/prod.
6. Revisar o README para não prometer segurança/observabilidade além do que existe.

## Conclusão
O projeto é funcional como app de portfólio/protótipo avançado, mas ainda não tem governança DevOps compatível com o discurso do README. O principal problema operacional não é complexidade de infraestrutura; é ausência de disciplina: build quebrado, sem CI, sem testes, sem rollback e com segredo sensível exposto no cliente.
