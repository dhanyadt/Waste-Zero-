# 🌱 WasteZero – NGO & Volunteer Opportunity Platform

## 📌 Overview

WasteZero is a full-stack web application designed to connect NGOs with volunteers for waste management and sustainability initiatives.
The platform enables NGOs to create opportunities and allows volunteers to discover, apply, and participate in activities like clean-up drives, recycling programs, and awareness campaigns.

---

## 🚀 Features

* 👤 **Role-Based Access Control (RBAC)** for Admin, NGO, and Volunteer
* 📋 **Opportunity Management** (Create, Edit, Delete, Apply)
* 🔐 **Secure Authentication** using JWT
* 🔄 **Real-Time Communication** using WebSockets (Socket.IO)
* 📊 **Dashboards** for NGOs and Volunteers
* 🌍 **Location-based Opportunities** with structured data

---

## 🛠️ Tech Stack

**Frontend:** React.js, HTML, CSS
**Backend:** Node.js, Express.js
**Database:** MongoDB
**Authentication:** JWT
**Real-Time:** Socket.IO
**Tools:** Git, Postman

---

## ⚙️ How It Works

1. Users register as NGO or Volunteer
2. NGOs create and manage opportunities
3. Volunteers browse and apply for opportunities
4. Real-time updates are handled using WebSockets
5. Admin manages users and platform activities

---

## 🔌 WebSocket Integration

* Implemented using **Socket.IO**
* Enables real-time updates for:

  * User-specific notifications
  * Application status updates
* Uses **room-based communication** for targeted messaging

---

## 📁 Project Structure

```
/frontend   → React application
/backend    → Node.js + Express server
/routes     → API routes
/controllers → Business logic
/models     → MongoDB schemas
```

---

## 📦 Installation

### 1. Clone the repository

```
git clone https://github.com/your-username/waste-zero-feb-team01.git
cd waste-zero-feb-team01

```

### 2. Install dependencies

```
cd backend
npm install

cd ../frontend
npm install
```

### 3. Run the project

```
cd backend
npm start

cd ../frontend
npm run dev
```





