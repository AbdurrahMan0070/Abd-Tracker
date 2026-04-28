import { useEffect, useState } from 'react';
import api from '../api/axios';
import AttendanceCard from '../components/AttendanceCard';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Attendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simResults, setSimResults] = useState({});

  useEffect(() => {
    api.get('/attendance/me').then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSimulate = async (subjectId, action) => {
    try {
      const { data: result } = await api.get(`/attendance/simulate/${subjectId}?action=${action}`);
      setSimResults((prev) => ({ ...prev, [subjectId]: result }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading attendance...</p></div>;

  const subjects = data?.subjects || [];
  const overall = data?.overall;

  const chartData = {
    labels: subjects.map((s) => s.subjectName),
    datasets: [
      {
        label: 'Attendance %',
        data: subjects.map((s) => s.percent),
        backgroundColor: subjects.map((s) =>
          s.risk === 'SAFE' ? '#22c55e80' : s.risk === 'WARNING' ? '#f59e0b80' : '#ef444480'
        ),
        borderColor: subjects.map((s) =>
          s.risk === 'SAFE' ? '#22c55e' : s.risk === 'WARNING' ? '#f59e0b' : '#ef4444'
        ),
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: '75% Minimum',
        data: subjects.map(() => 75),
        backgroundColor: 'transparent',
        borderColor: '#6366f1',
        borderWidth: 2,
        borderDash: [5, 5],
        type: 'line',
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Attendance Tracker</h1>
        <p className="subtitle">Subject-wise breakdown with predictions</p>
      </div>

      {/* Overall Summary */}
      {overall && (
        <div className={`overall-banner risk-banner-${overall.risk.toLowerCase()}`}>
          <div>
            <span className="overall-percent">{overall.percent}%</span>
            <span className="overall-label">Overall Attendance</span>
          </div>
          <div className="overall-stats">
            <span>{overall.attended} attended / {overall.total} total</span>
            {overall.risk !== 'DANGER' ? (
              <span>Can miss <strong>{overall.canMiss}</strong> more classes</span>
            ) : (
              <span className="text-danger">Need <strong>{overall.mustAttend}</strong> more classes to reach 75%</span>
            )}
          </div>
        </div>
      )}

      {/* Bar Chart */}
      {subjects.length > 0 && (
        <div className="card chart-card">
          <h2 className="card-title">Subject-wise Attendance</h2>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: {
                y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } },
              },
            }}
          />
        </div>
      )}

      {/* Subject Cards */}
      <div className="cards-grid">
        {subjects.map((s) => {
          const sim = simResults[s.subjectId];
          return (
            <AttendanceCard
              key={s.subjectId}
              subject={s.subjectName}
              attended={sim ? sim.attended : s.attended}
              total={sim ? sim.total : s.total}
              percent={sim ? sim.newPercent : s.percent}
              risk={s.risk}
              canMiss={s.canMiss}
              mustAttend={s.mustAttend}
              simulation={s.simulation}
              onSimulate={(action) => handleSimulate(s.subjectId, action)}
            />
          );
        })}
        {!subjects.length && (
          <div className="empty-page">
            <p>No attendance records yet. Your teacher will mark attendance soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
