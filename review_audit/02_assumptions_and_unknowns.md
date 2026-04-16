# 02 — Hipóteses, Incógnitas e Lacunas

## Hipóteses Confirmadas (fato por leitura de código)
1. **Firebase como backend completo** — Auth + Firestore, sem servidor próprio
2. **API key do Gemini no client** — `process.env.GEMINI_API_KEY` é injetada no bundle do browser via Vite
3. **Upgrade para Pro é client-side** — `setDoc` direto no Firestore, sem gateway de pagamento
4. **Backdoor Pro hardcoded** — email `jvictodacruz13@gmail.com` recebe Pro automaticamente (App.tsx:255)
5. **Sem testes** — zero arquivos de teste no repositório
6. **Sem CI/CD** — nenhum pipeline, workflow ou script de deploy automatizado
7. **Express não usado** — declarado em deps mas nenhum import no código fonte
8. **Monólito frontend** — App.tsx tem ~1774 linhas com toda lógica, UI, state, CRUD, modais

## Hipóteses Fortes (inferência com alta confiança)
1. **firebase-applet-config.json está no git** — importado diretamente, provavelmente contém projectId, apiKey, etc.
2. **Deploy via Vercel/Netlify** — padrão para SPA React, mas não confirmado
3. **Dados de câmbio são cacheados apenas em memória** — fetch só no mount, sem refresh periódico
4. **Sem paginação** — onSnapshot traz TODOS os documentos de cada coleção

## Incógnitas / Não Verificável
1. **Conteúdo de firebase-applet-config.json** — não lido (pode conter secrets)
2. **.env.example** — não lido, não sei quais vars são esperadas
3. **README.md** — não lido, não sei o nível de documentação
4. **Regras de Firestore em produção** — não sei se as regras atuais estão deployadas
5. **Tráfego real / usuários** — não há métricas de uso
6. **metadata.json** — propósito não claro
7. **firebase-blueprint.json** — propósito não claro

## Lacunas Críticas
1. **Zero validação client-side** além de `required` nos forms HTML
2. **Zero tratamento de loading** para operações assíncronas (exceto AI analysis)
3. **Zero paginação ou limit** nos listeners Firestore — escala linearmente com dados
4. **Zero retry/reconnect logic** — se Firestore cair, app não recupera
5. **Zero rate limiting** no client para chamadas à Gemini API
