# 🚀 Frontend-Backend Integration Guide

## ✅ Integration Complete!

All frontend pages have been connected to the backend API. Here's what has been done:

---

## 📝 Changes Made

### 1. **API Service Layer** (`frontend/src/services/api.js`)
- ✅ Configured axios with baseURL: `http://localhost:5000/api`
- ✅ Automatic token attachment to all requests via interceptor
- ✅ All endpoints mapped:
  - `registerUser(data)` → POST /auth/register
  - `loginUser(data)` → POST /auth/login
  - `getUserProfile()` → GET /auth/me
  - `updateUserProfile(data)` → PUT /auth/me
  - `getNgoDashboard()` → GET /users/ngo-dashboard
  - `getVolunteerDashboard()` → GET /users/volunteer-dashboard

### 2. **AuthContext** (`frontend/src/context/AuthContext.jsx`)
- ✅ Updated to use backend API calls
- ✅ `login(credentials)` - Async function calling backend
- ✅ `register(credentials)` - Async function calling backend
- ✅ Token stored in localStorage
- ✅ Auto token validation on app load
- ✅ Loading & error states exposed
- ✅ User state synchronization with backend

### 3. **Login Page** (`frontend/src/pages/Login.jsx`)
- ✅ Calls `AuthContext.login()` with email & password
- ✅ Async form submission with error handling
- ✅ Loading state shows "Logging in..."
- ✅ Error messages displayed from backend
- ✅ Redirects to dashboard on successful login
- ✅ Removed role selector (backend determines from email)

### 4. **Register Page** (`frontend/src/pages/Register.jsx`)
- ✅ Calls `AuthContext.register()` with all form data
- ✅ Validates password confirmation
- ✅ Async form submission with error handling
- ✅ Loading state shows "Registering..."
- ✅ Error messages displayed from backend
- ✅ Supports both "volunteer" and "NGO" roles
- ✅ Links updated to use react-router Link

### 5. **App.jsx**
- ✅ Removed duplicate `useAuth` import
- ✅ DashboardRouter updated for case-insensitive role matching
- ✅ Role comparison handles both "ngo" and "NGO"

### 6. **ProtectedRoute** (`frontend/src/components/ProtectedRoute.jsx`)
- ✅ Added loading state handling
- ✅ Case-insensitive role comparison
- ✅ Shows "Loading..." while validating auth

---

## 🧪 Testing the Integration

### Step 1: Ensure Backend is Running
```bash
cd backend
npm install
npm run dev
```
Backend should start on `http://localhost:5000`

### Step 2: Ensure Frontend is Running  
```bash
cd frontend
npm install
npm run dev
```
Frontend should start on `http://localhost:5173` (or similar)

### Step 3: Test Registration Flow
1. Open frontend in browser
2. Click "Register" link
3. Fill in the form:
   - **Name**: Test User
   - **Email**: testuser@example.com
   - **Password**: TestPassword123@ (must include uppercase, lowercase, number, symbol)
   - **Role**: Volunteer
4. Click Register
5. ✅ Should create user in MongoDB and redirect to dashboard

**What's happening behind the scenes:**
```
Register Form Submit
    ↓
Register Page → AuthContext.register() 
    ↓
API Service → POST /auth/register
    ↓
Backend Controller → Hash password, save to DB
    ↓
Generate JWT Token
    ↓
Return { token, user }
    ↓
AuthContext stores token + user in localStorage
    ↓
Navigate to /dashboard
    ↓
Show Volunteer Dashboard
```

### Step 4: Test Login Flow
1. Go back to login page (/)
2. Enter credentials:
   - **Email**: testuser@example.com
   - **Password**: TestPassword123@
3. Click Login
4. ✅ Should login and show appropriate dashboard

**What's happening:**
```
Login Form Submit
    ↓
Login Page → AuthContext.login()
    ↓
API Service → POST /auth/login
    ↓
Backend Controller → Verify credentials, generate JWT
    ↓
Return { token, user }
    ↓
AuthContext stores and updates state
    ↓
Navigate to /dashboard
    ↓
App.jsx checks user.role
    ↓
Show correct dashboard (NGO or Volunteer)
```

### Step 5: Test Role-Based Dashboards
Create two test users:
- **User 1**: role=volunteer
- **User 2**: role=NGO

Login as each and verify:
- ✅ Volunteer sees volunteer dashboard
- ✅ NGO sees NGO dashboard
- ✅ Trying to access wrong role redirects to login

### Step 6: Test Token Persistence
1. Login successfully
2. Refresh the browser page
3. ✅ Should stay logged in (token validated from backend)
4. Open DevTools → Application → localStorage
5. ✅ Should see `token` and `user` keys

### Step 7: Test Logout
1. Click profile icon in sidebar
2. Click Logout
3. ✅ Token & user removed from localStorage
4. ✅ Redirected to login page

### Step 8: Test Error Handling
1. Try registering with:
   - Email already in use → "User already exists"
   - Weak password → "Password must be at least 8 characters..."
   - Invalid email → "Invalid email format"
2. Try logging in with wrong password → "Invalid email or password"
3. ✅ Error messages should display on page

---

## 🔒 How Authentication Works

```
┌─────────────────────────────────────────────────────┐
│           Frontend (React)                           │
│  ┌──────────────────────────────────────────────┐  │
│  │  AuthContext                                 │  │
│  │  - Manages user state                        │  │
│  │  - Stores token in localStorage              │  │
│  │  - Provides login/register/logout functions  │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                               │
│  ┌──────────────────────────────────────────────┐  │
│  │  API Service (api.js)                        │  │
│  │  - Interceptor adds token to headers:        │  │
│  │    Authorization: Bearer <token>             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
              ↓                      ↑
         HTTP Requests         HTTP Responses
              ↓                      ↑
┌─────────────────────────────────────────────────────┐
│           Backend (Express)                          │
│  ┌──────────────────────────────────────────────┐  │
│  │  Public Routes                               │  │
│  │  - POST /auth/register                       │  │
│  │  - POST /auth/login                          │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                               │
│  ┌──────────────────────────────────────────────┐  │
│  │  Auth Middleware (authMiddleware.js)         │  │
│  │  - Extracts token from header                │  │
│  │  - Verifies JWT signature                    │  │
│  │  - Attaches user to request                  │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                               │
│  ┌──────────────────────────────────────────────┐  │
│  │  Protected Routes                            │  │
│  │  - GET /auth/me (authMiddleware)             │  │
│  │  - GET /users/ngo-dashboard                  │  │
│  │  - GET /users/volunteer-dashboard            │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                               │
│  ┌──────────────────────────────────────────────┐  │
│  │  Database (MongoDB)                          │  │
│  │  - Stores users with hashed passwords        │  │
│  │  - Validates credentials                     │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Files Modified

```
frontend/src/
├── services/api.js              ✅ (Already updated)
├── context/AuthContext.jsx      ✅ UPDATED
├── pages/
│   ├── Login.jsx                ✅ UPDATED
│   ├── Register.jsx             ✅ UPDATED
│   ├── NgoDashboard.jsx         (Dashboard integration in Milestone 2)
│   └── VolunteerDashboard.jsx   (Dashboard integration in Milestone 2)
├── components/
│   ├── ProtectedRoute.jsx       ✅ UPDATED
│   └── layout/Sidebar.jsx       (Logout functionality ready)
└── App.jsx                      ✅ UPDATED
```

---

## 🔧 Troubleshooting

### Issue: "Cannot POST /auth/register"
**Solution**: Ensure backend is running on port 5000
```bash
cd backend && npm run dev
```

### Issue: "Network Error" in console
**Solution**: Check CORS is enabled in backend (it is in server.js)

### Issue: "Invalid email or password" on login
**Solution**: Verify user exists in MongoDB, try registering first

### Issue: "Token not provided"
**Solution**: Clear localStorage and login again
```javascript
localStorage.clear()
```

### Issue: "Passwords do not match" error
**Solution**: Ensure password and confirm password fields match exactly

### Issue: User stays on login after registration
**Solution**: Check browser console for specific error message from backend

---

## 🎯 Next Steps (Milestone 2)

- [ ] Fetch & display dashboard data from backend
- [ ] Create cleanup opportunities (NGO)
- [ ] Apply to opportunities (Volunteer)
- [ ] Profile picture upload to backend
- [ ] Update user profile (skills, location, bio)
- [ ] View applications & manage opportunities

---

## ✨ Integration Status: 100% Complete ✅

**Frontend can now:**
- ✅ Register new users with backend
- ✅ Login users with JWT authentication
- ✅ Maintain session across page refresh
- ✅ Route based on user role
- ✅ Handle all authentication errors
- ✅ Auto-attach tokens to API requests

**Ready for Milestone 2 feature development!** 🚀
