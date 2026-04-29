import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Trash2, CheckCircle, MapPin, Calendar } from 'lucide-react';

const CATEGORY_ICONS = {
  PHONE: '📱',
  WALLET: '👛',
  BOOKS: '📚',
  LAPTOP: '💻',
  ACCESSORIES: '🎒',
  DOCUMENTS: '📄',
  CLOTHING: '👕',
  KEYS: '🔑',
  OTHER: '📦',
};

export default function MyLostFoundPosts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const { data } = await api.get('/lostfound/my-posts');
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    if (!confirm('Mark this item as resolved?')) return;
    
    try {
      await api.put(`/lostfound/${id}/resolve`);
      fetchMyPosts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resolve item');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    
    try {
      await api.delete(`/lostfound/${id}`);
      fetchMyPosts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/lostfound" className="btn-secondary btn-sm">
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 style={{ marginTop: '12px' }}>My Posts</h1>
          <p className="subtitle">Manage your lost & found posts</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-page">
          <p>You haven't posted any items yet</p>
          <Link to="/lostfound/create" className="btn-primary btn-sm">
            Post an Item
          </Link>
        </div>
      ) : (
        <div className="events-list">
          {items.map((item) => (
            <div key={item.id} className="event-card" style={{
              opacity: item.status === 'RESOLVED' ? 0.6 : 1,
            }}>
              <div className="event-date-badge" style={{ 
                background: item.type === 'LOST' ? '#ef4444' : '#22c55e' 
              }}>
                <div className="event-day" style={{ fontSize: '2rem' }}>
                  {CATEGORY_ICONS[item.category]}
                </div>
                <div className="event-month">{item.type}</div>
              </div>

              <div className="event-body">
                <div className="event-top">
                  <h3 className="event-title">{item.itemName}</h3>
                  <span className="organizer-badge" style={{
                    background: item.status === 'RESOLVED' ? '#dcfce7' : '#fef9c3',
                    color: item.status === 'RESOLVED' ? '#15803d' : '#a16207',
                  }}>
                    {item.status}
                  </span>
                </div>

                <p className="event-desc">{item.description}</p>

                <div className="event-meta">
                  <span><MapPin size={14} /> {item.location}</span>
                  <span><Calendar size={14} /> {new Date(item.date).toLocaleDateString()}</span>
                </div>

                {item.status === 'ACTIVE' && (
                  <div className="event-actions">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleResolve(item.id)}
                    >
                      <CheckCircle size={16} />
                      Mark as Resolved
                    </button>
                    <button
                      className="btn-secondary btn-sm btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}

                {item.status === 'RESOLVED' && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: 500 }}>
                      ✅ This item has been resolved
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
