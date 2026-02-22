# 🧪 Guia de Testes - O Discípulo

## Teste Manual no Navegador

### Pré-requisitos
✅ Servidor rodando: `npm run dev` em http://localhost:3000  
✅ PostgreSQL rodando com banco `o_discipulo`  
✅ Seed data carregado (27 perguntas)

---

## 📋 Fluxo Completo de Teste

### 1. Registro de Usuário

**URL:** http://localhost:3000/auth/register

**Passos:**
1. Abra o navegador em http://localhost:3000
2. Clique em "Começar Agora" ou vá direto para `/auth/register`
3. Preencha o formulário:
   - **Nome:** Test User
   - **Email:** test@example.com
   - **Senha:** test123
   - **Confirmar Senha:** test123
   - **País:** Brasil (opcional)
4. Clique em "Criar Conta"

**Resultado Esperado:**
- ✅ Auto-login automático
- ✅ Redirecionamento para `/dashboard`
- ✅ Mensagem de sucesso (sem erros)

---

### 2. Dashboard

**URL:** http://localhost:3000/dashboard

**O que verificar:**
- ✅ Nome do usuário aparece no header (primeira letra no avatar)
- ✅ Stats cards mostram:
  - Pontos Totais: 0
  - Ranking Global: #-
  - Precisão: 0%
  - Cidades: 0/3
- ✅ Lista de 3 cidades aparece:
  - Jerusalém
  - Éfeso
  - Malta
- ✅ Botão "Jogar" está disponível nas cidades
- ✅ Top 5 Global (pode estar vazio inicialmente)

**Screenshot:** Tirar print do dashboard

---

### 3. Jogar Primeira Cidade

**URL:** http://localhost:3000/game/[cityId]

**Passos:**
1. No dashboard, clique em "Jogar" na primeira cidade (Jerusalém)
2. Você será redirecionado para a página do jogo

**O que verificar:**
- ✅ Nome da cidade e país aparecem no header
- ✅ Timer começa a contar (00:00)
- ✅ Card com "Contexto Bíblico" aparece
- ✅ Pergunta 1 de 3 é exibida
- ✅ 4 opções (A, B, C, D) aparecem
- ✅ Badge mostra o bloco (Contexto Bíblico, Geografia Atual, ou Turismo & Economia)

**Responder Pergunta:**
1. Selecione uma opção (ex: B)
2. A opção selecionada fica destacada em azul
3. Clique em "Confirmar Resposta"

**Resultado Esperado:**
- ✅ Feedback aparece (Correto! ou Incorreto)
- ✅ Explicação da resposta é exibida
- ✅ Resposta correta fica verde
- ✅ Resposta errada (se aplicável) fica vermelha
- ✅ Após 3 segundos, avança automaticamente para próxima pergunta

**Screenshot:** Tirar print do feedback

---

### 4. Completar as 3 Perguntas

**Passos:**
1. Responda a pergunta 2 (Geography)
2. Responda a pergunta 3 (Tourism)
3. Após a 3ª pergunta, você será redirecionado automaticamente

**Resultado Esperado:**
- ✅ Progress bar avança: 33% → 66% → 100%
- ✅ Redirecionamento para `/results?sessionId=...&time=...`

---

### 5. Página de Resultados

**URL:** http://localhost:3000/results?sessionId=...&time=...

**O que verificar:**
- ✅ Título "Cidade Completa!"
- ✅ Tempo Total exibido (ex: 0min 45s)
- ✅ Precisão exibida (ex: 67% ou 100%)
- ✅ **Pontuação Total** animada aparece
  - Fórmula: (Accuracy × 1000) + Speed Bonus
  - Exemplo: 67% = 670 + ~495 = ~1165 pontos
  - Exemplo: 100% = 1000 + ~498 = ~1498 pontos
- ✅ Ranking Global mostra posição (ex: #1)
- ✅ Badge "Novo recorde!"

**Screenshot:** Tirar print dos resultados

---

### 6. Voltar ao Dashboard

**Passos:**
1. Clique em "Voltar ao Dashboard"

**O que verificar:**
- ✅ Stats atualizados:
  - Pontos Totais: agora mostra seus pontos
  - Precisão: mostra % média
  - Cidades: 1/3
- ✅ Primeira cidade marcada como "Completa!" com ✓
- ✅ Top 5 Global agora mostra você na lista

**Screenshot:** Tirar print do dashboard atualizado

---

## 🧪 Testes Adicionais

### Teste 2: Login com Usuário Existente

**URL:** http://localhost:3000/auth/login

**Passos:**
1. Logout (ou abra em aba anônima)
2. Vá para `/auth/login`
3. Entre com:
   - Email: test@example.com
   - Senha: test123
4. Clique em "Entrar"

**Resultado Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento para `/dashboard`
- ✅ Dados persistidos (pontos, cidades completadas)

---

### Teste 3: Jogar Segunda Cidade

**Passos:**
1. No dashboard, clique em "Jogar" em Éfeso
2. Responda as 3 perguntas
3. Veja os resultados

**O que verificar:**
- ✅ Novas perguntas (diferentes de Jerusalém)
- ✅ Pontuação acumula (total aumenta)
- ✅ Cidades: 2/3
- ✅ Ranking pode mudar se melhorar score

---

### Teste 4: Ranking Global

**URL:** http://localhost:3000/ranking (se implementado)

**Ou no Dashboard:**
- ✅ Top 5 Global mostra usuários ordenados por pontos
- ✅ Seu usuário aparece na lista se estiver no top 5

---

## 🐛 Testes de Erro

### Registro Duplicado
1. Tente registrar com email já existente
2. **Esperado:** Mensagem "Email já cadastrado"

### Login Inválido
1. Tente fazer login com senha errada
2. **Esperado:** Mensagem "Credenciais inválidas"

### Acesso Não Autenticado
1. Logout e tente acessar `/dashboard` diretamente
2. **Esperado:** Redirecionamento para `/auth/login`

---

## ✅ Checklist de Validação

### Funcionalidades
- [ ] Registro de usuário funciona
- [ ] Auto-login após registro
- [ ] Login manual funciona
- [ ] Dashboard carrega dados do banco
- [ ] 3 cidades aparecem no dashboard
- [ ] Game page inicia sessão automaticamente
- [ ] 3 perguntas diferentes são carregadas
- [ ] Respostas são validadas pelo backend
- [ ] Feedback correto/incorreto aparece
- [ ] Timer funciona
- [ ] Cálculo de pontuação correto
- [ ] Ranking é atualizado
- [ ] Dados persistem após logout/login

### Design
- [ ] Animações suaves (fade-in, slide-up, scale-in)
- [ ] Cores vibrantes e gradientes
- [ ] Glassmorphism nos cards
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Sem texto cortado ou overflow
- [ ] Ícones e SVGs aparecem corretamente

### Performance
- [ ] Páginas carregam em < 2 segundos
- [ ] Sem erros no console do navegador
- [ ] Sem erros no terminal do servidor
- [ ] Transições entre páginas fluidas

---

## 📊 Dados no Banco para Verificar

### Após completar 1 cidade:

```sql
-- Ver usuário
SELECT id, name, email, country FROM users WHERE email = 'test@example.com';

-- Ver sessões
SELECT * FROM game_sessions WHERE user_id = 'SEU_USER_ID' ORDER BY created_at DESC;

-- Ver respostas
SELECT * FROM user_answers WHERE user_id = 'SEU_USER_ID' ORDER BY created_at DESC;

-- Ver ranking
SELECT * FROM rankings WHERE user_id = 'SEU_USER_ID';

-- Ver ranking global
SELECT * FROM global_rankings ORDER BY rank LIMIT 10;
```

---

## 🎯 Resultado Esperado Final

Após completar todas as 3 cidades:

- **Jerusalém:** ~1400-1500 pontos
- **Éfeso:** ~1400-1500 pontos
- **Malta:** ~1400-1500 pontos

**Total:** ~4200-4500 pontos (depende de acertos e velocidade)

**Ranking:** #1 (se for único usuário)

**Dashboard:**
- Pontos Totais: 4200+
- Precisão: XX%
- Cidades: 3/3
- Todas as cidades com ✓

---

## 🚀 Próximos Passos

Se todos os testes passarem:
1. ✅ Backend funcionando 100%
2. ✅ Frontend integrado 100%
3. ✅ Database configurado 100%
4. ✅ MVP pronto para apresentação!

Se houver erros:
1. Verificar console do navegador (F12)
2. Verificar terminal do servidor
3. Ver logs de erro na resposta da API
4. Consultar `API_DOCUMENTATION.md`

---

**Happy Testing! 🎮🙏**
