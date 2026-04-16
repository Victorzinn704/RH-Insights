# Product / UX Review — New-Project

## Resumo Executivo

O projeto entrega uma proposta clara de valor: um ERP leve para RH, finanças e estoque com IA integrada. A experiência, porém, está concentrada em um único componente gigante e em um shell desktop-first, o que aumenta fricção de uso, dificulta evoluções e reduz previsibilidade de responsividade. A documentação vende um nível de maturidade superior ao que o código mostra hoje.

**Leitura rápida**
- Produto: proposta boa e compreensível.
- UX: funcional, mas muito monolítica e pouco adaptada a fluxos reais de uso em telas menores.
- Acessibilidade: básica, com lacunas relevantes em diálogo modal, botões só com ícone e navegação por teclado.
- Prontidão de entrega: ainda bloqueada por build quebrado e ausência de suíte de testes.

## Riscos Principais

| Risco | Impacto | Probabilidade | Observação |
|---|---|---:|---|
| Shell monolítico em `App.tsx` | Alto | Alta | O app inteiro concentra estado, UI, dados, auth e IA em um único arquivo |
| UX desktop-first | Alto | Alta | Sidebar fixa e layouts largos não mostram adaptação real para mobile |
| Fluxo de login frágil | Médio/Alto | Alta | O login depende só de popup |
| A11y insuficiente em modais e ações | Médio | Alta | Falta semântica de diálogo e labels para ações só com ícone |
| Build quebrado | Alto | Alta | `vite build` falha no ambiente validado |
| Segurança/percepção de confiança | Alto | Média | README promete maturidade operacional maior do que o código entrega |

## Achados Detalhados

### F-UX-01 — `App.tsx` concentra o produto inteiro em um único shell
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** `src/App.tsx:145`, `src/App.tsx:626`, `src/App.tsx:1482`, `src/App.tsx:1733`
- **Impacto:** a navegação, os listeners Firestore, a camada de IA, o tema, os modais e o CRUD vivem no mesmo arquivo. Isso dificulta entender o fluxo do usuário, aumenta risco de regressão e torna qualquer melhoria de UX cara de manter.
- **Por que importa no produto:** a experiência fica difícil de evoluir com segurança; pequenas alterações de interface tendem a afetar vários fluxos ao mesmo tempo.
- **Recomendação concreta:** quebrar por domínio e fluxo: shell/auth, dashboard, RH, finanças, estoque, portfólio, IA e modais em componentes/hook separados; mover regras derivadas para hooks ou services de UI.

### F-UX-02 — Navegação baseada só em estado local, sem rotas/deep links
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** `src/App.tsx:146`, `src/App.tsx:647`, `src/App.tsx:747`; ausência de router em `package.json:6`
- **Impacto:** o usuário não consegue compartilhar um link direto para uma seção, recarregar a página preservando contexto ou usar histórico do navegador de forma natural. Isso reduz produtividade e percepção de produto “profissional”.
- **Por que importa no produto:** um ERP tende a ser usado por fluxo e por contexto; tabs internas sem URL viram fricção quando a operação cresce.
- **Recomendação concreta:** introduzir rotas ou pelo menos sincronizar `activeTab` com URL (`search params`/hash) para permitir deep links e restore de estado.

### F-UX-03 — Layout principal é desktop-first e pouco adaptado a mobile
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** `src/App.tsx:627`, `src/App.tsx:629`, `src/App.tsx:746`, `src/App.tsx:1491`, `src/App.tsx:1691`
- **Impacto:** a sidebar fixa `w-72` + `main p-10` e formulários em duas colunas criam compressão em telas pequenas; a experiência móvel tende a virar scroll horizontal, densidade excessiva e toque impreciso.
- **Por que importa no produto:** parte dos fluxos administrativos é usada em notebook/tablet/celular; se o layout não responde bem, a adoção cai mesmo com backend correto.
- **Recomendação concreta:** criar navegação colapsável para mobile, reduzir padding em breakpoints menores, empilhar formulários e transformar tabelas densas em cards/resumos nas telas pequenas.

### F-UX-04 — Login depende exclusivamente de popup
- **Severidade:** Médio/Alto
- **Confiança:** Alta
- **Evidência:** `src/App.tsx:276`
- **Impacto:** browsers com bloqueio de popup, webviews e alguns fluxos mobile podem falhar ou exigir tentativa extra. O usuário percebe isso como instabilidade de acesso.
- **Por que importa no produto:** o primeiro contato com o sistema é o login; se ele falha, o valor do ERP nem chega a ser percebido.
- **Recomendação concreta:** adicionar fallback de login mais resiliente e feedback de erro orientado ao usuário quando o popup falhar.

### F-UX-05 — Acessibilidade de modais e ações ícone-only é fraca
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:** `src/App.tsx:1483`, `src/App.tsx:1563`, `src/App.tsx:1612`, `src/App.tsx:1649`, `src/App.tsx:1687`, `src/App.tsx:1746`; ausência de `aria-*` no app e botões de fechar só com ícone
- **Impacto:** usuários de teclado e leitores de tela têm dificuldade para entender contexto, foco e fechamento de modais. A UI fica visualmente boa, mas operacionalmente mais frágil.
- **Por que importa no produto:** acessibilidade ruim reduz qualidade percebida e pode bloquear uso em ambientes corporativos com requisitos de conformidade.
- **Recomendação concreta:** trocar os modais por estrutura semântica de diálogo (`role="dialog"`, `aria-modal`, títulos associados), adicionar `aria-label` aos botões ícone-only e implementar foco inicial/retorno de foco.

### F-UX-06 — Feedback de erro inconsistente e um handler estruturado parece morto
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:** handler estruturado em `src/App.tsx:119`; handler simples e local em `src/App.tsx:194`
- **Impacto:** o app promete telemetria rica no tratamento de Firestore, mas o handler usado dentro do componente só faz `console.error`. Isso enfraquece feedback para o usuário e confunde a manutenção.
- **Por que importa no produto:** quando algo falha, o sistema deveria orientar o usuário e registrar contexto útil; hoje parte dessa promessa fica só no papel.
- **Recomendação concreta:** unificar o tratamento de erro em uma única função, com mensagem de usuário consistente e payload estruturado para observabilidade.

### F-UX-07 — Build está quebrado no ambiente validado
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** `npm run build` falhou com resolução de `@reduxjs/toolkit` a partir de `recharts`
- **Impacto:** o produto não está pronto para release confiável; isso bloqueia preview/produção e destrói a confiança de entrega.
- **Por que importa no produto:** UX não existe se o build não fecha; é um bloqueio de acesso do usuário final.
- **Recomendação concreta:** corrigir a cadeia de dependência/importação do `recharts` antes de qualquer refinamento visual; validar o bundle final novamente.

### F-UX-08 — Ausência de estratégia de testes deixa a UX sem rede de proteção
- **Severidade:** Alto
- **Confiança:** Alta
- **Evidência:** scripts em `package.json:6` a `package.json:11` não incluem `test`; nenhum arquivo de teste foi encontrado no repo
- **Impacto:** regressões de fluxo, layout e comportamento tendem a entrar sem aviso. Para um app orientado a operação, isso é caro.
- **Por que importa no produto:** UX boa exige previsibilidade; sem testes mínimos, qualquer ajuste visual ou funcional vira aposta.
- **Recomendação concreta:** criar suíte mínima para login, CRUD principal, import/export, toggle de tema e renderização de estados vazios/erro.

### F-UX-09 — Mensagem de produto e implementação estão desalinhadas
- **Severidade:** Médio
- **Confiança:** Alta
- **Evidência:** `README.md:1`, `README.md:25`, `README.md:77` versus arquitetura real em `src/App.tsx:145` e `src/App.tsx:626`
- **Impacto:** a documentação promete SOC, observabilidade avançada e maturidade de plataforma, mas o código atual parece mais um app SPA único com Firebase. Isso cria falsa expectativa para usuários e para manutenção futura.
- **Por que importa no produto:** clareza de valor e confiança dependem de documentação honesta; promessa acima da entrega vira dívida de reputação.
- **Recomendação concreta:** alinhar README ao estado real ou evoluir o produto/documentação até que a narrativa seja verdadeira.

### F-UX-10 — Configuração de IA expõe custo e dependência diretamente no cliente
- **Severidade:** Médio
- **Confiança:** Média/Alta
- **Evidência:** `vite.config.ts:11`, `src/services/geminiService.ts:4`
- **Impacto:** a chave é injetada no bundle e a IA é chamada no frontend. Em UX de produto, isso pode gerar risco de custo, limitação e confiança operacional, especialmente se a chave não tiver restrição rígida.
- **Por que importa no produto:** quando a IA falha ou é abusada, o valor percebido do recurso cai rapidamente.
- **Recomendação concreta:** revisar estratégia de chave/restrição e considerar proxy server-side ou limites claros de uso/fallback.

## Validação Técnica

- `npm install` executou com sucesso.
- `npm run lint` passou.
- `npm run build` falhou por resolução de dependência em `@reduxjs/toolkit` via `recharts`.
- `npm audit` reportou `4` vulnerabilidades: `1` moderada e `3` altas.

## Conclusão do Domínio

O produto tem uma proposta boa e útil, mas ainda está mais próximo de um **MVP funcional com aparência forte** do que de um ERP maduro em UX. O principal gargalo não é a falta de features; é a forma como elas estão concentradas e expostas ao usuário. Se eu atacasse só três coisas primeiro, seriam: `App.tsx` monolítico, responsividade mobile e build quebrado.
