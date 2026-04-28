import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Users, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const riskChart = {
    labels: ['Safe (≥80%)', 'Warning (75-80%)', 'Danger (<75%)'],
    datasets: [{
      data: [stats?.riskDistribution?.safe || 0, stats?.riskDistribution?.warning || 0, stats?.riskDistribution?.danger || 0],
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏫 Admin Dashboard</h1>
        <p className="subtitle">Platform overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}><Users size={24} /></div>
          <div><div className="stat-value">{stats?.totalStudents}</div><div className="stat-label">Total Students</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}><GraduationCap size={24} /></div>
          <div><div className="stat-value">{stats?.totalTeachers}</div><div className="stat-label">Teachers</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#22c55e20', color: '#22c55e' }}><TrendingUp size={24} /></div>
          <div><div className="stat-value">{stats?.avgAttendance}%</div><div className="stat-label">Avg Attendance</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ef444420', color: '#ef4444' }}><AlertTriangle size={24} /></div>
          <div><div className="stat-value">{stats?.riskDistribution?.danger}</div><div className="stat-label">At Risk Students</div></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Risk Distribution</h2>
          <div className="chart-wrap">
            <Doughnut data={riskChart} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/admin/students" className="quick-action-btn">
              <Users size={20} /> View All Students
            </Link>
            <Link to="/admin/classes" className="quick-action-btn">
              <GraduationCap size={20} /> Manage Classes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
