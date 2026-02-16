# 🚀 Deployment Quick Reference

**TL;DR:** 3 services, all free, 5 minutes total

---

## 1️⃣ Backend + Database (Render)

**One-click deploy via Blueprint:**

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Go to Render:** https://render.com → Sign up with GitHub

3. **New → Blueprint** → Select `Collaborative_platform` repo

4. **Render auto-creates:**
   - ✅ PostgreSQL database
   - ✅ Node.js backend service

5. **Set ONE env var** in backend service → Environment:
   - `GEMINI_API_KEY` = Get from https://aistudio.google.com/apikey
   - (All others auto-configured)

6. **Copy backend URL:** `https://taskflow-api-xxxx.onrender.com`

---

## 2️⃣ Frontend (Vercel)

1. **Go to Vercel:** https://vercel.com → Sign up with GitHub

2. **Import Project** → Select `Collaborative_platform`

3. **Configure:**
   - Root Directory: `frontend`
   - Framework: Vite (auto-detected)

4. **Set TWO env vars** before deploying:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - `VITE_WS_URL` = `https://your-backend.onrender.com`

5. **Deploy** → Copy frontend URL: `https://taskflow-xxxx.vercel.app`

---

## 3️⃣ Connect Them

1. **Back to Render** → Your backend service → Environment

2. **Update `CLIENT_URL`** to your Vercel URL:
   ```
   https://taskflow-xxxx.vercel.app
   ```

3. **Save** → Auto-redeploys (30 sec)

---

## ✅ Test

Visit your Vercel URL → Login:
- Email: `demo@taskflow.com`
- Password: `demo123`

---

## 🔑 Environment Variables Cheat Sheet

### Render (Backend)
```
GEMINI_API_KEY = [from Google AI Studio]
CLIENT_URL = https://taskflow-xxxx.vercel.app
DATABASE_URL = [auto from database]
JWT_SECRET = [auto-generated]
```

### Vercel (Frontend)
```
VITE_API_URL = https://taskflow-api-xxxx.onrender.com/api
VITE_WS_URL = https://taskflow-api-xxxx.onrender.com
```

---

## 🆘 Common Issues

**Login fails / CORS error:**
- Check `CLIENT_URL` in Render matches your Vercel URL exactly

**AI tools don't work:**
- Check `GEMINI_API_KEY` is set in Render
- Get key: https://aistudio.google.com/apikey

**Backend slow on first request:**
- Free tier spins down after 15 min → ~30sec cold start
- Use https://uptimerobot.com to ping every 10 min (keeps it warm)

---

**Full guide with screenshots:** [DEPLOYMENT.md](./DEPLOYMENT.md)
