# O Discípulo - Aplicação Web 🌍

Plataforma de gamificação de turismo religioso baseada nas viagens do Apóstolo Paulo.

## 🚀 Tecnologias

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + CSS personalizado
- **Banco de Dados:** PostgreSQL (schema completo em `/database`)
- **Autenticação:** NextAuth.js (a implementar)
- **Deploy:** Vercel (recomendado)

## 📦 Estrutura do Projeto

```
o-discipulo-web/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Design system e estilos globais
│   ├── auth/
│   │   ├── login/            # Página de login
│   │   └── register/         # Página de registro
│   ├── dashboard/            # Dashboard do jogador
│   ├── game/
│   │   └── [cityId]/         # Interface do jogo (perguntas)
│   └── results/              # Tela de resultados
├── types/
│   └── index.ts              # TypeScript types
├── database/
│   └── schema.sql            # Schema PostgreSQL completo
└── public/                   # Assets estáticos
```

## 🎨 Design System

O projeto usa um design system premium com:

- **Cores:** Paleta vibrante com gradientes (azul primário, dourado secundário)
- **Tipografia:** Inter (texto) + Outfit (títulos)
- **Efeitos:** Glassmorphism, shadows, animações suaves
- **Componentes:** Buttons, cards, inputs, modals com estilos consistentes

### Variáveis CSS Principais

```css
--color-primary: hsl(220, 90%, 56%)
--color-secondary: hsl(45, 100%, 51%)
--color-accent: hsl(280, 70%, 60%)
```

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- PostgreSQL 14+ (para produção)

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Rodar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build de Produção

```bash
# Build otimizado
npm run build

# Rodar build de produção
npm start
```

## 🗄️ Configuração do Banco de Dados

### 1. Criar banco de dados PostgreSQL

```bash
createdb o_discipulo
```

### 2. Executar schema

```bash
psql -d o_discipulo -f database/schema.sql
```

### 3. Popular com dados (seed)

```bash
psql -d o_discipulo -f database/seed.sql
```

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/o_discipulo
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## 📱 Páginas Implementadas

### ✅ Landing Page (`/`)
- Hero section com gradientes
- Seção de features (Aprenda, Compete, Ganhe)
- Cards de circuitos disponíveis
- Call-to-action para registro

### ✅ Autenticação
- **Login** (`/auth/login`) - Formulário com validação
- **Registro** (`/auth/register`) - Cadastro completo

### ✅ Dashboard (`/dashboard`)
- Stats cards (pontos, ranking, precisão, cidades)
- Progresso do circuito com lista de cidades
- Desafio semanal
- Top 5 ranking global
- Menu de navegação

### ✅ Jogo (`/game/[cityId]`)
- Carta de contexto bíblico
- Sistema de 3 perguntas (1 por bloco)
- Timer em tempo real
- Feedback imediato (correto/incorreto)
- Progress bar
- Explicações educativas

### ✅ Resultados (`/results`)
- Métricas de performance
- Pontuação animada
- Posição no ranking com mudança
- Botões de ação (compartilhar, revisar, dashboard)

## 🎮 Fluxo do Usuário

1. **Landing Page** → Conhecer o conceito
2. **Registro/Login** → Criar conta
3. **Dashboard** → Ver progresso e escolher cidade
4. **Jogo** → Responder 3 perguntas por cidade
5. **Resultados** → Ver pontuação e ranking
6. **Dashboard** → Continuar próxima cidade

## 🔧 Próximos Passos (Roadmap)

### Backend (Prioridade Alta)
- [ ] Implementar API REST
  - [ ] Endpoints de autenticação
  - [ ] Endpoints de perguntas dinâmicas
  - [ ] Endpoints de ranking
- [ ] Integrar NextAuth.js
- [ ] Conectar frontend com banco de dados

### Conteúdo (Prioridade Média)
- [ ] Migrar banco de perguntas do `Banco_Perguntas_Completo.md`
- [ ] Adicionar imagens das cidades
- [ ] Criar mais circuitos

### Features Avançadas (Prioridade Baixa)
- [ ] Sistema de badges/conquistas
- [ ] Modo multiplayer
- [ ] Chat/comunidade
- [ ] Admin dashboard

## 🎯 MVP Atual

**Status:** ✅ Frontend completo com mock data

O MVP atual inclui:
- ✅ Interface completa e responsiva
- ✅ Design premium e animações
- ✅ Fluxo de usuário completo
- ⏳ Mock data (precisa conectar com API)
- ⏳ Banco de dados configurado (precisa popular)

## 📊 Estrutura de Dados

### Principais Entidades

- **Users** - Usuários cadastrados
- **Cities** - Cidades do circuito
- **Questions** - Banco de perguntas (3 blocos × 3 dificuldades)
- **Game Sessions** - Sessões de jogo ativas
- **Rankings** - Rankings por circuito
- **Achievements** - Conquistas desbloqueáveis

Ver schema completo em: [`database/schema.sql`](../database/schema.sql)

## 🌐 Deploy

### Deploy no Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configurar variáveis de ambiente no dashboard
```

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 📝 Licença

© 2026 Ricardo Almeida - Usine Criative. Todos os direitos reservados.

## 👨‍💻 Autor

**Ricardo Almeida**  
Fundador - Usine Criative  
Email: prricardocassiano@gmail.com  
Tel: +32 485 68 85 50

---

## 🐛 Problemas conhecidos

- [ ] API endpoints ainda não implementados (usando mock data)
- [ ] Autenticação não funcional (NextAuth.js a integrar)
- [ ] Banco de dados não populado (seed.sql a criar)

## 🆘 Suporte

Para problemas ou dúvidas, verificar:
1. Console do navegador para erros frontend
2. Terminal para erros de build
3. Logs do PostgreSQL para erros de banco
