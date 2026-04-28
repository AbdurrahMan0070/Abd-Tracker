import { useEffect, useState } from 'react';
import api from '../api/axios';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusConfig = {
  PENDING: { icon: Clock, color: '#f59e0b', label: 'Pending' },
  COMPLETED: { icon: CheckCircle, color: '#22c55e', label: 'Completed' },
  OVERDUE: { icon: AlertCircle, color: '#ef4444', label: 'Overdue' },
};

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assignments/me').then((r) => setAssignments(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const markComplete = async (id) => {
    try {
      await api.patch(`/assignments/${id}/complete`);
      setAssignments((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: 'COMPLETED', completedAt: new Date().toISOString() } : a)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'ALL' ? assignments : assignments.filter((a) => a.status === filter);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading assignments...</p></div>;

  const counts = {
    ALL: assignments.length,
    PENDING: assignments.filter((a) => a.status === 'PENDING').length,
    COMPLETED: assignments.filter((a) => a.status === 'COMPLETED').length,
    OVERDUE: assignments.filter((a) => a.status === 'OVERDUE').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📝 Assignments</h1>
        <p className="subtitle">Track and manage your assignments</p>
      </div>

      <div className="filter-tabs">
        {['ALL', 'PENDING', 'OVERDUE', 'COMPLETED'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f} <span className="tab-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="assignment-cards">
        {filtered.map((a) => {
          const cfg = statusConfig[a.status] || statusConfig.PENDING;
          const Icon = cfg.icon;
          const daysLeft = Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24));

          return (
            <div key={a.id} className={`asgn-card status-card-${a.status.toLowerCase()}`}>
              <div className="asgn-card-header">
                <div>
                  <h3 className="asgn-card-title">{a.title}</h3>
                  <span className="asgn-card-subject">{a.subject}</span>
                </div>
                <div className="asgn-status-badge" style={{ color: cfg.color, background: `${cfg.color}20` }}>
                  <Icon size={14} />
                  <span>{cfg.label}</span>
                </div>
              </div>

              {a.description && <p className="asgn-desc">{a.description}</p>}

              <div className="asgn-card-footer">
                <div className="deadline-info">
                  <span className="deadline-label">Deadline:</span>
                  <span className={`deadline-date ${daysLeft < 0 ? 'overdue' : daysLeft <= 2 ? 'urgent' : ''}`}>
                    {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {daysLeft >= 0 && <span className="days-left"> ({daysLeft}d left)</span>}
                  </span>
                </div>
                {a.status === 'PENDING' && (
                  <button className="btn-complete" onClick={() => markComplete(a.id)}>
                    ✅ Mark Complete
                  </button>
                )}
                {a.status === 'COMPLETED' && a.completedAt && (
                  <span className="completed-on">Done on {new Date(a.completedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          );
        })}
        {!filtered.length && (
          <div className="empty-page">
            <p>No {filter !== 'ALL' ? filter.toLowerCase() : ''} assignments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
