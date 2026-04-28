import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Shield } from 'lucide-react';

export default function AdminRegister() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
    collegeName: '', adminCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required');
    if (form.phone.trim().length < 10) return setError('Enter a valid 10-digit phone number');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (!form.collegeName.trim()) return setError('College name is required');
    if (!form.adminCode.trim()) return setError('Admin code is required');

    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin-register', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
        collegeName: form.collegeName.trim(),
        adminCode: form.adminCode.trim(),
      });
      login(data.user, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ color: '#dc2626' }}>
          <Shield size={40} />
          <h1>Abd Tracker</h1>
          <p>Admin Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label>Full Name *</label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="10-digit number"
            />
          </div>

          <div className="form-group">
            <label>Email (optional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              placeholder="Repeat password"
            />
          </div>

          <div className="form-group">
            <label>College Name *</label>
            <input
              value={form.collegeName}
              onChange={(e) => set('collegeName', e.target.value)}
              placeholder="e.g. Royal College"
            />
          </div>

          <div className="form-group">
            <label>Admin Code *</label>
            <input
              type="password"
              value={form.adminCode}
              onChange={(e) => set('adminCode', e.target.value)}
              placeholder="Get this from your system administrator"
            />
            <span className="field-hint">🔒 Contact your system administrator for the admin access code</span>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ background: '#dc2626' }}
          >
            {loading ? 'Registering...' : '🛡️ Register as Admin'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
