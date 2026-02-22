# Guia de Migração para Supabase

## 1. Configurar o projeto no Supabase

1. Acesse https://supabase.com e crie um novo projeto
2. Anote as credenciais:
   - **Project URL**: `https://xxxx.supabase.co`
   - **Anon Key**: `eyJ...`
   - **Service Role Key**: `eyJ...` (para operações server-side)
   - **Database URL**: `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`

## 2. Variáveis de ambiente

Adicione ao `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
```

## 3. Instalar dependências

```bash
npm install @supabase/supabase-js
```

## 4. Schema SQL — rodar no Supabase SQL Editor

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  country TEXT,
  church TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circuits
CREATE TABLE circuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_id UUID REFERENCES circuits(id),
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  country TEXT NOT NULL,
  modern_name TEXT,
  description TEXT,
  biblical_context TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  image_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id),
  block INTEGER NOT NULL CHECK (block IN (1,2,3)),
  difficulty INTEGER NOT NULL CHECK (difficulty IN (1,2,3)),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  explanation TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  circuit_id UUID REFERENCES circuits(id),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_points INTEGER DEFAULT 0,
  accuracy_percentage INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0
);

-- User Answers
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question_id UUID REFERENCES questions(id),
  session_id UUID REFERENCES game_sessions(id),
  selected_option CHAR(1) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rankings
CREATE TABLE rankings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  circuit_id UUID REFERENCES circuits(id),
  total_points INTEGER DEFAULT 0,
  accuracy_percentage INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, circuit_id)
);

-- Indexes
CREATE INDEX idx_cities_circuit ON cities(circuit_id);
CREATE INDEX idx_questions_city ON questions(city_id);
CREATE INDEX idx_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_answers_session ON user_answers(session_id);
CREATE INDEX idx_answers_user ON user_answers(user_id);
CREATE INDEX idx_rankings_points ON rankings(total_points DESC);

-- Seed MVP Circuit
INSERT INTO circuits (id, name, name_en, description, difficulty)
VALUES ('00000000-0000-0000-0000-000000000001', 'MVP Inicial', 'MVP Initial', 'Circuito inicial com Jerusalém, Éfeso e Malta', 'easy');
```

## 5. Seed de cidades e perguntas

Após criar o schema, rode o script de seed disponível em `scripts/seed-supabase.ts` (a criar).

## 6. Substituir mockDb nas APIs

Cada arquivo em `app/api/` usa `mockStore` do `lib/mockDb.ts`.  
Para migrar, substitua as chamadas ao `mockStore` por queries ao Supabase usando `lib/db.ts`.

### Exemplo — login (antes):
```ts
import { getUserByEmail, mockStore } from '@/lib/mockDb';
const user = getUserByEmail(email);
```

### Exemplo — login (depois):
```ts
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
```

## 7. Autenticação

O sistema atual usa tokens em memória (`lib/auth.ts`).  
Com Supabase, você pode usar o **Supabase Auth** nativo ou manter o sistema atual com JWT armazenado no banco.

**Recomendado**: Supabase Auth com `supabase.auth.signInWithPassword()`.

## 8. Ordem de migração recomendada

1. ✅ Criar projeto Supabase e configurar `.env.local`
2. ✅ Rodar o schema SQL acima
3. ✅ Migrar `app/api/auth/login` e `register`
4. ✅ Migrar `app/api/user/profile`
5. ✅ Migrar `app/api/cities` e `app/api/questions`
6. ✅ Migrar `app/api/sessions/*`
7. ✅ Migrar `app/api/rankings`
8. ✅ Migrar `app/api/user/sessions` e `achievements`
9. ✅ Remover `lib/mockDb.ts`

## 9. Quando tiver as credenciais

Me passe:
- **Project URL**
- **Anon Key**  
- **Service Role Key**
- **Database URL** (connection string)

E farei a migração completa de todas as APIs automaticamente.
