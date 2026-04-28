import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BookOpen, ClipboardList, Calendar, Bell, TrendingUp, MapPin, Clock } from 'lucide-react';
import AttendanceCard from '../components/AttendanceCard';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/attendance/me'),
      api.get('/assignments/me'),
      api.get('/notifications/me'),
      api.get('/events'),
    ]).then(([att, asgn, notif, evts]) => {
      setAttendance(att.data);
      setAssignments(asgn.data.slice(0, 3));
      setNotifications(notif.data.filter((n) => !n.read).slice(0, 5));
      const now = new Date();
      setEvents(evts.data.filter((e) => new Date(e.eventDate) >= now).slice(0, 3));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading dashboard...</p></div>;

  const overall = attendance?.overall;
  const riskColor = overall?.risk === 'SAFE' ? '#22c55e' : overall?.risk === 'WARNING' ? '#f59e0b' : '#ef4444';

  const chartData = {
    datasets: [{
      data: [overall?.percent || 0, 100 - (overall?.percent || 0)],
      backgroundColor: [riskColor, '#e5e7eb'],
      borderWidth: 0,
    }],
  };

  const pending = assignments.filter((a) => a.status === 'PENDING').length;
  const overdue = assignments.filter((a) => a.status === 'OVERDUE').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="subtitle">Here's your academic overview</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: `${riskColor}20`, color: riskColor }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: riskColor }}>{overall?.percent || 0}%</div>
            <div className="stat-label">Overall Attendance</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{attendance?.subjects?.length || 0}</div>
            <div className="stat-label">Subjects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="stat-value">{pending + overdue}</div>
            <div className="stat-label">Pending Assignments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
            <Bell size={24} />
          </div>
          <div>
            <div className="stat-value">{notifications.length}</div>
            <div className="stat-label">Unread Alerts</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Overall Attendance Chart */}
        <div className="card">
          <h2 className="card-title">Overall Attendance</h2>
          <div className="chart-wrap">
            <Doughnut data={chartData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
            <div className="chart-center">
              <span style={{ color: riskColor, fontSize: '2rem', fontWeight: 700 }}>{overall?.percent || 0}%</span>
              <span className={`risk-label risk-${overall?.risk?.toLowerCase()}`}>{overall?.risk}</span>
            </div>
          </div>
          {overall && (
            <div className="prediction-summary">
              {overall.risk !== 'DANGER' ? (
                <p>You can miss <strong>{overall.canMiss}</strong> more classes overall</p>
              ) : (
                <p className="text-danger">Attend next <strong>{overall.mustAttend}</strong> classes to reach 75%</p>
              )}
            </div>
          )}
        </div>

        {/* Risky Subjects */}
        <div className="card">
          <h2 className="card-title">⚠️ Subjects Needing Attention</h2>
          <div className="subject-list">
            {attendance?.subjects
              ?.filter((s) => s.risk !== 'SAFE')
              .slice(0, 4)
              .map((s) => (
                <div key={s.subjectId} className={`subject-row risk-row-${s.risk.toLowerCase()}`}>
                  <span className="subject-row-name">{s.subjectName}</span>
                  <span className="subject-row-percent">{s.percent}%</span>
                  <span className={`risk-pill risk-${s.risk.toLowerCase()}`}>{s.risk}</span>
                </div>
              ))}
            {!attendance?.subjects?.filter((s) => s.risk !== 'SAFE').length && (
              <p className="empty-state">🎉 All subjects are safe!</p>
            )}
          </div>
          <Link to="/attendance" className="card-link">View all subjects →</Link>
        </div>

        {/* Upcoming Assignments */}
        <div className="card">
          <h2 className="card-title">📝 Upcoming Assignments</h2>
          <div className="assignment-list">
            {assignments.map((a) => (
              <div key={a.id} className={`assignment-row status-${a.status.toLowerCase()}`}>
                <div>
                  <span className="asgn-title">{a.title}</span>
                  <span className="asgn-subject">{a.subject}</span>
                </div>
                <div className="asgn-right">
                  <span className="asgn-deadline">{new Date(a.deadline).toLocaleDateString()}</span>
                  <span className={`status-pill status-${a.status.toLowerCase()}`}>{a.status}</span>
                </div>
              </div>
            ))}
            {!assignments.length && <p className="empty-state">No assignments yet</p>}
          </div>
          <Link to="/assignments" className="card-link">View all →</Link>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="card-title">🔔 Recent Alerts</h2>
          <div className="notif-list">
            {notifications.map((n) => (
              <div key={n.id} className={`notif-row notif-${n.type}`}>
                <span>{n.message}</span>
                <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            {!notifications.length && <p className="empty-state">No new notifications</p>}
          </div>
          <Link to="/notifications" className="card-link">View all →</Link>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h2 className="card-title">📅 Upcoming Events</h2>
          <div className="event-preview-list">
            {events.map((ev) => (
              <div key={ev.id} className="event-preview-row">
                <div className="event-preview-date">
                  <span>{new Date(ev.eventDate).getDate()}</span>
                  <span>{new Date(ev.eventDate).toLocaleString('en-IN', { month: 'short' })}</span>
                </div>
                <div className="event-preview-info">
                  <span className="event-preview-title">{ev.title}</span>
                  <span className="event-preview-meta">
                    <MapPin size={11} /> {ev.venue} &nbsp;
                    <Clock size={11} /> {ev.startTime}
                  </span>
                </div>
              </div>
            ))}
            {!events.length && <p className="empty-state">No upcoming events</p>}
          </div>
          <Link to="/events" className="card-link">View all events →</Link>
        </div>
      </div>
    </div>
  );
}
