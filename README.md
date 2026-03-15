# 🚀 Sistema de Gestão Empresarial Integrado (ERP) com IA

<h2 align="center">
  <img src="https://img.shields.io/badge/PROJETO_DE_PORTFÓLIO-FF4500?style=for-the-badge&logo=rocket&logoColor=white" alt="Projeto de Portfólio" />
</h2>

![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-purple?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-12.10-FFCA28?style=for-the-badge&logo=firebase)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google)

## 📋 Resumo Executivo

Este projeto é uma plataforma de gestão empresarial (ERP) moderna, escalável e orientada a dados, projetada para centralizar operações de Recursos Humanos, Finanças e Estoque. O grande diferencial da plataforma é a integração nativa com a Inteligência Artificial **Google Gemini**, que atua como um consultor estratégico, fornecendo análises de desempenho de funcionários e insights financeiros em tempo real.

Desenvolvido com foco em **Experiência do Usuário (UX)** e **Segurança**, o sistema possui uma arquitetura serverless (Firebase) e uma interface responsiva, garantindo alta disponibilidade e proteção de dados. O design foi projetado para ser **simples, minimalista e intuitivo**, reduzindo a carga cognitiva do usuário e permitindo que ele foque no que realmente importa: a gestão do seu negócio.

---

## ✨ Principais Funcionalidades

### 🔐 Autenticação e Cadastro (SSO)
* **Login Seguro:** Sistema de cadastro e login simplificado utilizando a conta Google (Single Sign-On) via Firebase Authentication.
* **Isolamento de Dados (Tenant Isolation):** Cada usuário cadastrado possui um ambiente totalmente isolado. O banco de dados garante que os dados de uma empresa jamais sejam acessados por outra.

### 👥 Módulo de Recursos Humanos (RH)
* **Gestão de Colaboradores:** Cadastro completo com cargo, salário, área de atuação e status.
* **Métricas de Saúde:** Acompanhamento de atestados médicos para gestão de bem-estar corporativo.
* **Análise de Performance (IA):** Avaliação automatizada do perfil do funcionário gerada pela IA do Gemini, cruzando dados de cargo, salário e histórico.

### 💰 Módulo Financeiro
* **Controle de Despesas:** Registro detalhado de saídas categorizadas (Operacional, Marketing, TI, etc.) com suporte a múltiplas moedas (BRL, USD, EUR) e conversão em tempo real.
* **Gestão de Receitas (PRO):** Acompanhamento de entradas financeiras para cálculo de fluxo de caixa e lucro líquido.

### 📦 Módulo de Estoque e Operações (Exclusivo PRO)
* **Controle de Inventário:** Gestão de produtos, quantidades, categorias e valor unitário.
* **Portfólio da Empresa:** Centralização da identidade visual, missão, visão e valores da corporação.

### 🧠 Inteligência Artificial e Analytics
* **Dashboard Interativo:** Gráficos dinâmicos (Barras, Linhas, Pizza) gerados via `Recharts` para visualização instantânea da saúde do negócio.
* **Consultoria Estratégica AI:** Chatbot integrado que analisa o contexto global da empresa (despesas vs. receitas) e sugere planos de ação.

### ⚙️ Administração e Sistema
* **Autenticação Segura:** Login via Google (SSO) gerenciado pelo Firebase Auth.
* **Exportação/Importação de Dados:** Backup completo do banco de dados em formato JSON para portabilidade e segurança.
* **Notificações em Tempo Real:** Sistema de alertas não-intrusivos (`react-hot-toast`) para feedback imediato das ações do usuário.
* **Dark/Light Mode:** Interface adaptável à preferência do usuário.

---

## 🛠️ Stack Tecnológico e Arquitetura

O projeto foi construído utilizando as melhores práticas do mercado para aplicações Single Page Application (SPA):

* **Frontend:** React 19 (Hooks, Context), TypeScript (Tipagem estática estrita).
* **Build Tool:** Vite (HMR ultrarrápido e build otimizado).
* **Estilização:** Tailwind CSS v4 (Utility-first, design system consistente).
* **Animações:** Framer Motion (`motion/react`) para transições fluidas.
* **Ícones:** Lucide React.
* **Backend as a Service (BaaS):** Firebase.
  * *Firestore:* Banco de dados NoSQL em tempo real.
  * *Authentication:* Gerenciamento de identidade.
* **Inteligência Artificial:** SDK `@google/genai` (Modelo Gemini 3.1 Pro Preview).

---

## 🔒 Segurança, Testes de Invasão e Monitoramento (SOC)

Como Gerente de Projeto, a segurança dos dados é prioridade zero. Este projeto foi submetido a rigorosos testes de segurança (Red Team) para garantir a integridade dos dados em produção. A arquitetura foi desenhada para ser integrada a um **SOC (Security Operations Center)**, utilizando as ferramentas nativas de monitoramento e logs do Google Cloud.

### 🛡️ Testes de Segurança Realizados:
1. **Prevenção contra SQL/NoSQL Injection:** O uso do SDK do Firestore combinado com regras de segurança rígidas no servidor (`firestore.rules`) impede qualquer tentativa de injeção de queries maliciosas.
2. **Proteção contra XSS (Cross-Site Scripting):** O React sanitiza automaticamente todas as entradas de dados, impedindo a execução de scripts maliciosos no navegador dos usuários.
3. **Mitigação de Prompt Injection (IA):** A integração com o Gemini utiliza a funcionalidade de `systemInstruction`, criando uma barreira que impede que usuários injetem comandos maliciosos nos dados (ex: tentar forçar a IA a ignorar regras através do nome de um funcionário).
4. **Proteção contra DoS (Denial of Service) e Esgotamento de Cota:** A função de importação de dados em massa (JSON) foi protegida com limites estritos (máximo de 500 registros) e utiliza gravações em lote (`writeBatch`). Isso impede que um atacante trave o sistema ou esgote a cota financeira do Firebase enviando arquivos gigantescos.
5. **Schema Pollution e Validação Estrita:** As regras do Firestore validam o tamanho máximo de strings (ex: descrições limitadas a 500 caracteres) e os tipos de dados exatos, impedindo que dados corrompidos quebrem os gráficos e dashboards do sistema.

### 📊 Ambiente de Logs e Monitoramento (Google Cloud)
A aplicação está preparada para operar em um ambiente de alta observabilidade. Todos os erros críticos de banco de dados são capturados por um sistema de tratamento (`handleFirestoreError`) que gera payloads estruturados em JSON. Esses logs são enviados para o **Google Cloud Logging**, permitindo que uma equipe de SOC configure alertas automatizados para anomalias (ex: múltiplas tentativas de acesso negado por falta de permissão).

1. **Firestore Security Rules (Hardened):** Regras rigorosas de validação no backend. Os usuários só podem ler e escrever dados que pertencem ao seu próprio `uid` (Tenant Isolation). Campos imutáveis (como o próprio `uid`) são protegidos contra adulteração.
2. **Error Boundaries (Tolerância a Falhas):** Componentes React encapsulados para capturar erros de renderização, evitando que o sistema quebre por completo e exibindo uma interface amigável de recuperação.
3. **Tratamento de Exceções e Logs:** Padronização de erros de banco de dados (`handleFirestoreError`) com logs detalhados (Operação, Caminho, Auth Info) para facilitar auditorias e debug.

---

## 🚀 Como Executar Localmente (Guia do Desenvolvedor)

Para rodar este projeto no seu ambiente local (ex: VS Code), siga os passos abaixo:

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 20+ recomendada)
* Git

### Instalação

1. **Clone ou extraia o repositório:**
   Abra a pasta do projeto no VS Code.

2. **Instale as dependências:**
   No terminal do VS Code, execute:
   ```bash
   npm install
   ```

3. **Configuração de Variáveis de Ambiente:**
   Crie um arquivo chamado `.env` na raiz do projeto e adicione suas chaves de API. O sistema precisa da chave do Gemini para as funções de IA:
   ```env
   VITE_GEMINI_API_KEY=sua_chave_api_do_gemini_aqui
   ```
   *(Nota: As configurações do Firebase já estão injetadas no arquivo `firebase-applet-config.json` ou `firebase.ts` e funcionarão automaticamente).*

4. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` (ou a porta indicada no terminal) no seu navegador.

---

## 📂 Estrutura do Projeto

```text
/
├── src/
│   ├── components/       # Componentes reutilizáveis (ex: ErrorBoundary)
│   ├── services/         # Integrações externas (ex: geminiService.ts)
│   ├── types/            # Definições de interfaces TypeScript (types.ts)
│   ├── App.tsx           # Componente principal e roteamento de abas
│   ├── main.tsx          # Ponto de entrada do React
│   ├── index.css         # Estilos globais e diretivas do Tailwind
│   └── firebase.ts       # Configuração e inicialização do Firebase
├── public/               # Assets estáticos
├── package.json          # Dependências e scripts do projeto
├── vite.config.ts        # Configuração do bundler Vite
└── README.md             # Documentação do projeto
```

---

## 🗺️ Roadmap Futuro

* [ ] Implementação de uma coleção `system_logs` no Firestore para auditoria de erros em produção.
* [ ] Criação de níveis de acesso (RBAC - Role Based Access Control) para permitir múltiplos usuários na mesma empresa (Admin, Gerente, Funcionário).
* [ ] Geração de relatórios em PDF.
* [ ] Integração com APIs bancárias via Open Finance.

---
*Documento gerado e mantido pela Gestão de Projetos.*
