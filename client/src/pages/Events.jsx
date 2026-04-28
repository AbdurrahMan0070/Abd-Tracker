import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Clock, User, Plus, X, MessageCircle, Trash2 } from 'lucide-react';

const roleColor = { STUDENT: '#6366f1', TEACHER: '#059669', ADMIN: '#dc2626' };
const roleLabel = { STUDENT: 'Student', TEACHER: 'Teacher', ADMIN: 'Admin' };

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('upcoming'); // upcoming | past | all
  const [form, setForm] = useState({
    title: '', description: '', venue: '', eventDate: '',
    startTime: '', endTime: '', organizer: user?.name || '', whatsappLink: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchEvents = () => {
    api.get('/events').then((r) => setEvents(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError('Event title is required');
    if (!form.venue.trim()) return setFormError('Venue is required');
    if (!form.eventDate) return setFormError('Date is required');
    if (!form.startTime) return setFormError('Start time is required');
    if (!form.organizer.trim()) return setFormError('Organizer name is required');

    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/events', form);
      setShowForm(false);
      setForm({ title: '', description: '', venue: '', eventDate: '', startTime: '', endTime: '', organizer: user?.name || '', whatsappLink: '' });
      fetchEvents();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    await api.delete(`/events/${id}`).catch(console.error);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const openWhatsApp = (link, event) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      // Generate a share message
      const msg = encodeURIComponent(
        `📅 *${event.title}*\n📍 Venue: ${event.venue}\n🗓 Date: ${new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n⏰ Time: ${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}\n👤 Organizer: ${event.organizer}\n${event.description ? '\n' + event.description : ''}`
      );
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
  };

  const now = new Date();
  const filtered = events.filter((e) => {
    const d = new Date(e.eventDate);
    if (filter === 'upcoming') return d >= now;
    if (filter === 'past') return d < now;
    return true;
  });

  const upcoming = events.filter((e) => new Date(e.eventDate) >= now).length;

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading events...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📅 Events</h1>
          <p className="subtitle">{upcoming} upcoming event{upcoming !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Post Event
        </button>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {['upcoming', 'past', 'all'].map((f) => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Event Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2>📅 Post New Event</h2>
              <button className="btn-icon" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="auth-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Annual Sports Day" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Venue *</label>
                  <input value={form.venue} onChange={(e) => set('venue', e.target.value)} placeholder="e.g. College Auditorium" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Organizer Name *</label>
                <input value={form.organizer} onChange={(e) => set('organizer', e.target.value)} placeholder="Your name or department" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="What's this event about?" />
              </div>
              <div className="form-group">
                <label>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageCircle size={14} color="#25d366" /> WhatsApp Group Link <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                  </span>
                </label>
                <input value={form.whatsappLink} onChange={(e) => set('whatsappLink', e.target.value)} placeholder="https://chat.whatsapp.com/..." />
              </div>
              {formError && <div className="error-msg">{formError}</div>}
              <div className="form-row">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Posting...' : '📅 Post Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="events-list">
        {filtered.map((event) => {
          const isPast = new Date(event.eventDate) < now;
          const color = roleColor[event.organizerRole] || '#6366f1';
          const dateStr = new Date(event.eventDate).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          });

          return (
            <div key={event.id} className={`event-card ${isPast ? 'event-past' : ''}`}>
              <div className="event-date-badge">
                <span className="event-day">{new Date(event.eventDate).getDate()}</span>
                <span className="event-month">{new Date(event.eventDate).toLocaleString('en-IN', { month: 'short' })}</span>
              </div>

              <div className="event-body">
                <div className="event-top">
                  <h3 className="event-title">{event.title}</h3>
                  <span className="organizer-badge" style={{ color, background: `${color}15` }}>
                    {roleLabel[event.organizerRole] || 'Student'}
                  </span>
                </div>

                <div className="event-meta">
                  <span><MapPin size={13} /> {event.venue}</span>
                  <span><Clock size={13} /> {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>
                  <span><User size={13} /> {event.organizer}</span>
                  <span><Calendar size={13} /> {dateStr}</span>
                </div>

                {event.description && <p className="event-desc">{event.description}</p>}

                <div className="event-actions">
                  <button className="btn-whatsapp" onClick={() => openWhatsApp(event.whatsappLink, event)}>
                    <MessageCircle size={15} />
                    {event.whatsappLink ? 'Join WhatsApp Group' : 'Share on WhatsApp'}
                  </button>
                  {(event.createdBy === user?.id || user?.role === 'ADMIN') && (
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(event.id)} title="Delete event">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!filtered.length && (
          <div className="empty-page">
            <Calendar size={48} color="#d1d5db" />
            <p>No {filter !== 'all' ? filter : ''} events found</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Post the first event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
