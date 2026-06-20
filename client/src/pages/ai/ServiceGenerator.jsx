import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { SERVICE_CATEGORIES } from '../../utils/constants';
import { ArrowLeft, Wand2, Copy, Check, Sparkles, RefreshCw, FileText } from 'lucide-react';

const ServiceGenerator = () => {
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
  const [keywords, setKeywords] = useState('');
  const [suggestedTitle, setSuggestedTitle] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!keywords) {
      setError('Please provide at least one focus keyword.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);
    try {
      const res = await api.post('/ai/service-generator', {
        category,
        keywords,
        title: suggestedTitle || undefined
      });

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to connect to AI server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      const fullText = `Title: ${result.title}\n\nDescription:\n${result.description}\n\nTags: ${result.tags}`;
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Back Link */}
        <Link to="/ai" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to AI Tools
        </Link>

        {/* Title */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
            AI Service <span className="gradient-text">Generator</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Generate professional, highly descriptive catalog structures for your service listings instantly.
          </p>
        </div>

        {/* Layout Grid: Input Form + Result Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Form */}
          <GlassCard style={{ padding: '28px' }}>
            {error && (
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', marginBottom: '20px', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleGenerate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Service Category</label>
                  <select
                    className="form-input" style={{ width: '100%', cursor: 'pointer' }}
                    value={category} onChange={e => setCategory(e.target.value)}
                  >
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Suggested Title / Focus (Optional)</label>
                  <input
                    type="text" className="form-input" style={{ width: '100%' }}
                    placeholder="e.g. build ecommerce stores"
                    value={suggestedTitle} onChange={e => setSuggestedTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Core Focus Keywords (Comma separated)</label>
                <input
                  type="text" className="form-input" style={{ width: '100%' }}
                  placeholder="e.g. React, Redux Toolkit, Shopify Integration, Responsive UI"
                  value={keywords} onChange={e => setKeywords(e.target.value)} required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Provide up to 5 focus terms to structure description milestones.
                </span>
              </div>

              <AnimatedButton type="submit" variant="primary" loading={loading} style={{ width: '100%', padding: '12px' }}>
                Generate Listing Copilot <Wand2 size={16} />
              </AnimatedButton>
            </form>
          </GlassCard>

          {/* Results Render */}
          {result && (
            <GlassCard style={{ padding: '32px', border: '1px solid var(--primary-light)' }} className="animate-fade-in">
              <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--primary)" /> Generated Copilot Listing
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <AnimatedButton variant="secondary" onClick={handleCopy} style={{ padding: '6px 12px', fontSize: '12px' }}>
                    {copied ? <><Check size={14} color="#10b981" /> Copied</> : <><Copy size={14} /> Copy Statement</>}
                  </AnimatedButton>
                  <Link to="/services/create">
                    <AnimatedButton variant="primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Use to Create Listing
                    </AnimatedButton>
                  </Link>
                </div>
              </div>

              {/* Title Output */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Suggested Title</span>
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {result.title}
                </h4>
              </div>

              {/* Description Output */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Suggested Body Description (Markdown)</span>
                <pre style={{
                  background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px',
                  color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-sans)', border: '1px solid var(--border-color)',
                  lineHeight: '1.6'
                }}>
                  {result.description}
                </pre>
              </div>

              {/* Tags Output */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Generated Tags</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.tags.split(',').map((tag, idx) => (
                    <span key={idx} style={{
                      fontSize: '11px', fontWeight: '700', padding: '4px 10px',
                      borderRadius: '999px', background: 'var(--primary-glow)', color: 'var(--primary)'
                    }}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* FAQ Output */}
              {result.faqs && result.faqs.length > 0 && (
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '10px' }}>Generated FAQs</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {result.faqs.map((faq, i) => (
                      <div key={i} style={{ borderBottom: i < result.faqs.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '10px' }}>
                        <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Q: {faq.q}</h5>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>A: {faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </GlassCard>
          )}

        </div>

      </div>
    </div>
  );
};

export default ServiceGenerator;
