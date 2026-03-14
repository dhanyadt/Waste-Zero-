# 🚀 API Quick Reference Guide

## Environment Setup

```bash
# Start Backend
cd backend
npm run dev

# Backend URL: http://localhost:5000
# API Base: http://localhost:5000/api
```

---

## Request/Response Format

### Request Headers (Protected Endpoints)

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Response Format (Success)

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* resource data */
  }
}
```

### Response Format (Error)

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication Flow

### Register

```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "StrongPass123!",
  "role": "volunteer" | "ngo"
}
Response: { token, user }
```

### Login

```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "StrongPass123!"
}
Response: { token, user }
```

### Verify Token (Get Profile)

```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

---

## Role-Based Access

| Role          | Can Do                                                                                                               | Cannot Do                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **volunteer** | Apply to opportunities, view all opportunities, update own profile                                                   | Create/edit/delete opportunities, access NGO dashboard |
| **ngo**       | Create opportunities, view own opportunities, edit own opportunities, delete own opportunities, access NGO dashboard | Apply to opportunities, access volunteer dashboard     |
| **admin**     | All access                                                                                                           | (Reserved for future)                                  |

---

## Opportunity Endpoints

### Create (NGO Only)

```
POST /api/opportunities
Authorization: Bearer <NGO_TOKEN>
Body: {
  "title": "Cleanup Drive",
  "description": "Help clean the park",
  "duration": "3 hours",
  "location": "Central Park",
  "requiredSkills": ["Physical Labor"],
  "status": "open"
}
Response: { opportunity }
```

### Get All (Public - with Filters)

```
GET /api/opportunities
GET /api/opportunities?location=NYC
GET /api/opportunities?skills=Teaching,Leadership (comma-separated)
GET /api/opportunities?status=open
Response: { opportunities: [{ id, title, description, ... }] }
```

### Get Single

```
GET /api/opportunities/:id
Response: { opportunity }
```

### Get My Opportunities (NGO Only)

```
GET /api/opportunities/my-opportunities
Authorization: Bearer <NGO_TOKEN>
Response: { opportunities }
```

### Update (NGO Owner Only)

```
PUT /api/opportunities/:id
Authorization: Bearer <NGO_TOKEN>
Body: {
  "title": "Updated Title",
  "status": "closed"
}
Response: { opportunity }
```

### Delete (NGO Owner Only)

```
DELETE /api/opportunities/:id
Authorization: Bearer <NGO_TOKEN>
Response: { message: "Deleted" }
```

---

## Application Endpoints

### Apply to Opportunity (Volunteer Only)

```
POST /api/opportunities/:id/apply
Authorization: Bearer <VOLUNTEER_TOKEN>
Response: { message: "Applied successfully" }
```

### Get My Applications (Volunteer)

```
GET /api/opportunities/my-applications
Authorization: Bearer <VOLUNTEER_TOKEN>
Response: { applications: [{ id, title, status, appliedAt, ... }] }
```

---

## User Endpoints

### Get User Info

```
GET /api/users/me
Authorization: Bearer <TOKEN>
Response: { user }
```

### Set Role (After Google OAuth)

```
PUT /api/users/set-role
Authorization: Bearer <TOKEN>
Body: { "role": "volunteer" | "ngo" }
Response: { role }
```

### Volunteer Dashboard

```
GET /api/users/volunteer-dashboard
Authorization: Bearer <VOLUNTEER_TOKEN>
Response: { message, user, dashboard }
```

### NGO Dashboard

```
GET /api/users/ngo-dashboard
Authorization: Bearer <NGO_TOKEN>
Response: { message, user, dashboard }
```

---

## Error Responses

| Status | Meaning      | Example                                      |
| ------ | ------------ | -------------------------------------------- |
| 400    | Bad Request  | Missing required fields, invalid data        |
| 401    | Unauthorized | No token, expired token, invalid token       |
| 403    | Forbidden    | Insufficient permissions (role check failed) |
| 404    | Not Found    | Resource not found                           |
| 500    | Server Error | Database error, unhandled exception          |

---

## Common Error Scenarios

### Missing Token

```
❌ No Authorization header
Status: 401
{
  "success": false,
  "message": "No token provided"
}
```

### Invalid Token

```
❌ Authorization: Bearer invalid.token
Status: 401
{
  "success": false,
  "message": "Invalid token"
}
```

### Insufficient Permissions

```
❌ Volunteer tries to create opportunity
Status: 403
{
  "success": false,
  "message": "Access denied. Insufficient permissions"
}
```

### Non-Owner Editing

```
❌ Volunteer tries to edit another user's opportunity
Status: 403
{
  "success": false,
  "message": "You can only edit opportunities you created"
}
```

---

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&\*)

**Valid**: `TestPass123!`, `MyPwd2024@`, `Secure_Pass99`  
**Invalid**: `password`, `Pass123`, `TestPass!`

---

## Sample Workflow

### 1. Volunteer Signup → Apply for Opportunity

```javascript
// Step 1: Register as Volunteer
POST /api/auth/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "username": "alice123",
  "password": "Alice_Pass123",
  "role": "volunteer"
}
// Response: { token: "JWT...", user: {...} }

// Step 2: Save token, then get opportunities
GET /api/opportunities
// Response: { opportunities: [...] }

// Step 3: Apply to an opportunity
POST /api/opportunities/64abc123def45/apply
Authorization: Bearer <TOKEN>
// Response: { message: "Application submitted successfully" }

// Step 4: Check applications
GET /api/opportunities/my-applications
Authorization: Bearer <TOKEN>
// Response: { applications: [...] }
```

### 2. NGO Signup → Create Opportunity

```javascript
// Step 1: Register as NGO
POST /api/auth/register
{
  "name": "Green Earth NGO",
  "email": "info@greenearth.org",
  "username": "greenearth",
  "password": "GreenEarth_2024@",
  "role": "ngo"
}
// Response: { token: "JWT...", user: {...} }

// Step 2: Create opportunity
POST /api/opportunities
Authorization: Bearer <TOKEN>
{
  "title": "Recycling Drive",
  "description": "Help us recycle",
  "duration": "2 hours",
  "location": "Downtown",
  "requiredSkills": ["Organization"],
  "status": "open"
}
// Response: { opportunity: {...} }

// Step 3: View own opportunities
GET /api/opportunities/my-opportunities
Authorization: Bearer <TOKEN>
// Response: { opportunities: [{...}] }
```

---

## Testing Checklist

- [ ] Register user with valid credentials
- [ ] Register user with invalid role (should fail)
- [ ] Register with weak password (should fail)
- [ ] Register with duplicate email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Access protected endpoint without token (401)
- [ ] Volunteer creates opportunity (403)
- [ ] NGO creates opportunity (201)
- [ ] Filter opportunities by location
- [ ] Filter opportunities by skills
- [ ] Volunteer applies to opportunity
- [ ] Apply twice to same opportunity (should fail)
- [ ] Get applications as volunteer
- [ ] Update owned opportunity as NGO
- [ ] Edit opportunity not owned by NGO (403)
- [ ] Delete owned opportunity
- [ ] Delete opportunity not owned (403)
- [ ] Access NGO dashboard as NGO
- [ ] Access NGO dashboard as volunteer (403)
- [ ] Set role after signup
- [ ] Change password successfully

---

## Postman Tips

1. **Save Bearer Token**:
   - After login, copy token value
   - Go to Collection → Variables
   - Paste into `{{VOLUNTEER_TOKEN}}` or `{{NGO_TOKEN}}`

2. **Use Environment Variables**:
   - Click Environment settings
   - Add: `BASE_URL`, `VOLUNTEER_TOKEN`, `NGO_TOKEN`, `OPP_ID`
   - Reference with `{{VARIABLE_NAME}}`

3. **View Response**:
   - After sending request, check "Response" tab
   - Status code shows on right (200, 400, 403, etc.)

4. **Debug Issues**:
   - Click "Headers" tab to verify Authorization header
   - Check request body formatting (JSON)
   - Compare actual response with expected format

---

## Common Issues & Fixes

| Issue                     | Cause                    | Fix                                        |
| ------------------------- | ------------------------ | ------------------------------------------ |
| 401 Token Error           | Token expired or invalid | Login again, get new token                 |
| 403 Permission Denied     | Wrong role               | Check user role, use correct token         |
| 404 Not Found             | Wrong endpoint or ID     | Verify endpoint path and resource ID       |
| 400 Bad Request           | Missing required fields  | Check request body has all required fields |
| Database connection fails | MONGO_URI invalid        | Update .env with correct MongoDB URI       |
| 500 Server Error          | Unhandled exception      | Check backend logs, report to dev team     |

---

## Next: Frontend Integration

Once backend is tested and verified working:

1. Frontend makes requests to `http://localhost:5000/api`
2. Frontend sends token in `Authorization` header
3. Frontend handles 401 responses (re-login)
4. Frontend handles 403 responses (unauthorized role)
5. Frontend displays errors from response.message

See `frontend/src/services/api.js` for API integration setup.
