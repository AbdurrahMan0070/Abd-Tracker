import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Bell, LogOut, LayoutDashboard, BookOpen, Calendar, ClipboardList, Users, Settings, Search } from 'lucide-react';

export default function Navbar({ notifCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'Attendance', icon: BookOpen },
    { to: '/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/timetable', label: 'Timetable', icon: Calendar },
    { to: '/events', label: 'Events', icon: Bell },
    { to: '/lostfound', label: 'Lost & Found', icon: Search },
  ];

  const teacherLinks = [
    { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/mark-attendance', label: 'Mark Attendance', icon: BookOpen },
    { to: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/events', label: 'Events', icon: Bell },
    { to: '/lostfound', label: 'Lost & Found', icon: Search },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/classes', label: 'Classes', icon: Settings },
    { to: '/lostfound', label: 'Lost & Found', icon: Search },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : user?.role === 'TEACHER' ? teacherLinks : studentLinks;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <GraduationCap size={24} />
        <span>Abd Tracker</span>
      </div>
      <div className="navbar-links">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className={`nav-link ${location.pathname === to ? 'active' : ''}`}>
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <div className="navbar-actions">
        {user?.role === 'STUDENT' && (
          <Link to="/notifications" className="notif-btn">
            <Bell size={20} />
            {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
          </Link>
        )}
        <div className="user-info">
          <span className={`role-badge role-${user?.role?.toLowerCase()}`}>{user?.role}</span>
          <span className="user-name">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
