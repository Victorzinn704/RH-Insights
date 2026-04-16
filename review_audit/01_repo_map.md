# 01 — Mapa do Repositório

## Identidade
- **Repo:** https://github.com/Victorzinn704/New-Project
- **Nome no package.json:** `react-example` (genérico, não reflete o produto)
- **Produto:** HR Insight — plataforma de gestão de RH + finanças com IA (Gemini)
- **Branch atual:** master
- **Último commit:** `e297547` — feat: Fetch exchange rates dynamically

## Stack
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | Tailwind CSS v4 (via @tailwindcss/vite) |
| UI | motion/react, lucide-react, recharts, react-markdown |
| Notificações | react-hot-toast, sonner |
| Backend/DB | Firebase (Auth + Firestore) — serverless |
| IA | Google Gemini (`@google/genai`) — modelo `gemini-3-flash-preview` |
| Server-side | Express 4 (declarado em deps, mas não usado no código fonte) |
| Utils | date-fns (pt-BR), clsx, tailwind-merge, dotenv |
| Build | Vite 6, TypeScript 5.8 |

## Estrutura de Arquivos (excluindo node_modules/dist)
```
New-Project/
├── src/
│   ├── App.tsx              # ~1600+ linhas — TODA a lógica do app (monólito)
│   ├── main.tsx             # Entry point React
│   ├── firebase.ts          # Inicialização Firebase
│   ├── types.ts             # 7 interfaces/types exportados
│   ├── components/
│   │   └── ErrorBoundary.tsx
│   └── services/
│       └── geminiService.ts # 2 funções: analyzeEmployeePerformance, getStrategicDecision
├── index.html               # HTML shell
├── vite.config.ts           # Vite config
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies
├── package-lock.json        # Lockfile
├── firebase-applet-config.json  # Firebase config (projeto ID, etc.)
├── firebase-blueprint.json
├── firestore.rules          # Regras do Firestore
├── .env.example
├── metadata.json
├── .gitignore
└── README.md
```

## Apps/Serviços
- **1 app frontend** (SPA React)
- **0 backends próprios** — tudo via Firebase (Auth + Firestore)
- **0 workers/jobs**
- **0 testes** — nenhum arquivo de teste encontrado
- **0 CI/CD** — nenhum pipeline configurado

## Fluxos Críticos
1. **Auth:** Google Sign-In via Firebase Auth → onAuthStateChanged → libera acesso
2. **Data:** 5 listeners onSnapshot simultâneos (employees, expenses, inventory, revenue, portfolios, subscriptions)
3. **CRUD:** Funcionários, Despesas, Estoque, Receita, Portfólio — tudo direto do frontend para Firestore
4. **IA:** Gemini API chamada diretamente do browser (API key no client!)
5. **Pro/Free:** Flag de subscription hardcoded para email específico (`jvictodacruz13@gmail.com`)
6. **Import/Export:** JSON backup via download/upload com batch write

## Integrações Externas
- Firebase Auth (Google)
- Firebase Firestore
- Gemini API (`@google/genai`)
- AwesomeAPI (economia.awesomeapi.com.br) para câmbio

## Arquivos Grandes
- `src/App.tsx` — ~1600+ linhas (arquivo monolítico, god component)

## Código Morto / Não Usado
- `express` e `@types/express` nas deps — nenhum import no código fonte
- `sonner` nas deps — nenhum import no código fonte
- `dotenv` nas deps — não usado (Vite usa .env automaticamente)
- `ErrorBoundary.tsx` — verificar se é importado em main.tsx
- `OperationType` enum — definido mas parcialmente usado
- `handleFirestoreError` duplicado — existe nas linhas 119-141 E nas linhas 195-198 (shadowing)
