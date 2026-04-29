# ⚡ QUICK FIX - DO THIS NOW!

## 🎯 Your Problem
Getting 404 errors when registering students because database migrations didn't run.

## ✅ THE FIX (Follow These Steps)

### 1️⃣ Open Render Dashboard
Go to: https://dashboard.render.com

### 2️⃣ Click Your Backend Service
Look for: **abd-tracker-api** (or whatever you named it)

### 3️⃣ Go to Settings
Click **"Settings"** in the left sidebar

### 4️⃣ Update Build Command
1. Scroll down to **"Build & Deploy"**
2. Find **"Build Command"**
3. Click **"Edit"**
4. Copy and paste this:
   ```
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
5. Click **"Save Changes"**

### 5️⃣ Redeploy
1. Scroll to the top
2. Click **"Manual Deploy"** button (top right)
3. Select **"Clear build cache & deploy"**
4. Click **"Deploy"**
5. ⏰ Wait 3-5 minutes

### 6️⃣ Check Logs
1. Click **"Logs"** tab
2. Look for: `✓ Applied migration: 20260429000000_add_lost_found`
3. If you see this, migrations worked! ✅

### 7️⃣ Seed Database
1. Click **"Shell"** tab
2. Type: `npm run db:seed`
3. Press Enter
4. Wait for: `✅ Seed complete!`

---

## 🎉 DONE! TEST IT NOW!

1. Go to your frontend URL
2. Click "Register as Student"
3. Fill the form
4. Should work now! No more 404! 🎊

---

## ❓ Questions?

**Q: Why didn't migrations run before?**
A: The build command was missing `npx prisma migrate deploy`

**Q: Will this delete my data?**
A: No! Migrations only add new tables/columns, never delete data.

**Q: Do I need to do this every time?**
A: No! Only this once. Future deploys will run migrations automatically.

---

## 🚨 If Still Not Working

1. Check your **DATABASE_URL** in Environment Variables
2. Make sure it's the **Internal URL** (not External)
3. Should look like: `postgresql://user:pass@dpg-xxx-a.oregon-postgres.render.com/dbname`

---

## 📞 Need Help?

Check the full guide: **FIX_RENDER_DEPLOYMENT.md**
