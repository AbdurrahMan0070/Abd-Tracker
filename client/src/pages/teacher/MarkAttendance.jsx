import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function MarkAttendance() {
  const [params] = useSearchParams();
  const classId = params.get('classId');

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classId || '');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/admin/classes').then((r) => setClasses(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const cls = classes.find((c) => c.id === parseInt(selectedClass));
    setSubjects(cls?.subjects || []);
    setSelectedSubject('');
    setStudents([]);
  }, [selectedClass, classes]);

  useEffect(() => {
    if (!selectedClass) return;
    api.get(`/attendance/class/${selectedClass}`).then((r) => {
      setStudents(r.data);
      const init = {};
      r.data.forEach((s) => { init[s.rollNo] = true; });
      setAttendance(init);
    }).catch(console.error);
  }, [selectedClass]);

  const toggle = (rollNo) => setAttendance((prev) => ({ ...prev, [rollNo]: !prev[rollNo] }));

  const handleSubmit = async () => {
    if (!selectedSubject) return alert('Select a subject');
    setLoading(true);
    try {
      const records = students.map((s) => ({ rollNo: s.rollNo, attended: attendance[s.rollNo] ?? true }));
      await api.post('/attendance/mark', { subjectId: parseInt(selectedSubject), records });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>✅ Mark Attendance</h1>
      </div>

      <div className="card">
        <div className="form-row">
          <div className="form-group">
            <label>Select Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">-- Choose Class --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.college?.name} | {c.studentType === 'JUNIOR'
                    ? `${c.juniorStd?.replace('STD_', '')}th ${c.juniorStream}`
                    : `${c.degreeYear} ${c.degreeStream} ${c.semester}`} Div {c.division}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Select Subject</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!subjects.length}>
              <option value="">-- Choose Subject --</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="card">
          <div className="attendance-header">
            <h2 className="card-title">Students ({students.length})</h2>
            <div className="bulk-actions">
              <button className="btn-sm btn-secondary" onClick={() => {
                const all = {};
                students.forEach((s) => { all[s.rollNo] = true; });
                setAttendance(all);
              }}>All Present</button>
              <button className="btn-sm btn-secondary" onClick={() => {
                const all = {};
                students.forEach((s) => { all[s.rollNo] = false; });
                setAttendance(all);
              }}>All Absent</button>
            </div>
          </div>

          <div className="student-attendance-list">
            {students.map((s) => (
              <div key={s.rollNo} className={`student-att-row ${attendance[s.rollNo] ? 'present' : 'absent'}`}>
                <div className="student-info">
                  <span className="roll-no">{s.rollNo}</span>
                  <span className="student-name">{s.name}</span>
                  <span className="current-att">{s.overall?.percent || 0}%</span>
                </div>
                <button
                  className={`att-toggle ${attendance[s.rollNo] ? 'present' : 'absent'}`}
                  onClick={() => toggle(s.rollNo)}
                >
                  {attendance[s.rollNo] ? '✅ Present' : '❌ Absent'}
                </button>
              </div>
            ))}
          </div>

          <div className="submit-row">
            {submitted && <span className="success-msg">✅ Attendance marked successfully!</span>}
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
