import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = ['PHONE', 'WALLET', 'BOOKS', 'LAPTOP', 'ACCESSORIES', 'DOCUMENTS', 'CLOTHING', 'KEYS', 'OTHER'];

export default function CreateLostFound() {
  const [form, setForm] = useState({
    type: 'LOST',
    itemName: '',
    description: '',
    category: 'PHONE',
    location: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.itemName.trim()) return setError('Item name is required');
    if (!form.description.trim()) return setError('Description is required');
    if (!form.location.trim()) return setError('Location is required');

    setError('');
    setLoading(true);

    try {
      await api.post('/lostfound', form);
      navigate('/lostfound');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/lostfound" className="btn-secondary btn-sm">
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 style={{ marginTop: '12px' }}>Post Lost/Found Item</h1>
          <p className="subtitle">Help others find their lost items or report found items</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="auth-form">
          
          <div className="form-group">
            <label>Type *</label>
            <div className="radio-group">
              <label className={`radio-option ${form.type === 'LOST' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="LOST"
                  checked={form.type === 'LOST'}
                  onChange={() => set('type', 'LOST')}
                />
                😢 I Lost Something
              </label>
              <label className={`radio-option ${form.type === 'FOUND' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="FOUND"
                  checked={form.type === 'FOUND'}
                  onChange={() => set('type', 'FOUND')}
                />
                🎉 I Found Something
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Item Name *</label>
            <input
              value={form.itemName}
              onChange={(e) => set('itemName', e.target.value)}
              placeholder="e.g., Black iPhone 13"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Provide detailed description (color, brand, unique features, etc.)"
              rows="4"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g., Library 2nd Floor, Canteen, Classroom 301"
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <span className="field-hint">
              Upload image to any image hosting service and paste the URL here
            </span>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Posting...' : `📢 Post ${form.type === 'LOST' ? 'Lost' : 'Found'} Item`}
          </button>
        </form>
      </div>
    </div>
  );
}
