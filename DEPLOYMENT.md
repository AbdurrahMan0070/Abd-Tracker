# 🚀 Deployment Guide - Abd Tracker

## Quick Deploy (5 minutes)

### Step 1: Create Neon Database (Free PostgreSQL)
1. Go to https://neon.tech
2. Sign up with GitHub
3. Click "Create Project"
4. Copy the connection string (looks like: `postgresql://user:pass@host/db`)

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 3: Deploy Backend to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. **Root Directory**: Leave as `.` (root)
6. **Framework Preset**: Other
7. **Build Command**: `npm install && npx prisma generate`
8. **Output Directory**: Leave empty
9. Click "Environment Variables" and add:
   - `DATABASE_URL` = Your Neon connection string
   - `JWT_SECRET` = `abdtracker_super_secret_jwt_key_2024`
   - `PORT` = `5000`
   - `TEACHER_CODE` = `TEACH2024`
   - `ADMIN_CODE` = `ADMIN2024`
10. Click "Deploy"
11. After deployment, copy the URL (e.g., `https://your-app.vercel.app`)

### Step 4: Run Database Migration
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Environment Variables"
3. Go to "Deployments" tab
4. Click on latest deployment → "..." → "Redeploy"
5. Or run locally:
```bash
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
DATABASE_URL="your-neon-connection-string" npm run db:seed
```

### Step 5: Deploy Frontend to Vercel
1. In Vercel, click "Add New" → "Project"
2. Import the SAME GitHub repository
3. **Root Directory**: `client`
4. **Framework Preset**: Vite
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Click "Environment Variables" and add:
   - `VITE_API_URL` = Your backend URL from Step 3
8. Click "Deploy"

### Step 6: Update Frontend API URL
1. Open `client/src/api/axios.js`
2. Change `baseURL` to your backend URL:
```javascript
baseURL: 'https://your-backend.vercel.app/api'
```
3. Commit and push:
```bash
git add .
git commit -m "Update API URL"
git push
```

## 🎉 Done!

Your app is now live at:
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://your-backend.vercel.app`

Share the frontend URL with your friends!

## Test Accounts
- **Admin**: Phone: `9999999999`, Password: `admin123`
- **Teacher**: Phone: `8888888888`, Password: `teacher123`

## Troubleshooting

### Database Connection Error
- Make sure DATABASE_URL in Vercel matches your Neon connection string
- Run migrations: `npx prisma migrate deploy`

### Frontend Can't Connect to Backend
- Check VITE_API_URL in frontend Vercel settings
- Make sure backend URL is correct in `client/src/api/axios.js`

### CORS Error
- Backend already has CORS enabled, but if issues persist, check `src/index.js`
