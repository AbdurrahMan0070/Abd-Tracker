# Abd Tracker – Smart Academic & Attendance Assistant

A full-stack college management platform with attendance tracking, prediction engine, assignments, timetable, and multi-role access.

## Tech Stack
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL
- **Frontend**: React + Vite + Chart.js
- **Auth**: JWT + bcrypt

---

## Setup

> **No PostgreSQL installation needed!** Abd Tracker uses PGlite — an embedded Postgres that runs entirely in Node.js.

### 1. Start the embedded database (Terminal 1)
```bash
npm run db
```
This starts PGlite on port 5432. Keep this terminal open.

### 2. Set up tables + seed data (Terminal 2, run once)
```bash
npm run db:push
npm run db:seed
```

### 3. Start the backend (Terminal 2)
```bash
npm run dev
```
Backend runs on **http://localhost:5000**

### 4. Start the frontend (Terminal 3)
```bash
cd client
npm run dev
```
Frontend runs on **http://localhost:3000**

---

## Default Logins (after seeding)

| Role    | Phone        | Password    |
|---------|-------------|-------------|
| Admin   | 9999999999  | admin123    |
| Teacher | 8888888888  | teacher123  |

Students register themselves at `/register`.

---

## Features

### Phase 1 – Core
- Student registration with Junior (11th/12th) and Degree (FY/SY/TY) support
- Streams: Science, Commerce, Arts (Junior) | CS, BAF, BCOM, BMS, BCA (Degree)
- 6 semesters for degree students
- Attendance dashboard with subject-wise breakdown
- **Prediction engine**: can miss X classes, must attend Y classes
- **What-if simulator**: see % if you attend/miss next class
- Risk alerts: 🔴 Danger / 🟡 Warning / 🟢 Safe

### Phase 2 – Features
- Assignment tracking with status (Pending/Completed/Overdue)
- Weekly timetable with today highlight
- Notification system

### Phase 3 – Platform
- Teacher panel: mark attendance, create assignments
- Admin panel: student search, class management, subject management
- Role-based access (Student / Teacher / Admin)
- Analytics dashboard with risk distribution chart

---

## College Structure

```
College
├── Junior
│   ├── 11th Std
│   │   ├── Science (Physics, Chemistry, Biology, Maths, English, Hindi, CS, PE, EVS)
│   │   ├── Commerce (Accounts, Economics, Business Studies, Maths, English, Hindi, IT, PE)
│   │   └── Arts (History, Geography, Pol. Science, Sociology, English, Hindi, Psychology, PE)
│   └── 12th Std (same streams)
└── Degree
    ├── FY → SEM1, SEM2
    ├── SY → SEM3, SEM4
    └── TY → SEM5, SEM6
        Streams: CS | BAF | BCOM | BMS | BCA | OTHER
```
