# tripBuddy

tripBuddy is a **monolithic, single-tenant MVC application** for sharing and tracking trips worldwide — from mountain hikes to cycling tours. It supports **multiple user roles** and allows users to plan, share, and collaborate on trips.

---

## ✨ Features

- **Authentication:** Signup, login, logout with JWT-based sessions
- **User Roles:** Admins, Lead-guides, Guides, and Regular users with role-based permissions
- **Trip Management:** Create, edit, delete trips; add destinations and activities
- **Collaboration:** Invite friends to trips and assign granular permissions
- **Responsive UI:** Dashboard, map views, and detailed trip pages
- **Security:** Helmet, rate limiting, XSS & NoSQL injection protection, HPP
- **Static Content:** Serves user images from `/public/img` with CORS headers

> **In Development:** Payment integration, cloud storage for images, production deployment

---

## 🛠️ Tech Stack

- **Backend:** Node.js + Express (MVC architecture with controllers/routes/models)
- **Database:** MongoDB with Mongoose ODM
- **Frontend:** React (components, pages, services, Context API)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, express-rate-limit, xss-clean, mongo-sanitize, hpp
- **Planned:** AWS S3/Cloud storage, Stripe payment integration

---

## 📁 Project Structure

```
tripBuddy/
│
├─ backend/
│ ├─ controllers/      # Route handlers (users, trips, reviews)
│ ├─ models/           # Mongoose schemas
│ ├─ routes/           # API endpoint definitions
│ ├─ utils/            # AppError, helpers, middleware
│ ├─ config/           # Database & environment configuration
│ ├─ app.js            # Express app setup
│ └─ server.js         # Server entry point
│
├─ frontend/
│ ├─ src/
│ │ ├─ components/     # Reusable UI components
│ │ ├─ pages/          # Main pages (Dashboard, Trip, Profile)
│ │ ├─ services/       # API client services
│ │ ├─ context/        # React Context for state management
│ │ ├─ App.jsx         # Root component
│ │ └─ index.jsx       # React entry point
│ ├─ public/           # Static assets
│ └─ package.json
│
├─ .gitignore
├─ .env.example        # Environment variables template
├─ package.json        # Root dependencies
└─ README.md           # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas connection string)

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd tripBuddy

# Install root dependencies (if using workspace setup)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (in a new terminal)
cd ../frontend
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# Backend environment variables
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tripbuddy
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend API URL (in frontend/.env)
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Run the Application

**Option A: Terminal 1 - Backend**

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Option B: Terminal 2 - Frontend**

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

**Or run both concurrently from root (if configured):**

```bash
npm run dev
```

### Step 4: Database Setup (MongoDB)

```bash
# If using local MongoDB
mongod

# Verify connection in backend logs
# You should see: "Connected to MongoDB"
```

---

## 📝 Available Scripts

### Backend

```bash
npm run dev          # Start with nodemon (development)
npm start            # Start production server
npm run test         # Run tests
```

### Frontend

```bash
npm start            # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

---

## 🔐 Security Features

- **JWT Authentication** for stateless session management
- **Helmet.js** for HTTP security headers
- **Rate Limiting** on sensitive endpoints
- **XSS Protection** via xss-clean middleware
- **NoSQL Injection Prevention** via mongo-sanitize
- **HTTP Parameter Pollution** protection via hpp

---

## 📌 Key Endpoints (Backend API)

```
POST   /api/auth/signup           # Register new user
POST   /api/auth/login            # User login
GET    /api/trips                 # Get all trips
POST   /api/trips                 # Create new trip
GET    /api/trips/:id             # Get trip details
PATCH  /api/trips/:id             # Update trip
DELETE /api/trips/:id             # Delete trip
POST   /api/trips/:id/invite      # Invite users to trip
```

---

## 🐛 Troubleshooting

| Issue                     | Solution                                             |
| ------------------------- | ---------------------------------------------------- |
| MongoDB connection failed | Check `MONGODB_URI` in `.env` and network access     |
| Port 5000 already in use  | Change `PORT` in `.env` or kill process on that port |
| CORS errors               | Verify `REACT_APP_API_URL` matches backend URL       |
| JWT token expired         | Clear browser cookies and login again                |

---

## 📦 Next Steps

- [ ] Implement payment gateway (Stripe)
- [ ] Migrate user images to cloud storage (AWS S3)
- [ ] Add email notifications
- [ ] Write unit and integration tests
- [ ] Deploy to production (Heroku/Railway/Vercel)

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Happy traveling with tripBuddy! 🌍✈️**
