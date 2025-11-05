# tripBuddy 

tripBuddy is a **monolithic, single-tenant MVC application** for sharing and tracking trips worldwide — from mountain hikes to cycling tours. It supports **multiple user roles** and allows users to plan, share, and collaborate on trips.

---

##  Features
- **Authentication:** Signup, login, logout, JWT-based sessions.
- **User Roles:** Admins, Lead-guides, guides and regular users with role-based permissions.
- **Trip Management:** Create, edit, delete trips; add destinations and activities.
- **Collaboration:** Invite friends to trips and assign permissions.
- **Responsive UI:** Dashboard, map views, and trip details pages.
- **Security:** Helmet, rate limiting, XSS & NoSQL sanitization, HPP.
- **Static Content:** Serves user images from `/public/img` with CORS headers.

> **Work in progress:** Payment integration, user image handling on cloud storage, deployment.

---

##  Tech Stack
- **Backend:** Node.js + Express (MVC, structured controllers/routes/models)  
- **Database:** MongoDB with Mongoose  
- **Frontend:** React (components, pages, services, Context API)  
- **Authentication:** JWT  
- **Security:** Helmet, express-rate-limit, xss-clean, mongo-sanitize, hpp  
- **Planned:** Cloud storage for user images, payment gateway integration  

---

##  Project Structure
```
tripBuddy/
│
├─ backend/
│ ├─ controllers/ # Route handlers (users, tours, reviews)
│ ├─ models/ # Mongoose schemas
│ ├─ routes/ # API routes
│ ├─ utils/ # AppError and helper functions
│ ├─ config/ # DB and env setup
│ └─ app.js # Express app
│
├─ frontend/
│ ├─ src/
│ │ ├─ components/ # Reusable UI components
│ │ ├─ pages/ # Main pages (Dashboard, Trip, Profile)
│ │ ├─ services/ # API services
│ │ ├─ context/ # State management
│ │ └─ App.jsx
│
├─ .gitignore
├─ package.json
└─ README.md
```
