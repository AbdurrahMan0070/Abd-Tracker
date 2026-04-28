import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get('/admin/classes').then((r) => setClasses(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const addSubject = async (classId) => {
    if (!newSubject.name) return;
    setAdding(true);
    try {
      await api.post('/admin/subjects', { classId, name: newSubject.name, code: newSubject.code });
      const r = await api.get('/admin/classes');
      setClasses(r.data);
      setSelected(r.data.find((c) => c.id === classId));
      setNewSubject({ name: '', code: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    } finally {
      setAdding(false);
    }
  };

  const deleteSubject = async (subjectId, classId) => {
    if (!confirm('Delete this subject?')) return;
    await api.delete(`/admin/subjects/${subjectId}`);
    const r = await api.get('/admin/classes');
    setClasses(r.data);
    setSelected(r.data.find((c) => c.id === classId));
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header"><h1>🏫 Classes & Subjects</h1></div>

      <div className="two-col">
        <div className="card class-list-panel">
          <h2 className="card-title">All Classes</h2>
          {classes.map((cls) => (
            <div
              key={cls.id}
              className={`class-row clickable ${selected?.id === cls.id ? 'selected' : ''}`}
              onClick={() => setSelected(cls)}
            >
              <div>
                <strong>{cls.college?.name}</strong>
                <span className="class-meta">
                  {cls.studentType === 'JUNIOR'
                    ? `${cls.juniorStd?.replace('STD_', '')}th | ${cls.juniorStream}`
                    : `${cls.degreeYear} | ${cls.degreeStream} | ${cls.semester}`}
                  {' '}| Div {cls.division}
                </span>
              </div>
              <span className="student-count">{cls._count?.students} students</span>
            </div>
          ))}
        </div>

        {selected && (
          <div className="card subject-panel">
            <h2 className="card-title">Subjects in {selected.degreeStream || selected.juniorStream} Div {selected.division}</h2>

            <div className="subject-add-form">
              <input
                placeholder="Subject name"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              />
              <input
                placeholder="Code (optional)"
                value={newSubject.code}
                onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
              />
              <button className="btn-primary btn-sm" onClick={() => addSubject(selected.id)} disabled={adding}>
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="subject-list-admin">
              {selected.subjects?.map((s) => (
                <div key={s.id} className="subject-admin-row">
                  <span>{s.name}</span>
                  {s.code && <code>{s.code}</code>}
                  <button className="btn-icon btn-danger" onClick={() => deleteSubject(s.id, selected.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {!selected.subjects?.length && <p className="empty-state">No subjects yet. Add one above.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
