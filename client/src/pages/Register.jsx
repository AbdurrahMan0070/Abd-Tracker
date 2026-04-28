import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { GraduationCap } from 'lucide-react';

const DEGREE_STREAMS = ['CS', 'BAF', 'BCOM', 'BMS', 'BCA', 'OTHER'];
const JUNIOR_STREAMS = ['SCIENCE', 'COMMERCE', 'ARTS'];
const DIVISIONS = ['A', 'B', 'C', 'D'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    rollNo: '', name: '', phone: '', email: '', password: '', confirmPassword: '',
    collegeName: '',
    studentType: 'DEGREE',
    juniorStd: 'STD_11', juniorStream: 'SCIENCE',
    degreeYear: 'FY', degreeStream: 'CS', semester: 'SEM1',
    division: 'A',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const goToStep2 = () => {
    if (!form.rollNo.trim()) return setError('Roll number is required');
    if (!form.name.trim()) return setError('Name is required');
    if (!form.phone.trim()) return setError('Phone number is required');
    if (form.phone.trim().length < 10) return setError('Enter a valid 10-digit phone number');
    if (!form.password) return setError('Password is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setError('');
    setStep(2);
  };

  const goToStep3 = () => {
    if (!form.collegeName.trim()) return setError('College name is required');
    setError('');
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        rollNo: form.rollNo.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
        collegeName: form.collegeName.trim(),
        studentType: form.studentType,
        division: form.division,
      };

      if (form.studentType === 'JUNIOR') {
        payload.juniorStd = form.juniorStd;
        payload.juniorStream = form.juniorStream;
      } else {
        payload.degreeYear = form.degreeYear;
        payload.degreeStream = form.degreeStream;
        payload.semester = form.semester;
      }

      const { data } = await api.post('/auth/register', payload);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <GraduationCap size={36} />
          <h1>Abd Tracker</h1>
          <p>Create your student account</p>
        </div>

        <div className="step-indicator">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step ${step >= s ? 'active' : ''}`}>{s}</div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <>
              <h3 className="step-title">Personal Info</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number *</label>
                  <input
                    value={form.rollNo}
                    onChange={(e) => set('rollNo', e.target.value)}
                    placeholder="e.g. CS2024001"
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div className="form-row">
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
              </div>
              <div className="form-row">
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
              </div>
              {error && <div className="error-msg">{error}</div>}
              <button type="button" className="btn-primary" onClick={goToStep2}>Next →</button>
            </>
          )}

          {/* ── Step 2: College & Class ── */}
          {step === 2 && (
            <>
              <h3 className="step-title">College & Class</h3>
              <div className="form-group">
                <label>College Name *</label>
                <input
                  value={form.collegeName}
                  onChange={(e) => set('collegeName', e.target.value)}
                  placeholder="e.g. Royal College"
                />
              </div>

              <div className="form-group">
                <label>Student Type *</label>
                <div className="radio-group">
                  <label className={`radio-option ${form.studentType === 'JUNIOR' ? 'selected' : ''}`}>
                    <input type="radio" value="JUNIOR" checked={form.studentType === 'JUNIOR'} onChange={() => set('studentType', 'JUNIOR')} />
                    Junior (11th / 12th)
                  </label>
                  <label className={`radio-option ${form.studentType === 'DEGREE' ? 'selected' : ''}`}>
                    <input type="radio" value="DEGREE" checked={form.studentType === 'DEGREE'} onChange={() => set('studentType', 'DEGREE')} />
                    Degree (FY / SY / TY)
                  </label>
                </div>
              </div>

              {form.studentType === 'JUNIOR' ? (
                <div className="form-row">
                  <div className="form-group">
                    <label>Standard *</label>
                    <select value={form.juniorStd} onChange={(e) => set('juniorStd', e.target.value)}>
                      <option value="STD_11">11th Std</option>
                      <option value="STD_12">12th Std</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Stream *</label>
                    <select value={form.juniorStream} onChange={(e) => set('juniorStream', e.target.value)}>
                      {JUNIOR_STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Year *</label>
                      <select value={form.degreeYear} onChange={(e) => set('degreeYear', e.target.value)}>
                        <option value="FY">FY (First Year)</option>
                        <option value="SY">SY (Second Year)</option>
                        <option value="TY">TY (Third Year)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stream *</label>
                      <select value={form.degreeStream} onChange={(e) => set('degreeStream', e.target.value)}>
                        {DEGREE_STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Semester *</label>
                    <select value={form.semester} onChange={(e) => set('semester', e.target.value)}>
                      {['SEM1','SEM2','SEM3','SEM4','SEM5','SEM6'].map((s) => (
                        <option key={s} value={s}>{s.replace('SEM', 'Semester ')}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Division *</label>
                <select value={form.division} onChange={(e) => set('division', e.target.value)}>
                  {DIVISIONS.map((d) => <option key={d} value={d}>Division {d}</option>)}
                </select>
              </div>

              {error && <div className="error-msg">{error}</div>}
              <div className="form-row">
                <button type="button" className="btn-secondary" onClick={() => { setError(''); setStep(1); }}>← Back</button>
                <button type="button" className="btn-primary" onClick={goToStep3}>Next →</button>
              </div>
            </>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <>
              <h3 className="step-title">Confirm Details</h3>
              <div className="confirm-grid">
                <div className="confirm-item"><span>Name</span><strong>{form.name}</strong></div>
                <div className="confirm-item"><span>Roll No</span><strong>{form.rollNo}</strong></div>
                <div className="confirm-item"><span>Phone</span><strong>{form.phone}</strong></div>
                <div className="confirm-item"><span>College</span><strong>{form.collegeName}</strong></div>
                <div className="confirm-item"><span>Type</span><strong>{form.studentType}</strong></div>
                {form.studentType === 'JUNIOR' ? (
                  <>
                    <div className="confirm-item"><span>Std</span><strong>{form.juniorStd.replace('STD_', '')}th</strong></div>
                    <div className="confirm-item"><span>Stream</span><strong>{form.juniorStream}</strong></div>
                  </>
                ) : (
                  <>
                    <div className="confirm-item"><span>Year</span><strong>{form.degreeYear}</strong></div>
                    <div className="confirm-item"><span>Stream</span><strong>{form.degreeStream}</strong></div>
                    <div className="confirm-item"><span>Semester</span><strong>{form.semester}</strong></div>
                  </>
                )}
                <div className="confirm-item"><span>Division</span><strong>{form.division}</strong></div>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <div className="form-row">
                <button type="button" className="btn-secondary" onClick={() => { setError(''); setStep(2); }}>← Back</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Registering...' : '🎓 Register'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
