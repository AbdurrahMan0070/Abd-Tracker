import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, BookOpen, ClipboardList, Calendar } from 'lucide-react';

const typeConfig = {
  attendance: { icon: BookOpen, color: '#ef4444', bg: '#fef2f2' },
  assignment: { icon: ClipboardList, color: '#f59e0b', bg: '#fffbeb' },
  timetable: { icon: Calendar, color: '#3b82f6', bg: '#eff6ff' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/me').then((r) => setNotifications(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading notifications...</p></div>;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🔔 Notifications</h1>
          <p className="subtitle">{unread} unread alert{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button className="btn-secondary" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      <div className="notif-page-list">
        {notifications.map((n) => {
          const cfg = typeConfig[n.type] || typeConfig.attendance;
          const Icon = cfg.icon;
          return (
            <div
              key={n.id}
              className={`notif-page-item ${!n.read ? 'unread' : ''}`}
              style={{ background: !n.read ? cfg.bg : '#fff' }}
              onClick={() => !n.read && markRead(n.id)}
            >
              <div className="notif-icon" style={{ color: cfg.color, background: `${cfg.color}20` }}>
                <Icon size={18} />
              </div>
              <div className="notif-content">
                <p>{n.message}</p>
                <span className="notif-date">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              {!n.read && <div className="unread-dot" style={{ background: cfg.color }} />}
            </div>
          );
        })}
        {!notifications.length && (
          <div className="empty-page">
            <Bell size={48} color="#d1d5db" />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
