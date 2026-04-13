<!-- =================================================================== -->
<!-- HEADER                                                               -->
<!-- =================================================================== -->

<h1 align="center">RH Insights</h1>

<p align="center">
  <sub>Plataforma multi-tenant de gestão de pessoas, finanças e estoque — com <b>Google Gemini</b> como consultor estratégico.</sub>
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-12.10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black">
  <img alt="Gemini AI" src="https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white">
</p>

<p align="center">
  <a href="#-módulos">Módulos</a> ·
  <a href="#-stack-técnica">Stack</a> ·
  <a href="#-segurança-e-soc">Segurança</a> ·
  <a href="#-executar-localmente">Rodar local</a> ·
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 📋 Sobre

**RH Insights** é uma plataforma centrada em **Recursos Humanos** que consolida, no mesmo sistema, operações de RH, Financeiro e Estoque para pequenas e médias empresas. O diferencial é a integração nativa com o **Google Gemini**, que atua como consultor estratégico — gerando análises de desempenho de colaboradores, cruzando contexto financeiro e sugerindo planos de ação em tempo real.

Arquitetura **serverless** (Firebase), foco em **UX minimalista** e **segurança de dados** como prioridade desde o primeiro commit.

---

<!-- =================================================================== -->
<!-- MÓDULOS                                                              -->
<!-- =================================================================== -->

## 🧩 Módulos

<table>
<tr>
<td width="50%" valign="top">

### 👥 Recursos Humanos

Core do sistema. Gestão completa de colaboradores com análise assistida por IA.

- **Cadastro completo** · cargo, salário, área e status
- **Métricas de saúde** · acompanhamento de atestados e bem-estar corporativo
- **Performance com IA** · avaliação automatizada do perfil cruzando cargo, salário e histórico via Gemini

</td>
<td width="50%" valign="top">

### 💰 Financeiro

Controle operacional com análise estratégica por IA.

- **Despesas categorizadas** · Operacional, Marketing, TI e outros
- **Multi-moeda** · BRL, USD, EUR com conversão em tempo real
- **Receitas (PRO)** · fluxo de caixa e cálculo de lucro líquido

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📦 Estoque e Operações

Inventário e identidade da empresa em um só lugar.

- **Controle de inventário** · produtos, quantidades, categorias, valor unitário
- **Portfólio corporativo** · identidade visual, missão, visão e valores

</td>
<td width="50%" valign="top">

### 🧠 Inteligência Artificial & Analytics

Dashboard interativo e consultoria estratégica automatizada.

- **Dashboards dinâmicos** · gráficos em barras, linhas e pizza (Recharts)
- **Consultoria Gemini** · chatbot que analisa despesas vs. receitas e sugere planos de ação
- **System instruction blindada** · prompt injection mitigado por design

</td>
</tr>
<tr>
<td colspan="2" valign="top">

### 🔐 Autenticação & Sistema

- **SSO via Google** (Firebase Authentication) com isolamento de dados por `uid`
- **Export/Import JSON** para backup e portabilidade entre ambientes
- **Notificações em tempo real** (`react-hot-toast` + `sonner`)
- **Dark / Light mode** adaptável à preferência do usuário

</td>
</tr>
</table>

---

<!-- =================================================================== -->
<!-- STACK                                                                -->
<!-- =================================================================== -->

## 🛠️ Stack técnica

<details open>
<summary><b>Frontend</b> · SPA moderna, tipada e responsiva</summary>

<p>
<img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB">
<img src="https://img.shields.io/badge/TypeScript_5.8-3178C6?style=flat-square&logo=typescript&logoColor=white">
<img src="https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white">
<img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
<img src="https://img.shields.io/badge/Motion-0055FF?style=flat-square&logo=framer&logoColor=white">
<img src="https://img.shields.io/badge/Recharts-FF6B6B?style=flat-square">
<img src="https://img.shields.io/badge/Lucide-111111?style=flat-square&logo=lucide&logoColor=white">
<img src="https://img.shields.io/badge/Sonner-000000?style=flat-square">
</p>

</details>

<details open>
<summary><b>Backend & IA</b> · serverless com inteligência integrada</summary>

<p>
<img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black">
<img src="https://img.shields.io/badge/Firestore-FFA000?style=flat-square&logo=firebase&logoColor=white">
<img src="https://img.shields.io/badge/Firebase_Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black">
<img src="https://img.shields.io/badge/@google/genai-8E75B2?style=flat-square&logo=google&logoColor=white">
<img src="https://img.shields.io/badge/Gemini_Pro-8E75B2?style=flat-square&logo=google&logoColor=white">
</p>

</details>

<details open>
<summary><b>Qualidade & operação</b> · SOC-ready, observável, tipado</summary>

<p>
<img src="https://img.shields.io/badge/Google_Cloud_Logging-4285F4?style=flat-square&logo=googlecloud&logoColor=white">
<img src="https://img.shields.io/badge/Firestore_Rules-FF6F00?style=flat-square&logo=firebase&logoColor=white">
<img src="https://img.shields.io/badge/TypeScript_Strict-3178C6?style=flat-square&logo=typescript&logoColor=white">
<img src="https://img.shields.io/badge/Error_Boundaries-EF4444?style=flat-square&logo=react&logoColor=white">
</p>

</details>

---

<!-- =================================================================== -->
<!-- SEGURANÇA                                                            -->
<!-- =================================================================== -->

## 🔒 Segurança e SOC

Segurança tratada como requisito, não como etapa final. A arquitetura foi desenhada para se integrar a um **Security Operations Center** usando as ferramentas nativas do Google Cloud.

### Testes de segurança cobertos

| # | Vetor | Defesa |
|---|---|---|
| 1 | **NoSQL Injection** | Firestore SDK + `firestore.rules` com validação estrita de queries |
| 2 | **XSS** | Sanitização automática do React em toda entrada de dados |
| 3 | **Prompt Injection (IA)** | `systemInstruction` isolada — payloads de usuário nunca sobrescrevem contexto do Gemini |
| 4 | **DoS / Quota Exhaustion** | Importação em massa limitada a 500 registros via `writeBatch` |
| 5 | **Schema Pollution** | Firestore Rules validam tipo e tamanho (ex: strings ≤ 500 chars) |

### Hardening e observabilidade

- **Firestore Security Rules (hardened)** · leitura e escrita restritas ao próprio `uid`; campos imutáveis (como o `uid`) protegidos contra adulteração
- **Error Boundaries** · captura erros de renderização sem derrubar o sistema, exibindo fallback amigável
- **Tratamento estruturado de exceções** · `handleFirestoreError` gera payloads JSON com Operação, Caminho e Auth Info, prontos para **Google Cloud Logging**
- **Alertas SOC** · logs estruturados permitem configurar alertas automáticos para anomalias (ex: múltiplos acessos negados em janela curta)

---

<!-- =================================================================== -->
<!-- RODAR LOCALMENTE                                                     -->
<!-- =================================================================== -->

## 🚀 Executar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20+**
- Git
- Chave de API do Google Gemini ([obter aqui](https://aistudio.google.com/apikey))

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/Victorzinn704/New-Project.git
cd New-Project

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
echo "VITE_GEMINI_API_KEY=sua_chave_api_do_gemini" > .env

# 4. Subir o servidor de desenvolvimento
npm run dev
```

App em `http://localhost:3000`.
> As configurações do Firebase estão injetadas em `firebase-applet-config.json` / `firebase.ts` e funcionam automaticamente em dev.

### Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server (Vite + HMR) na porta 3000 |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Type-check (`tsc --noEmit`) |
| `npm run clean` | Remove a pasta `dist` |

---

<!-- =================================================================== -->
<!-- ESTRUTURA                                                            -->
<!-- =================================================================== -->

## 📂 Estrutura do projeto

```text
.
├── src/
│   ├── components/       # Componentes reutilizáveis (ErrorBoundary, UI)
│   ├── services/         # Integrações externas (geminiService.ts)
│   ├── types/            # Definições TypeScript compartilhadas
│   ├── App.tsx           # Componente raiz + roteamento de abas
│   ├── main.tsx          # Bootstrap React
│   ├── index.css         # Estilos globais + diretivas Tailwind
│   └── firebase.ts       # Configuração e inicialização do Firebase
├── firestore.rules       # Regras de segurança do Firestore (hardened)
├── firebase-applet-config.json
├── vite.config.ts
└── package.json
```

---

<!-- =================================================================== -->
<!-- ROADMAP                                                              -->
<!-- =================================================================== -->

## 🗺️ Roadmap

- [ ] Coleção `system_logs` no Firestore para auditoria persistente em produção
- [ ] **RBAC** (Role Based Access Control) — múltiplos usuários por empresa com perfis Admin / Gerente / Funcionário
- [ ] Exportação de relatórios em PDF
- [ ] Integração com APIs bancárias via **Open Finance**

---

<!-- =================================================================== -->
<!-- AUTOR                                                                -->
<!-- =================================================================== -->

## 👤 Autor

Construído por **João Victor de Moraes da Cruz** — estudante de Engenharia de Software e founder do [Desk Imperial](https://github.com/Victorzinn704/Desk-Imperial-Open-Source).

<p>
  <a href="https://github.com/Victorzinn704"><img src="https://img.shields.io/badge/GitHub-111827?style=for-the-badge&logo=github&logoColor=white"></a>
  <a href="https://app.deskimperial.online"><img src="https://img.shields.io/badge/Desk_Imperial-0A66C2?style=for-the-badge&logo=vercel&logoColor=white"></a>
</p>
