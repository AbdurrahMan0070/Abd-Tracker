import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function TeacherAssignments() {
  const [params] = useSearchParams();
  const classId = params.get('classId');

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classId || '');
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ subjectId: '', title: '', description: '', deadline: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/admin/classes').then((r) => setClasses(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const cls = classes.find((c) => c.id === parseInt(selectedClass));
    setSubjects(cls?.subjects || []);
    api.get(`/assignments/class/${selectedClass}`).then((r) => setAssignments(r.data)).catch(console.error);
  }, [selectedClass, classes]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/assignments', {
        classId: parseInt(selectedClass),
        subjectId: parseInt(form.subjectId),
        title: form.title,
        description: form.description,
        deadline: form.deadline,
      });
      setSuccess(true);
      setForm({ subjectId: '', title: '', description: '', deadline: '' });
      const r = await api.get(`/assignments/class/${selectedClass}`);
      setAssignments(r.data);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header"><h1>📝 Manage Assignments</h1></div>

      <div className="card">
        <div className="form-group">
          <label>Select Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">-- Choose Class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.college?.name} | {c.studentType === 'JUNIOR'
                  ? `${c.juniorStd?.replace('STD_', '')}th ${c.juniorStream}`
                  : `${c.degreeYear} ${c.degreeStream}`} Div {c.division}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedClass && (
        <>
          <div className="card">
            <h2 className="card-title">Create Assignment</h2>
            <form onSubmit={handleCreate} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Subject</label>
                  <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
                    <option value="">-- Select Subject --</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" required />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Details..." />
              </div>
              {success && <div className="success-msg">✅ Assignment created!</div>}
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Assignment'}</button>
            </form>
          </div>

          <div className="card">
            <h2 className="card-title">Existing Assignments</h2>
            {assignments.map((a) => (
              <div key={a.id} className="asgn-row">
                <div>
                  <strong>{a.title}</strong>
                  <span className="asgn-subject">{a.subject?.name}</span>
                </div>
                <span className="deadline-date">{new Date(a.deadline).toLocaleDateString()}</span>
              </div>
            ))}
            {!assignments.length && <p className="empty-state">No assignments yet</p>}
          </div>
        </>
      )}
    </div>
  );
}
