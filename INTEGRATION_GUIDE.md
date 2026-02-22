# Frontend-Backend Integration Guide

## ✅ Integration Status

### Completed (Phase 1 - Authentication)
- [x] Registration form → `POST /api/auth/register`
- [x] Login form → `POST /api/auth/login`
- [x] Auto-login after registration
- [x] Session cookie management

### To Do (Phase 2 - Game Flow)
- [ ] Dashboard → `GET /api/user/profile` for stats
- [ ] Dashboard → `GET /api/cities` for city list
- [ ] Game page → `GET /api/questions/:cityId` for questions
- [ ] Game page → `POST /api/sessions/start` on game start
- [ ] Game page → `POST /api/sessions/:id/answer` on each answer
- [ ] Results page → `POST /api/sessions/:id/complete` for final score
- [ ] Results page → `GET /api/rankings` for leaderboard

---

## Testing the Integration

### 1. Start Development Server

```bash
cd "c:\Bruno Projetos\O discipulo\o-discipulo-web"
npm run dev
```

Server runs on: `http://localhost:3000`

### 2. Test Registration Flow

1. **Open:** `http://localhost:3000/auth/register`
2. **Fill form:**
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Confirm Password: test123
   - Country: Brasil (optional)
3. **Submit** → Should auto-login and redirect to `/dashboard`

**Expected backend calls:**
```
POST /api/auth/register
  → 200 OK {"success": true, "data": {...}}
POST /api/auth/login
  → 200 OK + Set-Cookie: session=...
Redirect to /dashboard
```

### 3. Test Login Flow

1. **Logout** (if needed - refresh page)
2. **Open:** `http://localhost:3000/auth/login`
3. **Enter credentials:**
   - Email: test@example.com
   - Password: test123
4. **Submit** → Should redirect to `/dashboard`

**Expected backend call:**
```
POST /api/auth/login
  → 200 OK + Set-Cookie: session=...
Redirect to /dashboard
```

### 4. Verify Database

Check that user was created:

```sql
SELECT id, email, name, country FROM users 
WHERE email = 'test@example.com';
```

Should return 1 row with the registered user.

---

## Next Steps: Complete Game Flow Integration

### Dashboard Page Updates Needed

```typescript
// app/dashboard/page.tsx

useEffect(() => {
  // Fetch user profile
  fetch('/api/user/profile', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setUser(data.data);
        setStats(data.data.stats);
      }
    });

  // Fetch cities
  fetch('/api/cities?circuitId=MVP_CIRCUIT_ID')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCities(data.data);
      }
    });
}, []);
```

### Game Page Updates Needed

```typescript
// app/game/[cityId]/page.tsx

// On component mount
useEffect(() => {
  // Start session
  fetch('/api/sessions/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ circuitId: 'MVP_CIRCUIT_ID' }),
  })
    .then(res => res.json())
    .then(data => {
      setSessionId(data.data.sessionId);
      return fetch(`/api/questions/${cityId}`, { credentials: 'include' });
    })
    .then(res => res.json())
    .then(data => {
      setQuestions(data.data);
    });
}, [cityId]);

// On answer confirm
const confirmAnswer = async () => {
  const response = await fetch(`/api/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      questionId: questions[currentQuestion].id,
      selectedOption,
      timeTaken: Math.floor((Date.now() - questionStartTime) / 1000),
    }),
  });

  const data = await response.json();
  setShowFeedback(true);
  // ... continue with existing logic
};
```

### Results Page Updates Needed

```typescript
// app/results/page.tsx

useEffect(() => {
  // Complete session
  fetch(`/api/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ totalTimeSeconds: timer }),
  })
    .then(res => res.json())
    .then(data => {
      setResults(data.data);
    });

  // Fetch top rankings
  fetch('/api/rankings?limit=5')
    .then(res => res.json())
    .then(data => {
      setRankings(data.data);
    });
}, [sessionId, timer]);
```

---

## Environment Configuration

Make sure `.env.local` is properly configured:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/o_discipulo
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
SESSION_SECRET=seu-secret-super-secreto-aqui-12345
```

---

## Debugging Tips

### Check Browser Console

- Network tab: See API calls and responses
- Console: Check for JavaScript errors

### Check Server Logs

Watch the terminal running `npm run dev` for:
- API route errors
- Database connection errors
- Query errors

### Check Database

Useful queries for debugging:

```sql
-- Check users
SELECT * FROM users;

-- Check game sessions
SELECT * FROM game_sessions ORDER BY created_at DESC LIMIT 5;

-- Check answers
SELECT * FROM user_answers ORDER BY created_at DESC LIMIT 10;

-- Check rankings
SELECT * FROM rankings ORDER BY total_points DESC;
```

---

## Common Issues & Solutions

### Issue: "Não autenticado" error

**Cause:** Session cookie not being sent  
**Solution:** Make sure `credentials: 'include'` is in all fetch calls

### Issue: Database connection error

**Cause:** PostgreSQL not running or wrong credentials  
**Solution:** 
- Check PostgreSQL service is running
- Verify DATABASE_URL in `.env.local`

### Issue: CORS errors

**Cause:** Frontend and backend on different origins  
**Solution:** Both should be on `localhost:3000` (Next.js handles this automatically)

### Issue: 404 on API routes

**Cause:** API route file not found or named incorrectly  
**Solution:** Check file paths match URL structure exactly

---

## Production Considerations

Before deploying to production:

1. **Environment Variables:**
   - Set production DATABASE_URL
   - Generate secure SESSION_SECRET
   - Set NEXTAUTH_URL to production domain

2. **Database:**
   - Use managed PostgreSQL (AWS RDS, Heroku, etc.)
   - Enable SSL connections
   - Set up automated backups

3. **Security:**
   - Enable HTTPS
   - Add rate limiting
   - Implement CSRF protection
   - Add input sanitization

4. **Performance:**
   - Enable caching (Redis)
   - Add CDN for static assets
   - Optimize database queries
   - Add monitoring (Datadog, New Relic)

---

**Current Status:**  
✅ Database configured  
✅ API endpoints implemented  
✅ Authentication integrated  
⏳ Game flow integration (next step)  
⏳ Testing & validation
