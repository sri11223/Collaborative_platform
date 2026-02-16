# 🚀 TaskFlow Deployment Guide

Complete step-by-step guide to deploy TaskFlow to production.

---

## 📋 Overview

| Component | Service | Plan | What You Get |
|-----------|---------|------|-------------|
| **Database** | Render PostgreSQL | Free | Auto-managed PostgreSQL database |
| **Backend** | Render Web Service | Free | Node.js API + Socket.IO |
| **Frontend** | Vercel | Free | Fast global CDN, auto-preview |

**Total Cost:** $0/month

---

## 🗄️ Part 1: Deploy Database + Backend (Render)

Render Blueprint auto-creates **both** the PostgreSQL database and backend service together.

### Step 1.1: Push Code to GitHub

```bash
# In your project root
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 1.2: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest - auto-connects your repos)

### Step 1.3: Deploy Using Blueprint

1. **In Render dashboard**, click **"New +"** → **"Blueprint"**
2. **Connect your repository:**
   - If not connected: Click "Configure account" → select your GitHub username
   - Search for `Collaborative_platform`
   - Click **"Connect"**
3. **Blueprint detected automatically:**
   - Render reads `render.yaml` from your repo
   - You'll see **2 resources** listed:
     - ✅ `taskflow-db` (PostgreSQL Database)
     - ✅ `taskflow-api` (Web Service)
4. **Give it a unique name:**
   - Change `taskflow-api` to something unique like `taskflow-api-yourname`
   - (The free plan requires globally unique names)
5. Click **"Apply"**

### Step 1.4: Set Environment Variables

While it's deploying (takes ~5 minutes first time), set the required env vars:

1. **Click on the `taskflow-api` service** (your backend)
2. Go to **"Environment"** tab on the left
3. **Add these variables** (click "+ Add Environment Variable"):

| Key | Value | Notes |
|-----|-------|-------|
| `GEMINI_API_KEY` | `your-actual-gemini-key` | **⚠️ REQUIRED** - Get from [Google AI Studio](https://aistudio.google.com/apikey) |
| `CLIENT_URL` | `http://localhost:5173` | Temporary - update after Vercel deploy |
| `JWT_SECRET` | (auto-generated) | Already set by Blueprint ✅ |
| `DATABASE_URL` | (auto-set from DB) | Already connected ✅ |

4. Click **"Save Changes"**

**⚠️ IMPORTANT:** If you don't have a Gemini API key yet:
- Go to [Google AI Studio](https://aistudio.google.com/apikey)
- Click "Create API Key"
- Copy and paste into `GEMINI_API_KEY` above

### Step 1.5: Wait for Deploy

Watch the **"Logs"** tab:
- You'll see: `npm install` → `sed` (swapping to PostgreSQL) → `prisma generate` → `prisma db push` → `npm run build`
- Database schema gets auto-created
- First deploy takes ~5 minutes
- When you see: `TaskFlow API Server Running on port 5000` → ✅ **Backend is LIVE**

### Step 1.6: Get Your Backend URL

1. At the top of your service page, you'll see your URL:
   ```
   https://taskflow-api-yourname.onrender.com
   ```
2. **Copy this URL** - you'll need it for frontend setup

### Step 1.7: Test Backend

Visit: `https://your-backend-url.onrender.com/api-docs`

You should see the Swagger API documentation. ✅

---

## 🎨 Part 2: Deploy Frontend (Vercel)

### Step 2.1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**

### Step 2.2: Import Project

1. **In Vercel dashboard**, click **"Add New..."** → **"Project"**
2. **Find your repository:**
   - You'll see a list of your GitHub repos
   - Click **"Import"** next to `Collaborative_platform`
3. **Configure Project:**
   - **Framework Preset:** Vite ✅ (auto-detected)
   - **Root Directory:** Click **"Edit"** → Type: `frontend` → Click **"Continue"**
   - **Build Command:** `npm run build` ✅ (auto-filled)
   - **Output Directory:** `dist` ✅ (auto-filled)

### Step 2.3: Set Environment Variables

**⚠️ CRITICAL STEP** - Before clicking Deploy:

1. **Click "Environment Variables"** section to expand
2. **Add these TWO variables:**

| Variable Name | Value | Example |
|---------------|-------|---------|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL.onrender.com/api` | `https://taskflow-api-yourname.onrender.com/api` |
| `VITE_WS_URL` | `https://YOUR-BACKEND-URL.onrender.com` | `https://taskflow-api-yourname.onrender.com` |

**⚠️ Replace `YOUR-BACKEND-URL`** with the actual Render URL from Step 1.6

3. Make sure **"Production"** is checked
4. Click **"Add"** for each

### Step 2.4: Deploy

1. Click **"Deploy"**
2. Watch the build logs (takes ~2 minutes)
3. When done, you'll see: 🎉 **Congratulations!**

### Step 2.5: Get Your Frontend URL

You'll see your live URL:
```
https://taskflow-xxxx.vercel.app
```

**Copy this URL** - you need to update backend CORS!

### Step 2.6: Test Frontend

1. Visit your Vercel URL
2. You should see the TaskFlow landing page
3. Click **"Sign In"**
4. Try logging in with: `demo@taskflow.com` / `demo123`

**If login fails with CORS error** → Continue to Part 3!

---

## 🔗 Part 3: Connect Frontend ↔ Backend

### Step 3.1: Update Backend CORS

Now that you have your Vercel URL, tell the backend to accept requests from it:

1. **Go back to Render dashboard**
2. **Click your `taskflow-api` service**
3. **Environment tab** → Find `CLIENT_URL`
4. **Edit the value** from `http://localhost:5173` to your **actual Vercel URL**:
   ```
   https://taskflow-xxxx.vercel.app
   ```
5. **Save Changes**
6. Wait ~30 seconds for auto-redeploy

### Step 3.2: Test Full Stack

1. **Go to your Vercel URL**
2. **Refresh the page** (Ctrl+F5 / Cmd+Shift+R)
3. **Click "Sign In"**
4. **Login with demo account:**
   - Email: `demo@taskflow.com`
   - Password: `demo123`
5. You should be logged in! ✅

**Test that everything works:**
- ✅ Create a workspace
- ✅ Create a board
- ✅ Add tasks
- ✅ Open the AI Command Center
- ✅ Try "Task Breakdown" or "Bug Reporter"

---

## 🤖 Part 4: Setup Auto-Deploy (GitHub Actions) - OPTIONAL

This makes your app auto-deploy when you push code.

### Step 4.1: Get Render Deploy Hook

1. **In Render dashboard** → Your `taskflow-api` service
2. **Settings** tab → Scroll to **"Deploy Hook"**
3. Click **"Create Deploy Hook"**
4. **Copy the URL** (looks like: `https://api.render.com/deploy/srv-xxx?key=yyy`)

### Step 4.2: Get Vercel Tokens

Open terminal in your project:

```bash
# Install Vercel CLI globally
npm i -g vercel@latest

# Login to Vercel
vercel login

# Link your project
cd frontend
vercel link

# Get your tokens (they'll be printed)
vercel env ls
```

You need these 3 values:
- `VERCEL_TOKEN` - Get from [Vercel Settings → Tokens](https://vercel.com/account/tokens) → "Create Token"
- `VERCEL_ORG_ID` - In `.vercel/project.json` after running `vercel link`
- `VERCEL_PROJECT_ID` - Also in `.vercel/project.json`

### Step 4.3: Add Secrets to GitHub

1. **Go to your GitHub repo** → **Settings** tab
2. **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Add these FOUR secrets one by one:**

| Secret Name | Value | Where to Get |
|-------------|-------|-------------|
| `RENDER_DEPLOY_HOOK_URL` | The URL from Step 4.1 | Render Settings |
| `VERCEL_TOKEN` | Your Vercel token | Vercel.com → Settings → Tokens |
| `VERCEL_ORG_ID` | From `.vercel/project.json` | After `vercel link` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` | After `vercel link` |

### Step 4.4: Test Auto-Deploy

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push origin main
```

**Go to GitHub repo → "Actions" tab**

You should see workflows running:
- ✅ **CI** - Lint, Type-check & Build
- ✅ **Deploy Backend to Render** (if you changed backend files)
- ✅ **Deploy Frontend to Vercel** (if you changed frontend files)

---

## 🔧 Troubleshooting

### Backend Won't Build on Render

**Error:** TypeScript compilation errors about missing types
- **Cause:** Build was trying to compile test files which need devDependencies
- **Fix:** Already fixed in `tsconfig.json` - excludes `src/__tests__` directory
- **Verify:** `npm run build` should succeed without test file errors

**Error:** `Invalid DATABASE_URL`
- **Fix:** Make sure the URL starts with `postgresql://` not `file:`
- **Check:** Render Environment → `DATABASE_URL` should be auto-set from database

**Error:** `GEMINI_API_KEY is required`
- **Fix:** Add it in Render Environment variables
- Get key from: https://aistudio.google.com/apikey

### Frontend Can't Reach Backend

**Error:** CORS / Network error
- **Fix:** Update `CLIENT_URL` in Render to match your Vercel URL
- **Check:** Both should use `https://` (no trailing slash)

**Error:** API calls go to localhost
- **Fix:** Make sure you set `VITE_API_URL` and `VITE_WS_URL` in Vercel
- **Check:** Vercel → Project Settings → Environment Variables

### AI Tools Don't Work

**Error:** "AI service unavailable"
- **Fix:** Check `GEMINI_API_KEY` is set in Render
- **Test:** Visit `https://your-backend.onrender.com/api-docs` → Try `/api/ai/chat` endpoint

### Database Empty After Deploy

- **Render auto-runs** `prisma db push` which creates tables but **doesn't seed**
- **To seed production database:**
  1. Go to Render → Shell tab
  2. Run: `npx ts-node src/seed.ts`
  3. Or: Uncomment the seed line in `render.yaml` build command

### Free Tier Limitations

**Render free tier:**
- ⏰ **Spins down after 15 min inactivity** - First request takes ~30 sec to wake
- 💾 **PostgreSQL:** 256MB storage, 97 connection limit
- 🌐 **No custom domain** on free tier

**Vercel free tier:**
- ✅ **No spin down** - instant always
- ✅ **Custom domains** supported
- 📦 **100GB bandwidth/month**

---

## 📝 Environment Variables Reference

### Backend (Render)

| Variable | Dev (Local) | Production (Render) |
|----------|-------------|---------------------|
| `DATABASE_URL` | `file:./dev.db` | Auto from PostgreSQL DB |
| `PORT` | `5000` | `5000` |
| `NODE_ENV` | `development` | `production` |
| `JWT_SECRET` | Any random string | Auto-generated UUID |
| `CLIENT_URL` | `http://localhost:5173` | Your Vercel URL |
| `GEMINI_API_KEY` | Your key | Same key |

### Frontend (Vercel)

| Variable | Dev (Local) | Production (Vercel) |
|----------|-------------|---------------------|
| `VITE_API_URL` | (not needed - uses proxy) | `https://your-backend.onrender.com/api` |
| `VITE_WS_URL` | (not needed - defaults to :5000) | `https://your-backend.onrender.com` |

---

## 🎯 Quick Checklist

Before going live, verify:

- [ ] Backend deployed and running on Render
- [ ] PostgreSQL database created automatically
- [ ] `GEMINI_API_KEY` set in Render
- [ ] Frontend deployed on Vercel
- [ ] `VITE_API_URL` and `VITE_WS_URL` set in Vercel
- [ ] `CLIENT_URL` in Render points to Vercel URL
- [ ] Login works (test with `demo@taskflow.com` / `demo123`)
- [ ] AI Command Center works (test any AI tool)
- [ ] Real-time updates work (open board in 2 tabs, edit task)
- [ ] GitHub Actions workflows configured (optional)

---

## 🚀 DNS & Custom Domain (Optional)

### For Vercel (Frontend):
1. Vercel Dashboard → Your project → Settings → Domains
2. Add your custom domain → Follow DNS instructions
3. Vercel auto-provisions SSL certificate

### For Render (Backend):
1. Upgrade to paid plan ($7/month)
2. Dashboard → Custom Domains → Add domain
3. Update `CLIENT_URL` env var

---

## 💡 Tips

**Speed up Render cold starts:**
- Use a free uptime monitor (UptimeRobot, Betterstack) to ping your backend every 10 min

**Monitor your app:**
- Render: Built-in logs and metrics
- Vercel: Analytics tab shows real-time traffic

**Database backups:**
- Render free tier: Manual only (use `pg_dump` from Shell tab)
- Paid tier: Automatic daily backups

---

## 📚 Useful Links

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Deploy:** https://www.prisma.io/docs/guides/deployment
- **GitHub Actions:** https://docs.github.com/en/actions

---

**Need Help?** Check:
1. Render logs: Dashboard → Your service → Logs tab
2. Vercel logs: Dashboard → Your project → Deployments → Click deployment → Function Logs
3. Browser console (F12) for frontend errors

---

🎉 **Your TaskFlow is now LIVE!** Share your Vercel URL with your team!
