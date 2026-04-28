import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Search } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = (q = '') => {
    setLoading(true);
    api.get(`/admin/students${q ? `?search=${q}` : ''}`)
      .then((r) => setStudents(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(search);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>👥 Students</h1>
        <p className="subtitle">{students.length} students found</p>
      </div>

      <form onSubmit={handleSearch} className="search-bar">
        <Search size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or roll number..."
        />
        <button type="submit" className="btn-primary btn-sm">Search</button>
      </form>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Attendance</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.rollNo}>
                  <td><code>{s.rollNo}</code></td>
                  <td>{s.name}</td>
                  <td>
                    <span className="class-meta">
                      {s.class?.studentType === 'JUNIOR'
                        ? `${s.class?.juniorStd?.replace('STD_', '')}th ${s.class?.juniorStream}`
                        : `${s.class?.degreeYear} ${s.class?.degreeStream}`}
                      {' '}Div {s.class?.division}
                    </span>
                  </td>
                  <td>
                    <div className="mini-progress">
                      <div className="mini-bar" style={{
                        width: `${s.overall?.percent || 0}%`,
                        background: s.overall?.risk === 'SAFE' ? '#22c55e' : s.overall?.risk === 'WARNING' ? '#f59e0b' : '#ef4444'
                      }} />
                    </div>
                    <span>{s.overall?.percent || 0}%</span>
                  </td>
                  <td>
                    <span className={`risk-pill risk-${(s.overall?.risk || 'safe').toLowerCase()}`}>
                      {s.overall?.risk || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="table-loading">Loading...</div>}
          {!loading && !students.length && <p className="empty-state">No students found</p>}
        </div>
      </div>
    </div>
  );
}
