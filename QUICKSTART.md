# 🚀 Guia Rápido - O Discípulo Web App

## ⚡ Início Rápido (5 minutos)

### Servidor já está rodando! ✅

O aplicativo está disponível em:
- **Local:** http://localhost:3000
- **Network:** http://192.168.1.192:3000

### Navegue pelas páginas:

1. **Landing Page** - `http://localhost:3000`
   - Hero section impressionante
   - Cards de features
   - Circuitos disponíveis

2. **Login** - `http://localhost:3000/auth/login`
   - Email: qualquer@email.com
   - Senha: qualquer (vai direto pro dashboard)

3. **Registro** - `http://localhost:3000/auth/register`
   - Preencha o formulário
   - Vai direto pro dashboard

4. **Dashboard** - `http://localhost:3000/dashboard`
   - Veja stats, progresso, ranking
   - Clique em "Jogar" na cidade Malta

5. **Jogo** - `http://localhost:3000/game/3`
   - Responda 3 perguntas
   - Veja o timer e feedback

6. **Resultados** - `http://localhost:3000/results`
   - Pontuação e ranking

---

## 📁 Estrutura de Arquivos

```
o-discipulo-web/
├── app/
│   ├── page.tsx              ✅ Landing page
│   ├── layout.tsx            ✅ Layout principal
│   ├── globals.css           ✅ Design system
│   ├── auth/
│   │   ├── login/page.tsx    ✅ Login
│   │   └── register/page.tsx ✅ Registro
│   ├── dashboard/page.tsx    ✅ Dashboard
│   ├── game/[cityId]/page.tsx ✅ Jogo
│   └── results/page.tsx      ✅ Resultados
├── types/index.ts            ✅ TypeScript types
├── database/
│   ├── schema.sql            ✅ Schema PostgreSQL
│   └── seed.sql              ✅ 27 perguntas
└── README.md                 ✅ Documentação
```

---

## 🎨 Design System

### Cores Principais
- **Azul Primário:** `hsl(220, 90%, 56%)`
- **Dourado Secundário:** `hsl(45, 100%, 51%)`
- **Roxo Accent:** `hsl(280, 70%, 60%)`

### Classes Úteis
```css
/* Botões */
.btn, .btn-primary, .btn-secondary, .btn-outline

/* Cards */
.card, .glass

/* Animações */
.animate-fade-in, .animate-slide-up, .hover-lift

/* Gradientes */
.gradient-primary, .gradient-secondary, .text-gradient
```

---

## 🔄 Próximo Passo: Backend

### O que falta:
- [ ] Implementar API REST (Next.js API Routes)
- [ ] Conectar PostgreSQL
- [ ] Implementar NextAuth.js
- [ ] Substituir mock data

### Como fazer:

1. **Instalar dependências:**
```bash
npm install @prisma/client pg bcryptjs jsonwebtoken
npm install -D prisma @types/bcryptjs @types/jsonwebtoken
```

2. **Configurar PostgreSQL:**
```bash
createdb o_discipulo
psql -d o_discipulo -f database/schema.sql
psql -d o_discipulo -f database/seed.sql
```

3. **Criar `.env.local`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/o_discipulo
NEXTAUTH_SECRET=generate-a-secret-key
NEXTAUTH_URL=http://localhost:3000
```

4. **Criar API routes:**
```bash
app/api/
  auth/
    register/route.ts
    login/route.ts
  cities/route.ts
  questions/[cityId]/route.ts
  sessions/
    start/route.ts
    [id]/
      answer/route.ts
      complete/route.ts
  rankings/route.ts
```

---

## 🐛 Solução de Problemas

### Servidor não inicia:
```bash
cd o-discipulo-web
rm -rf .next node_modules
npm install
npm run dev
```

### Erros de TypeScript:
```bash
npm run build
```

### Port 3000 ocupado:
```bash
# Parar processo:
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou mudar a porta:
npm run dev -- -p 3001
```

---

## 📞 Suporte

**Desenvolvido por:** Ricardo Almeida  
**Projeto:** O Discípulo - Gamificação de Turismo Religioso  
**Data:** 17 de Fevereiro de 2026

---

## ✅ Checklist Rápido

- [x] Next.js configurado
- [x] Design system implementado
- [x] 6 páginas criadas
- [x] Database schema pronto
- [x] 27 perguntas seed data
- [x] Servidor rodando
- [ ] Backend API
- [ ] PostgreSQL conectado
- [ ] Autenticação real
- [ ] Deploy produção

---

**Status Atual:**  
✅ **MVP Frontend 100% Completo**  
⏳ **Backend API - A implementar**

🚀 **Acesse agora:** http://localhost:3000
