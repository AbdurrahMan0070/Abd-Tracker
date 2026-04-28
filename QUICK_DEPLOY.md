# 🚀 SUPER QUICK DEPLOY GUIDE

## When You're Done Eating, Do This:

### 1️⃣ Create Accounts (2 minutes)
- Open https://neon.tech → Sign up with GitHub
- Open https://vercel.com → Sign up with GitHub

### 2️⃣ Create Database (1 minute)
1. In Neon, click "Create Project"
2. Name it "abd-tracker"
3. **COPY THE CONNECTION STRING** (starts with `postgresql://`)

### 3️⃣ Push to GitHub (2 minutes)
```bash
git init
git add .
git commit -m "Initial commit"
```
Then create a new repo on GitHub and push:
```bash
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

### 4️⃣ Deploy Backend (2 minutes)
1. In Vercel → "Add New" → "Project"
2. Select your GitHub repo
3. **Root Directory**: Leave empty (root)
4. Click "Environment Variables" → Add these:
   ```
   DATABASE_URL = (paste your Neon connection string)
   JWT_SECRET = abdtracker_super_secret_jwt_key_2024
   TEACHER_CODE = TEACH2024
   ADMIN_CODE = ADMIN2024
   ```
5. Click "Deploy"
6. **COPY THE URL** (e.g., `https://your-app.vercel.app`)

### 5️⃣ Run Database Setup
In your terminal:
```bash
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
DATABASE_URL="your-neon-connection-string" npm run db:seed
```

### 6️⃣ Deploy Frontend (2 minutes)
1. In Vercel → "Add New" → "Project"
2. Select the SAME GitHub repo
3. **Root Directory**: `client`
4. **Framework**: Vite
5. Click "Environment Variables" → Add:
   ```
   VITE_API_URL = (your backend URL from step 4)/api
   ```
   Example: `https://your-backend.vercel.app/api`
6. Click "Deploy"

### 7️⃣ DONE! 🎉
Your frontend URL is your live app! Share it with friends!

---

## Need Help?
Check DEPLOYMENT.md for detailed instructions.
