# ⚡ FIX NOW - 3 Simple Steps

## You're Getting Errors Because:
Your database has no tables (migrations didn't run)

---

## DO THESE 3 THINGS:

### 1️⃣ Update Build Command (1 min)

Go to: https://dashboard.render.com

1. Click your **backend** (API service)
2. Click **Settings**
3. Find **Build Command**
4. Change it to:
   ```
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
5. Click **Save**

---

### 2️⃣ Redeploy (3 min)

1. Click **Manual Deploy** (top right)
2. Select **"Clear build cache & deploy"**
3. Wait 3-5 minutes
4. Watch **Logs** tab - look for "Applied migration" messages

---

### 3️⃣ Seed Database (30 sec)

Open browser, go to:
```
https://YOUR-BACKEND-URL.onrender.com/api/seed
```

Replace `YOUR-BACKEND-URL` with your actual backend URL from Render.

**Example**: `https://abd-tracker-api.onrender.com/api/seed`

You'll see: `"success": true`

---

## ✅ Test It

1. Go to your frontend
2. Register as student
3. Should work! ✅

---

## 🔍 Check Status

Before and after, check:
```
https://YOUR-BACKEND-URL.onrender.com/api/health/db
```

**Before**: Will show error or empty database
**After**: Will show colleges: 1, users: 2, classes: 96

---

## 🎯 That's It!

Just 3 steps:
1. Update build command ✅
2. Redeploy ✅  
3. Visit /api/seed ✅

Your app will work! 🚀

---

## ❓ Still Broken?

Read: **TROUBLESHOOT.md** for detailed help

---

## 🔑 Test Accounts

After seeding:
- Admin: `9999999999` / `admin123`
- Teacher: `8888888888` / `teacher123`

---

**Time**: 5 minutes total
**Cost**: FREE
**Difficulty**: Easy ⭐
