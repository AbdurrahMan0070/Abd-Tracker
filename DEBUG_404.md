# 🔍 DEBUG 404 ERROR

## Good News
Your database is working! ✅
- Migrations ran successfully
- Database has 1 college, 2 users, 36 classes

## The Problem
You're getting 404 when registering, which means either:
1. Frontend is calling the wrong backend URL
2. The specific class you're trying to register for doesn't exist

---

## 🎯 SOLUTION

### Option 1: Check Frontend Environment Variable (Most Likely Issue)

Your frontend needs to know where your backend is!

1. Go to Render dashboard
2. Click your **FRONTEND** (static site, not the API)
3. Click **"Environment"** tab
4. Look for `VITE_API_URL`

**It should be**: `https://YOUR-BACKEND-URL.onrender.com/api`

**Example**: `https://abd-tracker-api.onrender.com/api`

**IMPORTANT**: 
- Must end with `/api`
- Must be your Render backend URL (not localhost!)
- Must be HTTPS

If it's wrong or missing:
1. Add/Edit `VITE_API_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
2. Click Save
3. Redeploy frontend

---

### Option 2: Reseed Database (Classes Missing)

Your database only has 36 classes but should have 96. Let's reseed:

1. Go to your backend URL: `https://YOUR-BACKEND.onrender.com/api/seed`
2. It will say "already seeded" - that's okay
3. Let me create a force-reseed endpoint for you

Actually, let me check what classes exist. Visit:
```
https://YOUR-BACKEND.onrender.com/api/health/db
```

If it shows `classes: 36` instead of `classes: 96`, some classes are missing.

---

### Option 3: Try Different Class Combination

The class you selected might not exist. Try registering with:
- **Type**: DEGREE
- **Year**: FY
- **Stream**: CS
- **Semester**: SEM1
- **Division**: A

This combination should definitely exist.

---

## 🔧 Quick Test

### Test 1: Check if backend is reachable from frontend

Open browser console (F12) on your frontend, then type:
```javascript
fetch('https://YOUR-BACKEND-URL.onrender.com/api/health/db')
  .then(r => r.json())
  .then(console.log)
```

If you get CORS error or network error, your frontend can't reach your backend!

### Test 2: Check what URL frontend is using

On your frontend registration page, open browser console (F12), then try to register. Look at the Network tab. What URL is it calling?

Should be: `https://YOUR-BACKEND.onrender.com/api/auth/register`

If it's calling `http://localhost:5000/api/auth/register`, your frontend environment variable is wrong!

---

## 🎯 Most Common Causes

### 1. Frontend Environment Variable Wrong (90% of cases)
**Fix**: Set `VITE_API_URL` in frontend environment on Render

### 2. CORS Issue
**Fix**: Backend needs to allow your frontend domain

### 3. Class Doesn't Exist
**Fix**: Try FY CS SEM1 Division A (guaranteed to exist)

### 4. Frontend Not Redeployed
**Fix**: After changing environment variables, redeploy frontend

---

## 📞 Tell Me This Info

To help you better, tell me:

1. **What's your backend URL?** (from Render dashboard)
2. **What's your frontend URL?** (from Render dashboard)
3. **Open browser console (F12) on frontend, try to register, what URL does it call?**
4. **What exact error message do you see in the console?**

---

## ✅ Quick Fix Steps

1. Go to Render → Frontend → Environment
2. Set: `VITE_API_URL` = `https://YOUR-BACKEND.onrender.com/api`
3. Save
4. Redeploy frontend
5. Wait 2 minutes
6. Try registration again

This should fix it! 🎉

---

## 🚨 If Still Broken

The issue is 100% that your frontend can't find your backend. Check:
- Frontend environment variable
- Backend URL is correct
- Both are on Render (not one on localhost)
- VITE_API_URL ends with `/api`
