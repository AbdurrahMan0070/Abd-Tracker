# 🎓 Abd Tracker

> Smart Academic & Attendance Management System for Colleges

A full-stack college management platform with intelligent attendance tracking, prediction engine, assignments, timetable, and multi-role access control.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://your-app-url.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

### 📊 For Students
- **Smart Attendance Dashboard** - Real-time attendance tracking with visual analytics
- **Prediction Engine** - Know exactly how many classes you can miss or must attend
- **What-If Simulator** - See your attendance % before attending/missing a class
- **Risk Alerts** - 🔴 Danger / 🟡 Warning / 🟢 Safe status indicators
- **Assignment Tracker** - Track pending, completed, and overdue assignments
- **Interactive Timetable** - Weekly schedule with today's classes highlighted
- **Real-time Notifications** - Stay updated on attendance and assignments

### 👨‍🏫 For Teachers
- **Quick Attendance Marking** - Mark attendance for entire class in seconds
- **Assignment Management** - Create and track assignments across classes
- **Class Overview** - View student attendance statistics and risk levels
- **Bulk Actions** - Mark all present/absent with one click

### 👨‍💼 For Admins
- **Student Management** - Search, view, and manage all students
- **Class Management** - Create and organize classes by year, stream, and division
- **Subject Management** - Add subjects to classes with custom codes
- **Analytics Dashboard** - View attendance risk distribution across college
- **Multi-College Support** - Manage multiple college branches

---

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express** - RESTful API
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend
- **React** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Chart.js** - Beautiful data visualizations
- **React Router** - Client-side routing
- **Axios** - HTTP client

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+

### 1. Clone the repository
```bash
git clone https://github.com/AbdurrahMan0070/Abd-Tracker.git
cd Abd-Tracker
```

### 2. Install dependencies
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Set up environment variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
DATABASE_URL="postgresql://user:password@localhost:5432/abdtracker"
JWT_SECRET="your-secret-key"
TEACHER_CODE="TEACH2024"
ADMIN_CODE="ADMIN2024"
```

### 4. Set up database
```bash
# Run migrations
npx prisma migrate dev

# Seed initial data
npm run db:seed
```

### 5. Start the application
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

**Backend**: http://localhost:5000  
**Frontend**: http://localhost:3000

---

## 🔐 Default Login Credentials

After seeding, use these credentials to test:

| Role    | Phone      | Password   |
|---------|------------|------------|
| Admin   | 9999999999 | admin123   |
| Teacher | 8888888888 | teacher123 |

Students can register at `/register`

---

## 🏗️ Project Structure

```
Abd-Tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   └── assets/        # Images, icons
│   └── public/
├── src/                   # Express backend
│   ├── routes/           # API routes
│   └── lib/              # Prisma client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Seed data
└── README.md
```

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/teacher-register` - Teacher registration
- `POST /api/auth/admin-register` - Admin registration
- `POST /api/auth/login` - Login (all roles)

### Student
- `GET /api/attendance` - Get attendance records
- `GET /api/assignments` - Get assignments
- `GET /api/timetable` - Get weekly timetable
- `GET /api/notifications` - Get notifications
- `GET /api/events` - Get college events

### Teacher
- `GET /api/admin/classes` - Get assigned classes
- `POST /api/admin/attendance` - Mark attendance
- `POST /api/admin/assignments` - Create assignment

### Admin
- `GET /api/admin/students` - Search students
- `GET /api/admin/classes` - Manage classes
- `POST /api/admin/subjects` - Add subjects

---

## 🎓 College Structure

```
College
├── Junior (11th & 12th)
│   ├── Science
│   ├── Commerce
│   └── Arts
└── Degree (FY, SY, TY)
    ├── CS (Computer Science)
    ├── BAF (Banking & Finance)
    ├── BCOM (Commerce)
    ├── BMS (Management Studies)
    ├── BCA (Computer Applications)
    └── OTHER
```

Each class has:
- **6 Semesters** (for degree)
- **Multiple Divisions** (A, B, C, D)
- **Subject-wise attendance tracking**

---

## 🚀 Deployment

### Deploy on Render (Recommended)

See [RENDER_DEPLOY.md](RENDER_DEPLOY.md) for detailed instructions.

**Quick steps:**
1. Create PostgreSQL database on Render
2. Deploy backend as Web Service
3. Deploy frontend as Static Site
4. Seed database from local machine

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Abdurrahman**

- GitHub: [@AbdurrahMan0070](https://github.com/AbdurrahMan0070)

---

## 🙏 Acknowledgments

- Built with ❤️ for college students and administrators
- Inspired by the need for better attendance management systems
- Special thanks to all contributors

---

## 📧 Support

For support, email s.abdurrahman206@gmail.com or open an issue on GitHub.

---

<div align="center">
  <strong>⭐ Star this repo if you find it helpful!</strong>
</div>
