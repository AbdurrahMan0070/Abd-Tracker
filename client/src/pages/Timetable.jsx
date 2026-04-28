import { useEffect, useState } from 'react';
import api from '../api/axios';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_SHORT = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat' };

const TODAY_MAP = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const todayDay = TODAY_MAP[new Date().getDay()];

export default function Timetable() {
  const [timetable, setTimetable] = useState({});
  const [activeDay, setActiveDay] = useState(todayDay !== 'SUNDAY' ? todayDay : 'MONDAY');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/timetable/me').then((r) => setTimetable(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading timetable...</p></div>;

  const dayClasses = timetable[activeDay] || [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>📅 Timetable</h1>
        <p className="subtitle">Your weekly class schedule</p>
      </div>

      <div className="day-tabs">
        {DAYS.map((day) => (
          <button
            key={day}
            className={`day-tab ${activeDay === day ? 'active' : ''} ${day === todayDay ? 'today' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {DAY_SHORT[day]}
            {day === todayDay && <span className="today-dot" />}
          </button>
        ))}
      </div>

      <div className="timetable-day">
        <h2 className="day-title">
          {activeDay.charAt(0) + activeDay.slice(1).toLowerCase()}
          {activeDay === todayDay && <span className="today-badge">Today</span>}
        </h2>

        {dayClasses.length > 0 ? (
          <div className="class-timeline">
            {dayClasses.map((cls, i) => (
              <div key={cls.id} className="timeline-item">
                <div className="timeline-time">
                  <span>{cls.startTime}</span>
                  <span className="time-end">{cls.endTime}</span>
                </div>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <h3>{cls.subject}</h3>
                  {cls.subjectCode && <span className="subject-code">{cls.subjectCode}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-page">
            <p>No classes scheduled for {activeDay.charAt(0) + activeDay.slice(1).toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
