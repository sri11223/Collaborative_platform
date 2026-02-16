# 🌱 Seed Production Database - Easy Methods

## Problem: Shell Access Limited on Free Render Tier

Render Shell is only available for premium accounts, but you can seed the database using the **HTTP API endpoint** instead!

---

## ✅ Method 1: Seed via HTTP API (Recommended - No Shell Needed!)

### Step 1: Get Your JWT_SECRET from Render

1. Go to https://dashboard.render.com
2. Click **taskflow-api-mimm** service
3. Click **Environment** tab
4. Find `JWT_SECRET` → Click **👁️** (eye icon) to reveal
5. Copy the value (looks like: `task-flow-super-secret-jwt-key-2024-abcd1234...`)

### Step 2: Send API Request

**Using PowerShell:**
```powershell
$secret = "your-jwt-secret-here"  # Paste your JWT_SECRET
$body = @{ secret = $secret } | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "https://taskflow-api-mimm.onrender.com/api/seed" `
  -Body $body `
  -ContentType "application/json"
```

**Using cURL (if you have Git Bash):**
```bash
curl -X POST https://taskflow-api-mimm.onrender.com/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-jwt-secret-here"}'
```

**Using Postman/Insomnia:**
- Method: `POST`
- URL: `https://taskflow-api-mimm.onrender.com/api/seed`
- Headers: `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "secret": "your-jwt-secret-here"
  }
  ```

### Step 3: Verify Success

You should see a response like:
```json
{
  "success": true,
  "data": {
    "message": "Database seeded successfully",
    "stats": {
      "users": 5,
      "workspaces": 3,
      "boards": 5,
      "tasks": 4,
      "boardMembers": 11
    },
    "demoCredentials": {
      "email": "[user]@taskflow.demo",
      "password": "Demo123!",
      "availableUsers": [
        "sarah.johnson@taskflow.demo",
        "mike.chen@taskflow.demo",
        "emily.rodriguez@taskflow.demo",
        "alex.kumar@taskflow.demo",
        "lisa.martinez@taskflow.demo"
      ]
    }
  }
}
```

---

## 💡 Method 2: Seed via Render Build Hook (Automated)

You can trigger seeding automatically after each deployment:

### Update render.yaml

Add to your build command:
```yaml
services:
  - type: web
    buildCommand: |
      npm install --production=false
      sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
      npx prisma generate
      npx prisma migrate deploy
      npm run build
      # Auto-seed on first deploy only
      npx prisma db seed || true
```

⚠️ **Warning:** This runs `prisma db seed` on every deploy. The seed script clears all data first!

---

## 🔐 Method 3: Via Prisma Studio (If You Have Shell Access)

If you upgrade to paid Render tier and have Shell access:

```bash
# Open Shell from Render dashboard
npx prisma studio
```

Then manually add data via the UI at the URL shown.

---

## 📊 What Gets Seeded

- **5 Demo Users** (password: `Demo123!`)
  - sarah.johnson@taskflow.demo
  - mike.chen@taskflow.demo
  - emily.rodriguez@taskflow.demo
  - alex.kumar@taskflow.demo
  - lisa.martinez@taskflow.demo

- **3 Workspaces**
  - Acme Corporation
  - Marketing Team
  - Side Projects

- **5 Boards** with sample tasks
- **Comments, Notifications, Activity Logs**

---

## 🧪 Test After Seeding

1. Go to https://taskflow-collaborative-platform.vercel.app/login
2. Login with:
   - **Email:** `sarah.johnson@taskflow.demo`
   - **Password:** `Demo123!`
3. Explore workspaces, boards, and tasks!

---

## 🛡️ Security Notes

- The seed endpoint is protected by your `JWT_SECRET`
- Only someone with your JWT_SECRET can run it
- **Never share your JWT_SECRET publicly**
- The seed endpoint **clears all existing data** before seeding

---

## ❌ Troubleshooting

### Error: "Unauthorized: Invalid secret key"
- Double-check you copied the correct `JWT_SECRET` from Render
- Make sure there are no extra spaces or quotes

### Error: "Failed to seed database"
- Check Render logs for details: Dashboard → Service → Logs
- Make sure database migrations ran successfully

### Want to keep existing data?
- **DON'T use the seed endpoint** - it clears everything
- Instead, create users manually via the signup page

---

**🎯 TL;DR:**
1. Get `JWT_SECRET` from Render Environment tab
2. Run PowerShell command with your secret
3. Login with `sarah.johnson@taskflow.demo` / `Demo123!`
