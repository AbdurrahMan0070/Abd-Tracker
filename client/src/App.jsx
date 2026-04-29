import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import TeacherRegister from './pages/TeacherRegister';
import AdminRegister from './pages/AdminRegister';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Timetable from './pages/Timetable';
import Notifications from './pages/Notifications';
import Events from './pages/Events';
import LostAndFound from './pages/LostAndFound';
import CreateLostFound from './pages/CreateLostFound';
import MyLostFoundPosts from './pages/MyLostFoundPosts';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import TeacherAssignments from './pages/teacher/TeacherAssignments';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminClasses from './pages/admin/AdminClasses';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { isLoggedIn, user } = useAuth();
  const home = isLoggedIn
    ? user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/dashboard'
    : '/login';

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={isLoggedIn ? <Navigate to={home} /> : <Login />} />
      <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/teacher-register" element={isLoggedIn ? <Navigate to="/teacher" /> : <TeacherRegister />} />
      <Route path="/admin-register" element={isLoggedIn ? <Navigate to="/admin" /> : <AdminRegister />} />

      {/* Student Routes */}
      <Route path="/dashboard"     element={<ProtectedRoute roles={['STUDENT']}><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/attendance"    element={<ProtectedRoute roles={['STUDENT']}><AppLayout><Attendance /></AppLayout></ProtectedRoute>} />
      <Route path="/assignments"   element={<ProtectedRoute roles={['STUDENT']}><AppLayout><Assignments /></AppLayout></ProtectedRoute>} />
      <Route path="/timetable"     element={<ProtectedRoute roles={['STUDENT']}><AppLayout><Timetable /></AppLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute roles={['STUDENT']}><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />

      {/* Events — accessible by all logged-in users */}
      <Route path="/events" element={<ProtectedRoute roles={['STUDENT', 'TEACHER', 'ADMIN']}><AppLayout><Events /></AppLayout></ProtectedRoute>} />

      {/* Lost & Found — accessible by all logged-in users */}
      <Route path="/lostfound" element={<ProtectedRoute roles={['STUDENT', 'TEACHER', 'ADMIN']}><AppLayout><LostAndFound /></AppLayout></ProtectedRoute>} />
      <Route path="/lostfound/create" element={<ProtectedRoute roles={['STUDENT', 'TEACHER', 'ADMIN']}><AppLayout><CreateLostFound /></AppLayout></ProtectedRoute>} />
      <Route path="/lostfound/my-posts" element={<ProtectedRoute roles={['STUDENT', 'TEACHER', 'ADMIN']}><AppLayout><MyLostFoundPosts /></AppLayout></ProtectedRoute>} />

      {/* Teacher Routes */}
      <Route path="/teacher"                   element={<ProtectedRoute roles={['TEACHER']}><AppLayout><TeacherDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/teacher/mark-attendance"   element={<ProtectedRoute roles={['TEACHER']}><AppLayout><MarkAttendance /></AppLayout></ProtectedRoute>} />
      <Route path="/teacher/assignments"       element={<ProtectedRoute roles={['TEACHER']}><AppLayout><TeacherAssignments /></AppLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin"          element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminStudents /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/classes"  element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminClasses /></AppLayout></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={home} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
