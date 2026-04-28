import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, ClipboardList } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/classes').then((r) => setClasses(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="subtitle">Welcome, {user?.name}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}><Users size={24} /></div>
          <div><div className="stat-value">{classes.length}</div><div className="stat-label">Classes</div></div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Your Classes</h2>
        <div className="class-list">
          {classes.map((cls) => (
            <div key={cls.id} className="class-row">
              <div>
                <strong>{cls.college?.name}</strong>
                <span className="class-meta">
                  {cls.studentType === 'JUNIOR'
                    ? `${cls.juniorStd?.replace('STD_', '')}th | ${cls.juniorStream}`
                    : `${cls.degreeYear} | ${cls.degreeStream} | ${cls.semester}`}
                  {' '}| Div {cls.division}
                </span>
              </div>
              <div className="class-actions">
                <Link to={`/teacher/mark-attendance?classId=${cls.id}`} className="btn-sm btn-primary">
                  <BookOpen size={14} /> Mark Attendance
                </Link>
                <Link to={`/teacher/assignments?classId=${cls.id}`} className="btn-sm btn-secondary">
                  <ClipboardList size={14} /> Assignments
                </Link>
              </div>
            </div>
          ))}
          {!classes.length && <p className="empty-state">No classes assigned yet</p>}
        </div>
      </div>
    </div>
  );
}
