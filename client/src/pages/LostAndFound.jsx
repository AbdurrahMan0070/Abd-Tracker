import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, Plus, Phone, MapPin, Calendar, User, Package } from 'lucide-react';

const CATEGORIES = ['ALL', 'PHONE', 'WALLET', 'BOOKS', 'LAPTOP', 'ACCESSORIES', 'DOCUMENTS', 'CLOTHING', 'KEYS', 'OTHER'];

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

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/lostfound');
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = filter === 'ALL' || item.category === filter;
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesSearch = search === '' || 
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
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
          <h1>🔍 Lost & Found</h1>
          <p className="subtitle">Help find lost items or report found items</p>
        </div>
        <Link to="/lostfound/create" className="btn-primary">
          <Plus size={18} />
          Post Item
        </Link>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by item name, description, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Type Filter */}
      <div className="filter-tabs">
        {['ALL', 'LOST', 'FOUND'].map((type) => (
          <button
            key={type}
            className={`filter-tab ${typeFilter === type ? 'active' : ''}`}
            onClick={() => setTypeFilter(type)}
          >
            {type === 'LOST' ? '😢' : type === 'FOUND' ? '🎉' : '📋'} {type}
            <span className="tab-count">
              {type === 'ALL' ? items.length : items.filter(i => i.type === type).length}
            </span>
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="filter-tabs" style={{ flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat !== 'ALL' && CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="empty-page">
          <Package size={48} />
          <p>No items found</p>
          <Link to="/lostfound/create" className="btn-primary btn-sm">
            Post an Item
          </Link>
        </div>
      ) : (
        <div className="events-list">
          {filteredItems.map((item) => (
            <div key={item.id} className="event-card">
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
                    background: item.type === 'LOST' ? '#fee2e2' : '#dcfce7',
                    color: item.type === 'LOST' ? '#b91c1c' : '#15803d',
                  }}>
                    {item.category}
                  </span>
                </div>

                <p className="event-desc">{item.description}</p>

                <div className="event-meta">
                  <span><MapPin size={14} /> {item.location}</span>
                  <span><Calendar size={14} /> {new Date(item.date).toLocaleDateString()}</span>
                  <span><User size={14} /> {item.studentName} ({item.classInfo})</span>
                </div>

                <div className="event-actions">
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => handleCall(item.phone)}
                  >
                    <Phone size={16} />
                    Call {item.studentName.split(' ')[0]}
                  </button>
                  <a
                    href={`https://wa.me/${item.phone.replace(/\D/g, '')}?text=Hi, I saw your ${item.type.toLowerCase()} item post about ${item.itemName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary btn-sm"
                    style={{ background: '#25d366', color: '#fff' }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Posts Link */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/lostfound/my-posts" className="card-link">
          View My Posts →
        </Link>
      </div>
    </div>
  );
}
