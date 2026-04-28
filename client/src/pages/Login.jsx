import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { GraduationCap, User, BookOpen, Shield } from 'lucide-react';

const ROLES = [
  { key: 'student', label: 'Student', icon: User, color: '#6366f1' },
  { key: 'teacher', label: 'Teacher', icon: BookOpen, color: '#059669' },
  { key: 'admin',   label: 'Admin',   icon: Shield,  color: '#dc2626' },
];

export default function Login() {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ rollNo: '', phone: '', password: '' });
  const [loginBy, setLoginBy] = useState('rollNo'); // student only
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = (r) => {
    setRole(r);
    setError('');
    setForm({ rollNo: '', phone: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { password: form.password };

      if (role === 'student') {
        if (loginBy === 'rollNo') payload.rollNo = form.rollNo;
        else payload.phone = form.phone;
      } else {
        // teacher & admin always login by phone
        payload.phone = form.phone;
      }

      const { data } = await api.post('/auth/login', payload);

      // Prevent students from logging in as teacher/admin and vice versa
      if (role === 'student' && data.user.role !== 'STUDENT') {
        setError('This account is not a student account.');
        setLoading(false);
        return;
      }
      if (role === 'teacher' && data.user.role !== 'TEACHER') {
        setError('This account is not a teacher account.');
        setLoading(false);
        return;
      }
      if (role === 'admin' && data.user.role !== 'ADMIN') {
        setError('This account is not an admin account.');
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      if (data.user.role === 'ADMIN') navigate('/admin');
      else if (data.user.role === 'TEACHER') navigate('/teacher');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const activeRole = ROLES.find((r) => r.key === role);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <GraduationCap size={40} />
          <h1>Abd Tracker</h1>
          <p>Smart Academic & Attendance Assistant</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          {ROLES.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              className={`role-tab ${role === key ? 'active' : ''}`}
              style={role === key ? { borderColor: color, color, background: `${color}12` } : {}}
              onClick={() => handleRoleSwitch(key)}
              type="button"
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          {/* Student: toggle roll no / phone */}
          {role === 'student' && (
            <div className="login-toggle">
              <button type="button" className={loginBy === 'rollNo' ? 'active' : ''} onClick={() => setLoginBy('rollNo')}>Roll No</button>
              <button type="button" className={loginBy === 'phone' ? 'active' : ''} onClick={() => setLoginBy('phone')}>Phone</button>
            </div>
          )}

          {role === 'student' && loginBy === 'rollNo' ? (
            <div className="form-group">
              <label>Roll Number</label>
              <input
                type="text"
                placeholder="e.g. CS2024001"
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>
                {role === 'admin' ? '📱 Admin Phone Number' : role === 'teacher' ? '📱 Registered Phone' : '📱 Phone Number'}
              </label>
              <input
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                autoComplete="tel"
              />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ background: activeRole?.color }}
          >
            {loading ? 'Logging in...' : `Login as ${activeRole?.label}`}
          </button>
        </form>

        {role === 'student' && (
          <p className="auth-footer">
            New student? <Link to="/register">Register here</Link>
          </p>
        )}
        {role === 'teacher' && (
          <p className="auth-footer">
            New teacher? <Link to="/teacher-register">Register here</Link>
          </p>
        )}
        {role === 'admin' && (
          <p className="auth-footer">
            New admin? <Link to="/admin-register">Register here</Link>
          </p>
        )}
      </div>
    </div>
  );
}
