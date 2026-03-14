# 🏗️ Backend Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                        │
│                    http://localhost:5173                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    HTTP/HTTPS (REST API)
                 Authorization: Bearer <JWT_TOKEN>
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                    Express Backend Server                        │
│                    http://localhost:5000                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      ROUTES LAYER                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │ authRoutes   │  │oppRoutes     │  │ userRoutes   │     │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │ │
│  └─────────┼──────────────────┼──────────────────┼─────────────┘ │
│            │                  │                  │                 │
│  ┌─────────▼──────────────────▼──────────────────▼─────────────┐ │
│  │                    MIDDLEWARE LAYER                         │ │
│  │  ┌─────────────────────┐    ┌──────────────┐              │ │
│  │  │  authMiddleware     │    │roleMiddleware│              │ │
│  │  │ (Verify JWT token)  │    │ (Check role) │              │ │
│  │  └──────────┬──────────┘    └──────┬───────┘              │ │
│  │             └──────────┬───────────┘                       │ │
│  └────────────────────────┼────────────────────────────────────┘ │
│                           │                                       │
│  ┌────────────────────────▼────────────────────────────────────┐ │
│  │                  CONTROLLERS LAYER                          │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                 │ │
│  │  │authController   │  │oppController    │                 │ │
│  │  │ • register      │  │ • create        │                 │ │
│  │  │ • login         │  │ • getAll        │                 │ │
│  │  │ • getProfile    │  │ • getById       │                 │ │
│  │  │ • updateProfile │  │ • update        │                 │ │
│  │  │ • changePasswd  │  │ • delete        │                 │ │
│  │  └────────┬────────┘  │ • apply         │                 │ │
│  │           │           │ • getMyApps     │                 │ │
│  │           └───────────┼─┬───────────────┘                 │ │
│  └───────────────────────┼─┼──────────────────────────────────┘ │
│                          │ │                                     │
│  ┌──────────────────────┬┴─┴────────────────────────────────┐  │
│  │              DATABASE MODELS LAYER                       │  │
│  │  ┌──────────────┐    ┌──────────────────┐              │  │
│  │  │ User Schema  │    │ Opportunity      │              │  │
│  │  │ • id         │    │ Schema           │              │  │
│  │  │ • email      │    │ • id             │              │  │
│  │  │ • password   │    │ • title          │              │  │
│  │  │ • role       │    │ • description    │              │  │
│  │  │ • skills     │    │ • requiredSkills │              │  │
│  │  │ • location   │    │ • duration       │              │  │
│  │  │ • googleId   │    │ • location       │              │  │
│  │  └──────┬───────┘    │ • status         │              │  │
│  │         │            │ • createdBy      │              │  │
│  │         │            │ • applicants[]   │              │  │
│  │         │            └────┬─────────────┘              │  │
│  └─────────┼──────────────────┼───────────────────────────┘   │
│            │                  │                                  │
└────────────┼──────────────────┼──────────────────────────────────┘
             │                  │
             ▼                  ▼
    ┌─────────────────┐  ┌──────────────────┐
    │  MongoDB Atlas  │  │   JWT/Passport   │
    │  - Users        │  │   Storage        │
    │  - Opportunities│  │                  │
    └─────────────────┘  └──────────────────┘
```

---

## Authentication Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│           EMAIL/PASSWORD FLOW                             │
└──────────────────────────────────────────────────────────┘

  User Form                Backend                 Database
      │                      │                         │
      ├─ Register ──────────>│                         │
      │  (email, pwd, role) │                         │
      │                      ├─ Hash password ────────>│
      │                      ├─ Create user           │
      │                      │<───────────────────────┤
      │<─ JWT token ────────┤                         │
      │  + User data        │                         │
      │                      │                         │
      └─────────────────────┬────────────────────────┘
                            │
      ┌─────────────────────┴────────────────────────┐
      │                                              │
      ▼                      │                       │
  User Form                 │                       │
      │                      │                       │
      ├─ Login ────────────>│                       │
      │  (email, password)  │                       │
      │                      ├─ Find user ───────────>│
      │                      │<─ User found ────────┤
      │                      ├─ Compare pwd          │
      │                      ├─ Generate JWT ──────>│
      │<─ JWT token ────────┤                      │
      │                      │                       │


┌──────────────────────────────────────────────────────────┐
│               GOOGLE OAUTH FLOW                           │
└──────────────────────────────────────────────────────────┘

  Frontend                 Google              Backend       Database
      │                     │                     │              │
      ├─ Click ────────────>│                     │              │
      │  "Sign with Google" │                     │              │
      │                     │                     │              │
      │<─ Auth Page ────────┤                     │              │
      │                     │                     │              │
      ├─ User Authenticates ─────────────────────>│              │
      │                     │                     │              │
      │<─ Redirect code ────────────────────────┤              │
      │  + JWT              │                     │              │
      │                     │                     ├─ Create/Find >│
      │                     │                     │  User         │
      │                     │                     │              │
      │<─ User data ────────────────────────────┤<────────────┤
      │  (if no role)       │                     │              │
      │                     │                     │              │
      ├─ Show Role Select ─┬────────────────────┬┐             │
      │  (Volunteer/NGO)   │                    ││             │
      │                    │                    ││             │
      ├─ Select Role ─────────────────────────>││             │
      │ PUT /users/set-role │                   │├─ Update User>│
      │                     │                   │             │
      │<─ Confirmed ────────────────────────────┤             │
      │                     │                   │              │


┌──────────────────────────────────────────────────────────┐
│          PROTECTED API CALL FLOW                          │
└──────────────────────────────────────────────────────────┘

  Frontend                Backend Middleware        Controller
      │                      │                         │
      ├─ API Request ────────>│                         │
      │  + JWT token in       │                         │
      │    Authorization      │                         │
      │    header             │                         │
      │                       ├─ Check token ──────────>│
      │                       │  present?                │
      │                       │                         │
      │                       ├─ Verify JWT ──────────>│
      │                       │  signature &           │
      │                       │  expiration            │
      │                       │                         │
      │                       ├─ Decode token ──────────>│
      │                       │  Get user ID            │
      │                       │                         │
      │                       ├─ Find user ────────────>│
      │                       │  in DB                  │
      │                       │                         │
      │                       ├─ Attach user ──────────>│
      │                       │  to req.user            │
      │                       │                         │
      │                       ├─ Check role ──────────>│
      │                       │  authorization         │
      │                       │                         │
      │                       ├─ Call handler ────────>│
      │                       │                         │
      │                       │<─ Response ──────────┤
      │<─ API Response ───────┤                         │
      │   (200, 403, etc)    │                         │
      │
```

---

## Request/Response Cycle

```
┌─────────────────────────────────────────────────────────┐
│              COMPLETE REQUEST CYCLE                      │
└─────────────────────────────────────────────────────────┘

1. CLIENT PREPARES REQUEST
   ┌────────────────────────────────────────┐
   │ POST /api/opportunities                │
   │ Headers:                               │
   │  - Content-Type: application/json      │
   │  - Authorization: Bearer <JWT_TOKEN>   │
   │ Body: {                                │
   │   "title": "...",                      │
   │   "description": "...",                │
   │   ...                                  │
   │ }                                      │
   └────────────────────────────────────────┘
                      │
                      ▼
2. SERVER RECEIVES REQUEST
   ┌────────────────────────────────────────┐
   │ Express.js parses:                     │
   │ - Headers                              │
   │ - URL & method                         │
   │ - Body (JSON)                          │
   └────────────────────────────────────────┘
                      │
                      ▼
3. MIDDLEWARE CHAIN EXECUTES
   ┌────────────────────────────────────────┐
   │ 1. CORS Middleware                     │
   │    - Check origin                      │
   │    - Allow/block request               │
   │                                        │
   │ 2. JSON Parser                         │
   │    - Parse request body                │
   │                                        │
   │ 3. Authentication Middleware           │
   │    - Extract token from header         │
   │    - Verify JWT signature              │
   │    - Find user in DB                   │
   │    - Attach to req.user                │
   │                                        │
   │ 4. Role Middleware                     │
   │    - Check req.user.role               │
   │    - Compare with allowed roles        │
   │    - Allow/block (403)                 │
   │                                        │
   │ 5. Route Handler activates             │
   └────────────────────────────────────────┘
                      │
                      ▼
4. CONTROLLER FUNCTION EXECUTES
   ┌────────────────────────────────────────┐
   │ createOpportunity(req, res) {           │
   │   1. Validate input                    │
   │   2. Create object                     │
   │   3. Save to database                  │
   │   4. Format response                   │
   │   5. Send response                     │
   │ }                                      │
   └────────────────────────────────────────┘
                      │
                      ▼
5. RESPONSE SENT
   ┌────────────────────────────────────────┐
   │ HTTP/1.1 201 Created                   │
   │ Content-Type: application/json         │
   │ {                                      │
   │   "success": true,                     │
   │   "message": "Opportunity created",    │
   │   "opportunity": {                     │
   │     "_id": "64abc123...",              │
   │     "title": "...",                    │
   │     "createdBy": "64def456...",        │
   │     ...                                │
   │   }                                    │
   │ }                                      │
   └────────────────────────────────────────┘
                      │
                      ▼
6. CLIENT RECEIVES RESPONSE
   ┌────────────────────────────────────────┐
   │ Frontend:                              │
   │ - Check status code (201)              │
   │ - Parse JSON response                  │
   │ - Update UI with data                  │
   │ - Show success message                 │
   │ - Save opportunity ID if needed        │
   │ - Redirect user if needed              │
   └────────────────────────────────────────┘
```

---

## Status Code Flow

```
┌──────────────────────────────────────────┐
│        REQUEST VALIDATION FLOW            │
└──────────────────────────────────────────┘

Request Arrives
      │
      ▼
Valid URL & Method?
  NO ──> 404 Not Found
  YES
      │
      ▼
Valid Request Body?
  NO ──> 400 Bad Request
  YES
      │
      ▼
Authorization Header Present?
  NO ──> 401 Unauthorized
  YES
      │
      ▼
JWT Token Valid?
  NO ──> 401 Unauthorized
  YES
      │
      ▼
User Found in DB?
  NO ──> 401 Unauthorized
  YES
      │
      ▼
User Role Allowed?
  NO ──> 403 Forbidden
  YES
      │
      ▼
Business Logic Valid?
  NO ──> 400 Bad Request
  YES
      │
      ▼
Database Operation Success?
  NO ──> 500 Server Error
  YES
      │
      ▼
✅ 200 OK / 201 Created
```

---

## Role-Based Access Matrix

```
┌──────────────────────────────────────────────────────────┐
│              PERMISSION MATRIX                            │
└──────────────────────────────────────────────────────────┘

                     │ Volunteer │ NGO      │ Admin
─────────────────────┼───────────┼──────────┼──────
Register             │ ✅        │ ✅       │ ✅
Login                │ ✅        │ ✅       │ ✅
View Profile         │ ✅        │ ✅       │ ✅
Edit Own Profile     │ ✅        │ ✅       │ ✅
Change Own Pwd       │ ✅        │ ✅       │ ✅
View All Opps        │ ✅        │ ✅       │ ✅
View Single Opp      │ ✅        │ ✅       │ ✅
Create Opp           │ ❌        │ ✅       │ ✅
Edit Own Opp         │ ❌        │ ✅       │ ✅
Edit Other's Opp     │ ❌        │ ❌       │ ✅
Delete Own Opp       │ ❌        │ ✅       │ ✅
Delete Other's Opp   │ ❌        │ ❌       │ ✅
Apply to Opp         │ ✅        │ ❌       │ ✅
View My Applications │ ✅        │ ❌       │ ✅
View Volunteer Dash  │ ✅        │ ❌       │ ✅
View NGO Dash        │ ❌        │ ✅       │ ✅
Set Role             │ ✅ (Once) │ ✅ (Once)│ ✅
```

---

## Database Relationships

```
┌─────────────────────────────────────────────────────────┐
│           MONGODB RELATIONSHIP DIAGRAM                   │
└─────────────────────────────────────────────────────────┘

Users Collection
┌──────────────────────────────────────┐
│ {                                    │
│   _id: ObjectId("user001"),          │
│   name: "John Volunteer",            │
│   email: "john@example.com",         │
│   password: "hashed...",             │
│   role: "volunteer",                 │
│   skills: ["Teaching", "Leadership"],│
│   location: "NYC",                   │
│   bio: "...",                        │
│   googleId: null,                    │
│   profilePic: null,                  │
│   createdAt: Date,                   │
│   updatedAt: Date                    │
│ }                                    │
└──────────────────────────────────────┘
         ▲           ▲
         │           │
         │ refs      │ refs
         │           │
┌────────┴──────┐    │
│ createdBy     │    │ ngo (backward)
└────┬──────────┘    │
     │               │
     │               │
Opportunities Collection
┌──────────────────────────────────────────────┐
│ {                                            │
│   _id: ObjectId("opp001"),                   │
│   title: "Cleanup Drive",                    │
│   description: "...",                        │
│   requiredSkills: ["Physical Labor"],        │
│   duration: "3 hours",                       │
│   location: "Central Park",                  │
│   status: "open",                            │
│   createdBy: ObjectId("user002") ────┐       │
│   createdByType: "ngo",              │ Ref   │
│   ngo: ObjectId("user002") ──────────┼──────>│ NGO User
│   applicants: [                      │       │
│     {                                │       │
│       user: ObjectId("user001")──────┼──────>│ Volunteer User
│       status: "pending",             │       │
│       appliedAt: Date                │       │
│     },                               │       │
│     {                                │       │
│       user: ObjectId("user003"),     │       │
│       status: "accepted",            │       │
│       appliedAt: Date                │       │
│     }                                │       │
│   ],                                 │       │
│   createdAt: Date,                   │       │
│   updatedAt: Date                    │       │
│ }                                    │       │
└──────────────────────────────────────┘       │
                                               │
                                    Many-to-Many via
                                    applicants array
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────┐
│          ERROR HANDLING PIPELINE              │
└─────────────────────────────────────────────┘

Error Occurs in Controller
      │
      ▼
catch (error) block
      │
      ├─ Check error type
      │
      ├─ CastError (Invalid ObjectId)
      │  └─> 400 Bad Request
      │
      ├─ ValidationError (Missing required field)
      │  └─> 400 Bad Request
      │
      ├─ DuplicateKeyError (Unique constraint)
      │  └─> 400 Bad Request
      │
      ├─ JsonWebTokenError
      │  └─> 401 Unauthorized
      │
      ├─ TokenExpiredError
      │  └─> 401 Unauthorized
      │
      └─ Generic Error
         └─> 500 Server Error

      │
      ▼
Send JSON Response
{
  "success": false,
  "message": "Error description"
}
      │
      ▼
Client receives error
```

---

## Data Validation Layers

```
┌──────────────────────────────────────┐
│      VALIDATION LAYERS                │
└──────────────────────────────────────┘

1. ROUTE LEVEL (Basic checks)
   - Is endpoint defined?
   - Is method correct?

2. MIDDLEWARE LEVEL
   - Is request formatted correctly?
   - Does token exist and validate?
   - Does user have correct role?

3. CONTROLLER LEVEL (Business logic)
   - Are required fields present?
   - Is data format correct?
   - Are values within allowed range?

4. MODEL LEVEL (Database schema)
   - Does field match schema type?
   - Do values match enum?
   - Are required fields provided?
   - Are unique constraints met?

5. DATABASE LEVEL
   - Operation success?
   - Data persisted correctly?

Each layer validates and either:
  ✅ Passes to next layer
  ❌ Returns error immediately
```

---

## Performance Considerations

```
┌──────────────────────────────────────────────────┐
│       QUERY PERFORMANCE OPTIMIZATION              │
└──────────────────────────────────────────────────┘

Database Indexes Applied:
┌──────────────────────────┐
│ opportunitySchema.index({│
│   createdBy: 1           │  Fast lookup of NGO's opportunities
│ })                       │
└──────────────────────────┘

┌──────────────────────────┐
│ opportunitySchema.index({│
│   status: 1              │  Fast filtering by open/closed
│ })                       │
└──────────────────────────┘

┌──────────────────────────┐
│ opportunitySchema.index({│
│   location: 1            │  Fast location-based search
│ })                       │
└──────────────────────────┘

WITHOUT indexes:
  - 10,000 opportunities → Full collection scan
  - Each query scans ALL documents
  - Slow response times

WITH indexes:
  - 10,000 opportunities → Direct lookup/range scan
  - Query only touches relevant documents
  - Sub-100ms response times

Performance Impact:
  Unindexed: O(n) - linear time
  Indexed:   O(log n) - logarithmic time
```

---

## API Response Time Estimates

```
┌────────────────────────────────────┐
│    TYPICAL RESPONSE TIMES           │
└────────────────────────────────────┘

Public Endpoints (no auth):
  GET /opportunities          ← 50-100ms
  GET /opportunities/:id      ← 30-50ms

Protected Endpoints (with auth):
  GET /api/auth/me            ← 80-150ms  (DB lookup + token verify)
  POST /api/opportunities     ← 100-200ms (Validation + write)
  GET /opportunities/my-opp   ← 50-100ms  (With index on createdBy)
  POST /:id/apply             ← 80-150ms  (Check + write)

Slow Operations (watch for these):
  ❌ GET /opportunities without index ← 1-5s (full scan)
  ❌ Invalid JWT verification ← 100-300ms (crypto)
  ❌ No connection pooling ← 1-2s per request

Optimizations in place:
  ✅ Database indexes
  ✅ Connection pooling (MongoDB)
  ✅ JWT caching (in memory)
  ✅ Minimal DB queries
```

---

## Deployment Checklist

```
┌────────────────────────────────────────────┐
│      BEFORE DEPLOYING TO PRODUCTION         │
└────────────────────────────────────────────┘

Code Quality
  ☑ All tests passing
  ☑ No error logs in console
  ☑ No console.logs left in code
  ☑ No hardcoded secrets

Security
  ☑ JWT_SECRET is strong (64+ char)
  ☑ GOOGLE_CLIENT_ID & SECRET configured
  ☑ CORS origin set correctly
  ☑ Rate limiting enabled
  ☑ Input validation everywhere

Database
  ☑ MongoDB URI updated for production
  ☑ Database backups configured
  ☑ Indexes created
  ☑ Connection pooling enabled

Environment
  ☑ NODE_ENV=production
  ☑ PORT variable set
  ☑ All required env vars present
  ☑ Error logging configured

Performance
  ☑ Database indexes applied
  ☑ Pagination implemented
  ☑ Caching configured
  ☑ CDN configured (if needed)

Monitoring
  ☑ Error tracking (Sentry/etc)
  ☑ Performance monitoring
  ☑ Uptime monitoring
  ☑ Log aggregation
```
