import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import FileUpload from '../components/ui/FileUpload';
import { ArrowLeft, Plus, Trash2, Globe, ExternalLink, FileText, Image, Info, ShieldCheck } from 'lucide-react';

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New Item State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [attachments, setAttachments] = useState([]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile');
      if (res.data.success) {
        setPortfolio(res.data.user.portfolio || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch portfolio data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const imageUrl = attachments[0]?.url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80';
      const newItem = { title, description, link, image: imageUrl };
      const updatedPortfolio = [...portfolio, newItem];

      const res = await api.put('/users/profile', { portfolio: updatedPortfolio });
      if (res.data.success) {
        setPortfolio(updatedPortfolio);
        setSuccess('Project added to portfolio.');
        
        // Reset states
        setTitle('');
        setDescription('');
        setLink('');
        setAttachments([]);
        setIsAdding(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (indexToDelete) => {
    if (!window.confirm('Are you sure you want to remove this project?')) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedPortfolio = portfolio.filter((_, idx) => idx !== indexToDelete);
      const res = await api.put('/users/profile', { portfolio: updatedPortfolio });
      if (res.data.success) {
        setPortfolio(updatedPortfolio);
        setSuccess('Project removed successfully.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to remove project.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Back Link */}
        <Link to="/provider-dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Title */}
        <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
              My Portfolio <span className="gradient-text">Gallery</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Add mockups, code samples, or finished web applications to show off your talent to customers.
            </p>
          </div>
          
          {!isAdding && (
            <AnimatedButton variant="primary" onClick={() => setIsAdding(true)}>
              <Plus size={16} /> Add Project
            </AnimatedButton>
          )}
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
            <Info size={16} /> {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
            <ShieldCheck size={16} /> {success}
          </div>
        )}

        {/* Add Project Form Drawer */}
        {isAdding && (
          <GlassCard style={{ padding: '28px', marginBottom: '32px', borderLeft: '4px solid var(--primary)' }} className="animate-fade-in">
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
              Add a New Project
            </h3>
            
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text" className="form-input" placeholder="e.g. Real-Time Chat System"
                  value={title} onChange={e => setTitle(e.target.value)} required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Description</label>
                <textarea
                  className="form-input" style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Outline what you built, what tools you used, and what challenges you solved..."
                  value={description} onChange={e => setDescription(e.target.value)} required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Live Link (Optional)</label>
                <input
                  type="url" className="form-input" placeholder="e.g. https://my-portfolio-project.com"
                  value={link} onChange={e => setLink(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Project Thumbnail Image</label>
                <FileUpload onUploadComplete={(files) => setAttachments(files)} maxFiles={1} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <AnimatedButton type="button" variant="secondary" onClick={() => setIsAdding(false)} style={{ flex: 1 }}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton type="submit" variant="primary" loading={saving} style={{ flex: 2 }}>
                  Save Project Item
                </AnimatedButton>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Portfolio Listing Grid */}
        {portfolio.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--glass-bg)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎨</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              You haven't listed any portfolio items yet. Add your best work to get noticed by clients!
            </p>
            <AnimatedButton variant="primary" onClick={() => setIsAdding(true)}>
              Add Your First Project
            </AnimatedButton>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="portfolio-grid">
            {portfolio.map((item, index) => (
              <GlassCard key={index} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', width: '100%', background: 'var(--border-color)', position: 'relative' }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => handleDeleteItem(index)}
                    style={{
                      position: 'absolute', top: '12px', right: '12px',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(239,68,68,0.9)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', border: 'none', transition: 'transform 0.2s'
                    }}
                    title="Remove project"
                    className="delete-portfolio-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                      {item.description}
                    </p>
                  </div>
                  
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none'
                    }}>
                      Visit Project <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

      </div>
      <style>{`
        .delete-portfolio-btn:hover {
          transform: scale(1.1);
        }
        @media (max-width: 600px) {
          .portfolio-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Portfolio;
