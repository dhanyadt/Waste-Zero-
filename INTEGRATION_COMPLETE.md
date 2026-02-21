# 🚀 Backend-Frontend Integration Guide

## ✅ Integration Completed

All backend and frontend files have been connected. Here's what's been integrated:

### **1. API Service Layer** (`frontend/src/services/api.js`)
- ✅ Axios instance configured with baseURL: `http://localhost:5000/api`
- ✅ Automatic token attachment via interceptor
- ✅ All endpoints mapped: register, login, profile, dashboards

### **2. Authentication Context** (`frontend/src/context/AuthContext.jsx`)
- ✅ `login()` function calls backend API
- ✅ `register()` function calls backend API
- ✅ Token stored in localStorage
- ✅ Auto-token validation on app startup
- ✅ User state persistence

### **3. Login Page** (`frontend/src/pages/Login.jsx`)
- ✅ Calls backend API via AuthContext
- ✅ Proper error handling
- ✅ Loading states

### **4. Register Page** (`frontend/src/pages/Register.jsx`)
- ✅ Calls backend API via AuthContext
- ✅ Password validation
- ✅ Error messages
- ✅ Redirects to dashboard on success

### **5. Dashboards**
- ✅ **NgoDashboard** - Fetches data from backend
- ✅ **VolunteerDashboard** - Fetches data from backend
- ✅ Both handle loading & error states

### **6. Protected Routes** (`frontend/src/components/ProtectedRoute.jsx`)
- ✅ Auth guard with token verification
- ✅ Role-based access (case-insensitive)
- ✅ Loading state handling

### **7. Backend** (`backend/`)
- ✅ Express server with CORS enabled
- ✅ MongoDB connected (using Atlas)
- ✅ Auth routes: /api/auth/register, /api/auth/login
- ✅ Dashboard routes: /api/users/ngo-dashboard, /api/users/volunteer-dashboard
- ✅ Auth middleware with JWT verification
- ✅ Role middleware for access control

---

## 🧪 How to Test the Integration

### **Step 1: Start Backend**
```bash
cd backend
npm install  # (if not already installed)
npm run dev
```
Backend should run on: `http://localhost:5000`

### **Step 2: Start Frontend**
In a new terminal:
```bash
cd frontend
npm install  # (if not already installed)
npm run dev
```
Frontend should run on: `http://localhost:5173` (or similar)

### **Step 3: Test Registration**
1. Open frontend (`http://localhost:5173`)
2. Click "Register" link
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPassword123@
   - Role: Volunteer
4. Click Register
5. ✅ Should create user in MongoDB and redirect to dashboard

### **Step 4: Test Login**
1. Go back to login page
2. Enter same credentials:
   - Email: test@example.com
   - Password: TestPassword123@
3. Select Role: Volunteer
4. Click Login
5. ✅ Should login and show Volunteer Dashboard

### **Step 5: Test Role-Based Dashboards**
- **Volunteer** should see:
  - Profile summary
  - "Find Opportunities" button
  - Stats (pickups, kg recycled, pending requests)
  - "My Applications" section
  
- **NGO** should see:
  - Profile summary
  - "Create Opportunity" button (disabled)
  - "My Opportunities" section (empty)

### **Step 6: Test Logout**
1. Click profile icon in sidebar
2. Click "Logout"
3. ✅ Should redirect to login page

---

## 📋 API Endpoints Available

### **Auth Endpoints**
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user (protected)
PUT    /api/auth/me          - Update profile (protected)
```

### **Dashboard Endpoints**
```
GET    /api/users/ngo-dashboard        - NGO dashboard data (protected, role: NGO)
GET    /api/users/volunteer-dashboard  - Volunteer dashboard data (protected, role: volunteer)
```

---

## 🔑 Authentication Flow

```
User Registration:
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│   Frontend  │────→│   Backend    │────→│ MongoDB   │
│  (Register) │     │  (API)       │     │           │
└─────────────┘     └──────────────┘     └───────────┘
        ↓
  [Token + User Data stored in localStorage]
        ↓
   [Auto-login & redirect to dashboard]


User Login:
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│   Frontend  │────→│   Backend    │────→│ MongoDB   │
│   (Login)   │     │  (Verify)    │     │ (Find     │
└─────────────┘     └──────────────┘     │  User)    │
        ↓                                 └───────────┘
  [Receive JWT Token]
        ↓
  [Store in localStorage]
        ↓
  [Attach to all API requests via interceptor]
        ↓
   [ProtectedRoute verifies auth + role]
        ↓
   [Show correct dashboard]
```

---

## 🛠️ Troubleshooting

### **Backend not starting?**
- Check MongoDB connection: `MONGO_URI` in `.env`
- Ensure port 5000 is not in use
- Check Node.js version (should be 14+)

### **Frontend can't connect to backend?**
- Ensure backend is running on port 5000
- Check CORS is enabled (it is in `server.js`)
- Check browser console for network errors

### **Login/Register fails?**
- Check field validation (password must have 8+ chars, 1 uppercase, 1 number, 1 symbol)
- Verify email format
- Check MongoDB connection

### **Dashboard shows error?**
- Check user token is stored in localStorage
- Verify token is still valid (7 days expiry)
- Check browser console for specific errors

### **Role-based routing not working?**
- Verify role is stored correctly in localStorage
- Check role matches "volunteer" or "ngo" (case-insensitive)
- Clear localStorage and login again

---

## 📦 Project Structure After Integration

```
frontend/
├── src/
│   ├── services/api.js            ← API client with interceptor
│   ├── context/AuthContext.jsx    ← Auth state management
│   ├── components/
│   │   ├── ProtectedRoute.jsx     ← Route protection
│   │   └── layout/Sidebar.jsx     ← Navigation
│   └── pages/
│       ├── Login.jsx              ← Login with backend call
│       ├── Register.jsx           ← Register with backend call
│       ├── NgoDashboard.jsx       ← NGO dashboard with data fetch
│       └── VolunteerDashboard.jsx ← Volunteer dashboard with data fetch

backend/
├── config/db.js                   ← MongoDB connection
├── middleware/
│   ├── authMiddleware.js          ← JWT verification
│   └── roleMiddleware.js          ← Role-based access
├── controllers/authController.js  ← Auth logic
├── models/User.js                 ← User schema
├── routes/
│   ├── authRoutes.js              ← Auth endpoints
│   └── userRoutes.js              ← Dashboard endpoints
├── utils/generateToken.js         ← JWT generation
├── server.js                      ← Express server
└── .env                           ← Configuration
```

---

## ✨ What's Next?

### **Milestone 2 Features:**
- [ ] Create cleanup opportunities
- [ ] Apply to opportunities
- [ ] Profile picture upload to backend
- [ ] Update profile (skills, location, bio)
- [ ] Opportunity management
- [ ] Applications management

---

## 🎉 Integration Status: 100% COMPLETE ✅

The backend and frontend are fully integrated and ready for testing!
