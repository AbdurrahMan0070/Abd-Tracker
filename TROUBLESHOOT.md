# 🔧 TROUBLESHOOTING - Fix Registration Errors

## Your Errors
- Student registration: 404 error
- Teacher registration: "Registration failed"
- Admin registration: "Registration failed"

---

## 🎯 Root Cause
Your database doesn't have the tables yet because migrations haven't run.

---

## ✅ COMPLETE FIX (Follow in Order)

### Step 1: Check Database Status (30 seconds)

Open your browser and go to:
```
https://YOUR-BACKEND.onrender.com/api/health/db
```

**Example**: `https://abd-tracker-api.onrender.com/api/health/db`

You'll see one of these:

#### ❌ If you see an error:
```json
{
  "status": "error",
  "hint": "Migrations may not have run"
}
```
**This means**: Migrations didn't run. Continue to Step 2.

#### ⚠️ If you see empty database:
```json
{
  "status": "ok",
  "data": { "colleges": 0, "users": 0 }
}
```
**This means**: Migrations ran but database is empty. Skip to Step 4.

#### ✅ If you see data:
```json
{
  "status": "ok",
  "data": { "colleges": 1, "users": 2 }
}
```
**This means**: Everything is ready! Your issue is something else (see bottom).

---

### Step 2: Update Build Command on Render (1 minute)

1. Go to https://dashboard.render.com
2. Click your **backend service** (the API one)
3. Click **"Settings"** (left sidebar)
4. Scroll to **"Build & Deploy"** section
5. Find **"Build Command"**
6. Click **"Edit"**
7. Make sure it says EXACTLY this:
   ```
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
8. If it's different, change it and click **"Save Changes"**

---

### Step 3: Redeploy with Clean Cache (3 minutes)

1. Still in Settings, scroll to top
2. Click **"Manual Deploy"** button (top right)
3. Select **"Clear build cache & deploy"**
4. Click **"Deploy"**
5. Wait 3-5 minutes

**While waiting**, click **"Logs"** tab and watch for:
- ✅ `Generated Prisma Client`
- ✅ `Running migrate deploy...`
- ✅ `Applied migration: 20260428172503_init`
- ✅ `Applied migration: 20260429000000_add_lost_found`

If you see all these ✅, migrations worked!

---

### Step 4: Seed the Database (30 seconds)

After deployment completes, open browser and go to:
```
https://YOUR-BACKEND.onrender.com/api/seed
```

You should see:
```json
{
  "success": true,
  "message": "🎉 Database seeded successfully!"
}
```

---

### Step 5: Verify Everything Works (1 minute)

Check database status again:
```
https://YOUR-BACKEND.onrender.com/api/health/db
```

Should show:
```json
{
  "status": "ok",
  "data": {
    "colleges": 1,
    "users": 2,
    "classes": 96
  },
  "message": "✅ Database is ready!"
}
```

---

### Step 6: Test Registration (1 minute)

1. Go to your frontend URL
2. Try registering as a student
3. Should work now! ✅

---

## 🐛 Still Having Issues?

### Issue: "Cannot GET /api/seed"
**Cause**: New code not deployed yet
**Fix**: 
1. Make sure you pushed latest code to GitHub
2. Redeploy on Render (Step 3)
3. Wait for deployment to complete

### Issue: "Cannot GET /api/health/db"
**Cause**: New code not deployed yet
**Fix**: Same as above

### Issue: Still getting 404 on registration
**Cause**: Frontend is pointing to wrong backend URL
**Fix**:
1. Go to Render dashboard
2. Click your **frontend** (static site)
3. Click **"Environment"** tab
4. Check `VITE_API_URL` is correct
5. Should be: `https://YOUR-BACKEND.onrender.com/api`
6. If wrong, fix it and redeploy frontend

### Issue: "Invalid teacher code" or "Invalid admin code"
**Cause**: Environment variables not set
**Fix**:
1. Go to Render dashboard
2. Click your **backend**
3. Click **"Environment"** tab
4. Add these variables:
   - `TEACHER_CODE` = `TEACH2024`
   - `ADMIN_CODE` = `ADMIN2024`
5. Save and redeploy

### Issue: Migrations ran but still errors
**Cause**: Database might be in bad state
**Fix**:
1. Check the exact error message
2. Look at backend logs in Render
3. The error will tell you what's wrong

---

## 📋 Quick Checklist

Do these in order:
- [ ] Check `/api/health/db` - See database status
- [ ] Update build command if needed
- [ ] Redeploy with clear cache
- [ ] Watch logs for migration messages
- [ ] Visit `/api/seed` to seed database
- [ ] Check `/api/health/db` again - Should show data
- [ ] Test student registration
- [ ] Test teacher registration (code: TEACH2024)
- [ ] Test admin registration (code: ADMIN2024)

---

## 🎯 Expected Results

After completing all steps:

✅ `/api/health/db` shows database is ready
✅ Student registration works
✅ Teacher registration works (with code TEACH2024)
✅ Admin registration works (with code ADMIN2024)
✅ Can login with test accounts:
   - Admin: 9999999999 / admin123
   - Teacher: 8888888888 / teacher123

---

## 💡 Understanding the Errors

### 404 Error
- Means: Route not found OR database table doesn't exist
- Usually: Migrations didn't run

### "Registration failed"
- Means: Backend error during registration
- Usually: Database not seeded OR environment variables missing

### "Invalid credentials"
- Means: Wrong phone/password OR user doesn't exist
- Usually: Database not seeded yet

---

## 🚀 After Everything Works

Your app will be fully functional:
- ✅ All registrations work
- ✅ Login works
- ✅ Lost & Found works
- ✅ All features enabled

Share your frontend URL with friends! 🎊

---

**Need more help?** Check the backend logs in Render for specific error messages.
