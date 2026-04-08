# 📡 Portal NovaLink | Sistema de Gestão para ISPs

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Este projeto é uma plataforma SaaS Full-Stack desenvolvida para otimizar as operações diárias de Provedores de Internet (ISPs) e centrais de Call Center. Nascido da necessidade de resolver dores reais do atendimento técnico, o sistema unifica ferramentas gerenciais, comunicação em tempo real e documentação.

🔗 **Acesse o projeto online:** https://portal-novalink.vercel.app/

---

## 🚀 Como testar o sistema
O sistema possui diferentes níveis de acesso. Utilize as credenciais abaixo para testar as funcionalidades online:

**Acesso Supervisão / NOC (Acesso Total):**
* Matrícula: `SUP001`
* Senha: `senha123`

**Acesso Atendente (Visão do Operador):**
* Matrícula: `CAC001`
* Senha: `senha123`

---

## ✨ Principais Funcionalidades

* **🚨 Alertas NOC em Tempo Real:** Painel onde a supervisão lança incidentes massivos (ex: rompimento de fibra). O alerta é disparado instantaneamente para a tela de notificações de todos os atendentes logados, reduzindo o tempo de triagem.
* **📓 Diário de Bordo Gerencial:** Logbook inteligente para registro diário de oscilações de link e falhas, com exportação de relatórios `.xlsx` (Excel) filtrados por período.
* **🔄 Gestão de Escalas Inteligente:** Criação de turnos de trabalho e sistema autônomo para os atendentes solicitarem trocas de horários, passando por aprovação da supervisão.
* **📚 Base de Conhecimento (Wiki):** Repositório centralizado com suporte a imagens para padronizar roteiros de atendimento e guias de configuração de roteadores.
* **🧮 Calculadoras Integradas:** Ferramenta para cálculo rápido de pró-rata (mensalidade proporcional) para auxiliar o atendimento financeiro.

---

## 🛠️ Tecnologias Utilizadas

**Front-end:**
* React.js (com Vite)
* Tailwind CSS (Estilização e Responsividade)
* React Router DOM (Navegação SPA)
* Axios (Consumo de API)
* Lucide React (Ícones)
* ExcelJS (Geração de relatórios em Excel)

**Back-end:**
* Node.js
* Express.js (Criação de rotas e API RESTful)
* SQLite (Banco de dados leve para testes rápidos)
* Multer (Upload de arquivos/imagens)
* CORS

---

## ⚙️ Como rodar o projeto localmente

Caso deseje rodar a aplicação em sua própria máquina:

cd backend
npm install
node src/server.js

cd frontend
npm install
npm run dev
