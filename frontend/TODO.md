# Integration TODO - Complete ✅

## Backend Configuration
- [x] Configure CORS in server.js

## Frontend Configuration  
- [x] Configure Vite proxy in vite.config.js
- [x] Update AuthContext with API calls
- [x] Update Login.jsx to call backend with role selection
- [x] Create Register page
- [x] Update App.jsx with register route
- [x] Add Dark Mode support to all components

## How to Run:
1. **Start Backend (optional - works in demo mode without it):**
```
bash
cd waste-zero-feb-team01/backend
npm install
npm run dev
```
- Backend runs on http://localhost:5000

2. **Start Frontend:**
```
bash
cd waste-zero-feb-team01/frontend
npm install
npm run dev
```
- Frontend runs on http://localhost:5173

## Features:
- ✅ Login page with Volunteer/NGO role selection
- ✅ Backend API integration (with demo mode fallback)
- ✅ Role-based dashboard routing
- ✅ Dark/Light theme toggle
- ✅ Protected routes
- ✅ Profile management in Sidebar

## User Flow:
1. Open http://localhost:5173
2. Select "Volunteer" or "NGO" role
3. Click "Continue" (demo mode - no credentials needed)
4. Get redirected to appropriate dashboard based on selected role

## Debugging:
- Open browser console to see debug logs
- Check localStorage to verify user data is stored correctly
