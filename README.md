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

---

## ☁️ Deployment Instructions

### 1. Push to GitHub
In this directory:
```bash
git init
git add .
git commit -m "Initial commit of LeetPulse FAANG DSA Tracker"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

---

### 2. Deploy Backend on Render (https://render.com)
1. Sign up/Log in to **Render** and click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `leetpulse-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. In **Environment Variables**, add:
   - `MONGO_URI` = `mongodb+srv://SANJU386:S%40nju12345@sanju.kdjrh0n.mongodb.net/dsa_tracker?appName=SANJU`
   - `JWT_SECRET` = `super_secret_jwt_key_leetpulse_faang_2026_dsa`
   - `DAILY_TARGET` = `5`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `465`
   - `SMTP_SECURE` = `true`
   - `SMTP_USER` = `sirshendubera386@gmail.com`
   - `SMTP_PASS` = `zwikcmgqxldksxlk`
   - `SENDER_NAME` = `LeetPulse Verification`
   - `SENDER_EMAIL` = `sirshendubera386@gmail.com`
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://leetpulse-backend.onrender.com`).

---

### 3. Deploy Frontend on Vercel (https://vercel.com)
1. Log in to **Vercel** and click **Add New...** $\rightarrow$ **Project**.
2. Import your GitHub repository.
3. In project configuration:
   - **Root Directory**: Click *Edit* and select **`frontend`**.
   - **Framework Preset**: *Vite* (auto-detected).
4. In **Environment Variables**, add:
   - Key: `VITE_API_URL`
   - Value: Your Render backend URL (e.g. `https://leetpulse-backend.onrender.com` without trailing slash).
5. Click **Deploy**!
