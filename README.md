# 🏋️ GymSync — Social Fitness Platform

A full-stack web application that helps users track gym sessions, log workouts, analyze gym crowd density, and interact socially with other fitness enthusiasts.

Built with a scalable architecture and production-ready practices.

---

## 🚀 Features

### 🔐 Authentication
- User Registration & Login
- JWT Authentication (Access + Refresh Tokens)
- Secure httpOnly cookie handling
- Protected routes & role-based access

---

### 🏋️ Workout System
- Create workout sessions (e.g., Chest & Triceps)
- Add multiple exercises per session
- Edit sets, reps, and weights
- Delete or update workouts
- View workout history

---

### 📊 Dashboard Analytics
- Gym crowd density (30-min windows)
- Peak hour detection
- Best time prediction
- Weekly activity summary
- Previous workout display

---

### 📅 Gym Sessions
- Track gym visits (start time + duration)
- Overlapping user detection
- Peak-hour analysis
- Density calculation based on real data

---

### 👥 Social Features (Profile)
- Like workout sessions ❤️
- Comment on workouts 💬
- View workout feed in profile
- Clean separation between training & social

---

### 📈 Progress Tracking
- Exercise-based progress (e.g., Bench Press growth)
- Historical workout insights
- Ready for analytics expansion

---

## 🧠 Tech Stack

### Frontend
- React (Vite)
- React Router
- Context API
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

### Tools
- Postman
- GitHub
- Render (deployment ready)

---

## 📁 Project Structure


backend/
controllers/
services/
models/
routes/
middleware/
utils/

frontend/
src/
features/
auth/
session/
dashboard/
workout/
profile/
app/
layout/
services/


---

## 🗄️ Core Data Models

### Workout Session

{
  "title": "Chest & Triceps",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 4,
      "reps": 10,
      "weight": 60
    }
  ],
  "likes": [],
  "comments": [],
  "createdBy": "userId"
}
Gym Session
{
  "startTime": "2026-03-12T16:00:00Z",
  "duration": 90,
  "createdBy": "userId"
}
🔌 API Endpoints
Auth

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

Sessions

POST /api/sessions

GET /api/sessions

DELETE /api/sessions/:id

GET /api/sessions/density

GET /api/sessions/peak-hours

GET /api/sessions/best-time

Workouts

POST /api/workouts

GET /api/workouts

PUT /api/workouts/:id

DELETE /api/workouts/:id

POST /api/workouts/:id/like

POST /api/workouts/:id/comment

GET /api/workouts/latest

⚙️ Setup Instructions
1️⃣ Clone Repo
git clone https://github.com/your-username/gymsync.git
cd gymsync
2️⃣ Backend Setup
cd backend
npm install
npm run dev
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
🔑 Environment Variables
Backend .env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
CLIENT_URL=http://localhost:5173
🧪 Example API Request
Create Workout
POST /api/workouts

{
  "title": "Back & Biceps",
  "exercises": [
    {
      "name": "Lat Pulldown",
      "sets": 4,
      "reps": 12,
      "weight": 60
    }
  ]
}
🎯 Key Highlights

Clean layered architecture (Controller → Service → Model)

Real-world feature design (Workout Templates & Sessions)

Social + Analytics combined in one platform

Scalable and modular frontend structure

Production-ready authentication system

📦 Deployment

Backend: Render / Railway

Frontend: Vercel / Netlify

📌 Future Scope

Real-time chat (Socket.io)

Workout streak tracking

Advanced analytics & AI predictions

Followers & social feed

Push notifications

👨‍💻 Author

Balavardhan

⭐ Final Note

GymSync is designed as a complete full-stack system combining:

fitness tracking

social interaction

data analytics

making it a strong project for placements and real-world applications.
