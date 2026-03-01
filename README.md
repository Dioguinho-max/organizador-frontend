# 📚 Organizador de Estudos — Frontend

![HTML5](https://img.shields.io/badge/HTML-5-orange)
![CSS3](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)
![Status](https://img.shields.io/badge/Status-Online-brightgreen)

Interface web do sistema **Organizador de Estudos**, uma aplicação Full Stack desenvolvida para gerenciamento de tarefas com sistema de notas e ranking de desempenho entre usuários.

🔗 **Acesse o sistema online:**  
https://organizador-frontend.vercel.app/

---

## 🎥 Demonstração

![Demonstração do sistema](./demo1.gif)

---

## 🧠 Sobre o Projeto

O objetivo do projeto é permitir que usuários:

- Criem tarefas
- Adicionem notas de desempenho
- Marquem tarefas como concluídas
- Visualizem um ranking baseado na média das notas

A aplicação consome uma API REST hospedada no Render.

---

## 🚀 Funcionalidades

### 🔐 Autenticação
- Cadastro de novos usuários
- Login com geração de token JWT
- Armazenamento do token no `localStorage`
- Proteção de páginas privadas
- Logout seguro

---

### 📚 Gerenciamento de Tarefas
- Criar tarefa com:
  - Título
  - Descrição
  - Nota (opcional)
- Listar tarefas do usuário autenticado
- Marcar tarefa como concluída
- Excluir tarefa
- Atualização automática da lista

---

### 🏆 Ranking
- Lista todos os usuários
- Calcula média das notas
- Ordenação automática da maior para menor média

---

### 🤖 Integração com Inteligência Artificial

Permite gerar planos de estudo personalizados através da API:

- Seleção de matéria
- Nível de dificuldade
- Quantidade de horas por dia

Resultado exibido diretamente na interface.

Controle de limite diário aplicado pelo backend.

---
## 🌐 Integração com Backend

A aplicação consome a seguinte API:

