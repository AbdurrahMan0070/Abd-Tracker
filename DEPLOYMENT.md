# 🚀 Deployment Guide

## Deploy to Render (Free)

### 1. Create PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Settings:
   - Name: `abd-tracker-db`
   - Database: `abdtracker`
   - Region: Choose closest to you
   - Plan: **Free**
4. Click **Create Database**
5. **Copy the Internal Database URL** (you'll need this)

---

### 2. Deploy Backend API
1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Settings:
   - Name: `abd-tracker-api`
   - Region: Same as database
   - Branch: `main`
   - Build Command: 
     ```
     npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - Start Command: 
     ```
     npm start
     ```
   - Plan: **Free**

4. **Environment Variables** (click Advanced):
   ```
   DATABASE_URL = <paste your Internal Database URL>
   JWT_SECRET = abdtracker_super_secret_jwt_key_2024
   TEACHER_CODE = TEACH2024
   ADMIN_CODE = ADMIN2024
   NODE_ENV = production
   ```

5. Click **Create Web Service**
6. Wait 3-5 minutes for deployment

---

### 3. Seed the Database
After backend is deployed:
1. Copy your backend URL (e.g., `https://abd-tracker-api.onrender.com`)
2. Visit in browser: `https://YOUR-BACKEND-URL.onrender.com/api/seed`
3. You should see: `"success": true`

---

### 4. Deploy Frontend
1. Click **New +** → **Static Site**
2. Connect same GitHub repository
3. Settings:
   - Name: `abd-tracker-frontend`
   - Branch: `main`
   - Root Directory: `client`
   - Build Command: 
     ```
     npm install && npm run build
     ```
   - Publish Directory: `dist`

4. **Environment Variable**:
   ```
   VITE_API_URL = https://YOUR-BACKEND-URL.onrender.com/api
   ```
   *(Replace with your actual backend URL, must end with `/api`)*

5. Click **Create Static Site**
6. Wait 2-3 minutes

---

## ✅ Done!

Your app is live! Share your frontend URL with friends.

### 🔑 Test Accounts
- **Admin**: Phone `9999999999`, Password `admin123`
- **Teacher**: Phone `8888888888`, Password `teacher123`

---

## 📝 Important Notes

- **Free Tier**: Services sleep after 15 minutes of inactivity
- **Wake Time**: First request after sleep takes 30-60 seconds
- **Auto Deploy**: Push to GitHub → Render auto-deploys
- **Migrations**: Run automatically on each deploy

---

## 🔧 Troubleshooting

### Check Database Status
Visit: `https://YOUR-BACKEND-URL.onrender.com/api/health/db`

Should show: `"status": "ok"` and data counts

### Common Issues

**404 Errors**: Frontend `VITE_API_URL` is wrong or missing `/api`

**Registration Failed**: Database not seeded, visit `/api/seed`

**Build Failed**: Check logs in Render dashboard for errors

---

## 🎯 Future Updates

1. Make changes locally
2. Test them
3. Push to GitHub: `git push`
4. Render auto-deploys! ✅

For database changes:
1. Run `npm run db:migrate` locally
2. Push to GitHub
3. Migrations run automatically on Render
