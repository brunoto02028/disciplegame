# API Documentation - O Discípulo

Base URL: `http://localhost:3000/api`

## Authentication

All authenticated endpoints require a session cookie set by the login endpoint.

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "minhasenha123",
  "country": "Brasil",          // optional
  "church": "Igreja Local"      // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "joao@example.com",
    "name": "João Silva"
  },
  "message": "Conta criada com sucesso!"
}
```

**Errors:**
- 400: Missing required fields or password too short
- 409: Email already registered
- 500: Server error

---

### POST /api/auth/login

Login to existing account.

**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "minhasenha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "joao@example.com",
    "name": "João Silva"
  },
  "message": "Login realizado com sucesso!"
}
```

**Sets Cookie:** `session` (HTTP-only, 24h expiration)

**Errors:**
- 400: Missing credentials
- 401: Invalid credentials
- 500: Server error

---

## Cities

### GET /api/cities

Get list of cities.

**Query Parameters:**
- `circuitId` (optional): Filter by circuit ID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "circuit_id": "uuid",
      "name": "Jerusalém",
      "name_en": "Jerusalem",
      "country": "Israel",
      "modern_name": "Jerusalem",
      "description": "A cidade santa...",
      "description_en": "The holy city...",
      "biblical_context": "Local da crucificação...",
      "latitude": 31.7683,
      "longitude": 35.2137,
      "image_url": "/images/cities/jerusalem.jpg",
      "order_index": 1
    }
  ]
}
```

---

## Questions

### GET /api/questions/[cityId]

Get 3 random questions for a city (one from each block).

**Query Parameters:**
- `userId` (optional): Exclude already answered questions

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "cityId": "uuid",
      "block": 1,
      "difficulty": 2,
      "questionText": "Em qual livro é narrado...",
      "options": [
        { "letter": "A", "text": "Romanos" },
        { "letter": "B", "text": "Atos dos Apóstolos" },
        { "letter": "C", "text": "Filipenses" },
        { "letter": "D", "text": "Apocalipse" }
      ],
      "correctOption": "B",
      "explanation": "O naufrágio está relatado em Atos 28:1-10.",
      "imageUrl": null
    }
  ]
}
```

**Notes:**
- Always returns exactly 3 questions (one per block: Biblical, Geography, Tourism)
- Difficulty distribution: 20% easy, 60% medium, 20% hard
- Avoids questions already answered by the user

---

## Game Sessions

### POST /api/sessions/start

Start a new game session.

**Authentication:** Required (session cookie)

**Request Body:**
```json
{
  "circuitId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "userId": "uuid",
    "circuitId": "uuid",
    "startedAt": "2026-02-17T14:00:00Z"
  }
}
```

---

### POST /api/sessions/[sessionId]/answer

Submit an answer to a question.

**Authentication:** Required

**Request Body:**
```json
{
  "questionId": "uuid",
  "selectedOption": "B",
  "timeTaken": 15
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "correctOption": "B"
  }
}
```

---

### POST /api/sessions/[sessionId]/complete

Complete a game session and calculate final score.

**Authentication:** Required

**Request Body:**
```json
{
  "totalTimeSeconds": 187
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalPoints": 1150,
    "accuracyPercentage": 67,
    "totalTimeSeconds": 187,
    "correctAnswers": 2,
    "totalQuestions": 3,
    "rank": 823
  }
}
```

**Score Formula:**
```
Points = (Accuracy × 1000) + Speed Bonus
Speed Bonus = MAX(0, 500 - totalMinutes)

Example:
  Accuracy: 67% → 670 points
  Time: 187s (3.1 min) → Speed Bonus: 497
  Total: 1167 points
```

---

## Rankings

### GET /api/rankings

Get global rankings.

**Query Parameters:**
- `circuitId` (optional): Filter by circuit
- `limit` (optional, default: 100): Number of results

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_name": "Maria Santos",
      "country": "Portugal",
      "circuit_id": "uuid",
      "circuit_name": "MVP Inicial",
      "total_points": 2850,
      "accuracy_percentage": 95,
      "total_time_seconds": 120,
      "completed_at": "2026-02-17T13:00:00Z",
      "rank": 1
    }
  ]
}
```

**Notes:**
- Sorted by points (DESC), then time (ASC)
- Rank calculated using SQL window functions
- Only best score per user per circuit

---

## User Profile

### GET /api/user/profile

Get authenticated user's profile and statistics.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "joao@example.com",
    "name": "João Silva",
    "country": "Brasil",
    "church": "Igreja Local",
    "created_at": "2026-02-15T10:00:00Z",
    "stats": {
      "totalSessions": 15,
      "completedSessions": 12,
      "avgAccuracy": 82,
      "totalPoints": 14250,
      "totalAchievements": 3
    }
  }
}
```

---

## Error Responses

All endpoints may return these error formats:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Não autenticado"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Database Setup

Before using the API, setup the database:

```bash
# Create database
createdb o_discipulo

# Run schema
psql -d o_discipulo -f database/schema.sql

# Load seed data
psql -d o_discipulo - f database/seed.sql

# Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL
```

---

## Testing with cURL

### Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt
```

### Get Cities:
```bash
curl http://localhost:3000/api/cities
```

### Get Questions:
```bash
curl http://localhost:3000/api/questions/CITY_UUID
```

### With Session Cookie:
```bash
curl http://localhost:3000/api/user/profile \
  -b cookies.txt
```

---

## Implementation Status

✅ **Completed:**
- Authentication (register/login)  
- Cities listing
- Dynamic question selection
- Game session management
- Answer validation
- Score calculation & rankings
- User profile & stats

⏳ **To Do:**
- Achievements system
- Weekly challenges
- Frontend integration
- Rate limiting
- Input sanitization
- Error logging
- API documentation (Swagger/OpenAPI)

---

## Security Notes

🔒 **Current Implementation:**
- Passwords hashed with bcrypt (10 rounds)
- Session tokens stored in HTTP-only cookies
- SQL injection protected (parameterized queries)

⚠️ **Production Recommendations:**
- Use JWT tokens instead of in-memory sessions
- Implement Redis for session storage
- Add rate limiting (express-rate-limit)
- Enable CORS properly
- Add input validation middleware (Zod/Joi)
- Implement CSRF protection
- Add request logging
- Use environment-specific secrets
- Enable HTTPS in production
