# 🏢 Jarvis Gatekeeper

**Sistema de Controle de Acesso e Gestão de Visitantes**

Um sistema moderno e intuitivo para gerenciar o acesso de visitantes em edifícios corporativos, desenvolvido com Next.js e Firebase.

## 🎯 Visão Geral

O **Jarvis Gatekeeper** é uma solução completa para controle de acesso de visitantes em ambientes corporativos. O sistema permite o registro, check-in/check-out e monitoramento de visitantes em tempo real, com interface moderna e intuitiva.

### Principais Benefícios:
- ✅ **Segurança Aprimorada**: Controle rigoroso de quem entra e sai do edifício
- ✅ **Gestão Eficiente**: Interface intuitiva para recepcionistas e administradores
- ✅ **Auditoria Completa**: Logs detalhados de todas as atividades
- ✅ **Escalabilidade**: Arquitetura moderna preparada para crescimento
- ✅ **Tempo Real**: Atualizações instantâneas do status dos visitantes

## 🚀 Funcionalidades

### 🔐 **Autenticação e Autorização**
- Sistema de login/registro com Firebase Authentication
- Controle de acesso com senha administrativa
- Gestão de usuários e permissões

### 👥 **Gestão de Visitantes**
- **Registro Inteligente**: Auto-preenchimento baseado em CPF
- **Check-in/Check-out**: Controle de entrada e saída
- **Validação de Capacidade**: Máximo de 3 visitantes por sala
- **Prevenção de Duplicatas**: Impede registro duplo sem checkout
- **Histórico Completo**: Visualização de todos os visitantes

### 📊 **Dashboard e Relatórios**
- **Visitantes no Prédio**: Lista em tempo real dos presentes
- **Monitoramento em Tempo Real**: Status atual de todos os visitantes
- **Filtros Avançados**: Busca por data, status, sala ou nome
- **Logs de Auditoria**: Histórico completo de ações do sistema
- **Relatórios Detalhados**: Exportação de dados para análise

### 🏢 **Gestão de Salas**
- **Controle de Capacidade**: Limite configurável por ambiente
- **Status em Tempo Real**: Ocupação atual de cada sala
- **Salas Disponíveis**: Diamante, Esmeralda, Rubi, Safira, Topázio

## 🛠 Stack Tecnológico

### **Frontend**
- **Next.js 15** - Framework React com SSR/SSG
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Hook Form + Zod** - Gerenciamento e validação de formulários

### **Backend & Banco de Dados**
- **Firebase Authentication** - Autenticação de usuários
- **Cloud Firestore** - Banco NoSQL em tempo real
- **Firebase SDK** - Integração completa

## 🏗 Arquitetura

O projeto segue uma **arquitetura em camadas** com separação clara de responsabilidades:

### **Camadas da Aplicação**
- **Apresentação**: Componentes React e páginas Next.js
- **Serviços**: Lógica de negócio e integração com APIs
- **Dados**: Firebase/Firestore para persistência
### **Principais Características**
- **🔄 Reatividade**: Estado gerenciado com React Hooks e Context API
- **📝 Validação**: Esquemas Zod para validação de formulários
- **🔥 Tempo Real**: Firestore para atualizações em tempo real
- **🎯 Separação de Responsabilidades**: Componentes focados em UI, serviços em lógica
- **📱 Responsividade**: Tailwind CSS para design adaptativo
- **🔒 Segurança**: Autenticação Firebase com regras de acesso

## 📦 Instalação

### **Pré-requisitos**
- Node.js 18+
- Conta no Firebase

### **Passos**

1. **Clone e instale**
   ```bash
   git clone https://github.com/cfrinka/jarvis-gatekeeper.git
   cd jarvis-gatekeeper
   npm install
   ```

2. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication (Email/Password) e Cloud Firestore
   - Configure as variáveis de ambiente no `.env.local`

3. **Execute o projeto**
   ```bash
   npm run dev
   ```

## 📖 Como Usar

### **Primeiro Acesso**
- Registre-se com a senha administrativa: `admin@123`
- Faça login com suas credenciais

### **Funcionalidades Principais**
- **Registrar Visitante**: Auto-preenchimento baseado em CPF
- **Visitantes no Prédio**: Lista em tempo real com checkout
- **Histórico Completo**: Todos os visitantes com filtros
- **Logs de Auditoria**: Rastreamento de todas as atividades

### **Regras de Negócio**
- Máximo 3 visitantes por sala
- Checkout obrigatório antes de novo registro
- Logs automáticos de todas as ações

---

**Desenvolvido com ❤️ para facilitar o controle de acesso em ambientes corporativos.**

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- 📧 Email: suporte@jarvis-gatekeeper.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/jarvis-gatekeeper/issues)
- 📖 Wiki: [Documentação Completa](https://github.com/seu-usuario/jarvis-gatekeeper/wiki)

---

**Jarvis Gatekeeper** - *Seu porteiro digital inteligente* 🤖✨
