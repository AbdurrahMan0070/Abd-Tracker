import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const riskConfig = {
  SAFE: { color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle, label: 'Safe' },
  WARNING: { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle, label: 'Warning' },
  DANGER: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: AlertCircle, label: 'Detention Risk' },
};

export default function AttendanceCard({ subject, attended, total, percent, risk, canMiss, mustAttend, simulation, onSimulate }) {
  const cfg = riskConfig[risk] || riskConfig.SAFE;
  const Icon = cfg.icon;
  const barWidth = Math.min(100, percent);

  return (
    <div className="attendance-card" style={{ borderColor: cfg.border, background: cfg.bg }}>
      <div className="card-header">
        <div>
          <h3 className="subject-name">{subject}</h3>
          <span className="attendance-fraction">{attended}/{total} classes</span>
        </div>
        <div className="risk-badge" style={{ color: cfg.color, background: `${cfg.color}20` }}>
          <Icon size={14} />
          <span>{cfg.label}</span>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${barWidth}%`, background: cfg.color }}
          />
          <div className="progress-bar-marker" style={{ left: '75%' }} title="75% minimum" />
        </div>
        <span className="percent-label" style={{ color: cfg.color }}>{percent}%</span>
      </div>

      <div className="prediction-row">
        {risk === 'SAFE' || risk === 'WARNING' ? (
          <span className="pred-info">Can miss <strong>{canMiss}</strong> more class{canMiss !== 1 ? 'es' : ''}</span>
        ) : (
          <span className="pred-info pred-danger">Attend next <strong>{mustAttend}</strong> class{mustAttend !== 1 ? 'es' : ''} to reach 75%</span>
        )}
      </div>

      {simulation && (
        <div className="simulator">
          <button
            className="sim-btn sim-attend"
            onClick={() => onSimulate?.('attend')}
          >
            ✅ Attend → {simulation.ifAttend}%
          </button>
          <button
            className="sim-btn sim-miss"
            onClick={() => onSimulate?.('miss')}
          >
            ❌ Miss → {simulation.ifMiss}%
          </button>
        </div>
      )}
    </div>
  );
}
