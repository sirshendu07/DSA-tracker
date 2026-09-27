# 🚀 LeetPulse — Next-Level FAANG DSA Problem Tracker & Analytics Hub

Full-stack DSA tracker with 500 curated problems, daily 5-problem target (with weekends off), revision radar, email OTP authentication via Gmail SMTP, and real-time analytics.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, Mongoose, Nodemailer, JWT, Bcrypt
- **Database**: MongoDB Atlas (`dsa_tracker`)
- **Email**: Gmail SMTP (`smtp.gmail.com:465`)

---

## 📁 Project Structure

```
dsa-tracker/
├── backend/
│   ├── models/           # Problem, User, UserProblem, DailyLog
│   ├── routes/           # authRoutes, problemRoutes, analyticsRoutes
│   ├── services/         # emailService (Gmail SMTP)
│   ├── middleware/       # JWT auth
│   ├── problems_seed.json# 500 Curated FAANG problems (1 to 500)
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, StatsCards, AnalyticsSection, ProblemTable, AuthModal, etc.
│   │   ├── config.js     # API_BASE URL config
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json       # SPA rewrites for Vercel
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```




   - Value: Your Render backend URL (e.g. `https://leetpulse-backend.onrender.com` without trailing slash).
5. Click **Deploy**!
